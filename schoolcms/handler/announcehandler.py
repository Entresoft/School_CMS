#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

handlers.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
from ..db import Announce, AnnTag, TempFileList, AttachmentList, Record, GroupList

import os
import shutil
import re
from markdown import markdown
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

from sqlalchemy import desc

try:
    xrange
except NameError:
    xrange = range


def _to_int(s, default, mi=None, mx=None):
    if not s.isdigit():
        return default
    _n = int(s)
    if mi != None and _n < mi:
        return default
    if mx != None and _n > mx:
        return default
    return _n


class AnnounceHandler(BaseHandler):
    def get(self, ann_id):
        # Ann Page
        if ann_id:
            ann = Announce.by_id(ann_id, self.sql_session).scalar()
            if not ann:
                raise self.HTTPError(404)
            if ann.is_private and not self.is_group_user('Announcement Manager'):
                raise self.HTTPError(404)

            atts = AttachmentList.by_ann_id(ann_id, self.sql_session).all()

            self.ann_d = ann.to_dict()
            self.ann_d['tags'] = AnnTag.get_ann_tags(ann_id, self.sql_session)
            self.ann_d['atts'] = [att.to_dict() for att in atts]
            
            meta = {
                'title': self.ann_d['title'],
                'uri': '/announce/%s' % self.ann_d['id'],
                'content': BeautifulSoup(markdown(self.ann_d['content']), 'html.parser').text,
            }
            self.set_header('Cache-Control', 'max-age=300')
            self.page_render(self.ann_d, 'announce.html', meta=meta)

        # AnnIndex Page
        else:
            start = _to_int(self.get_argument('start', '0'), -1, 0, 10000000000000000000)
            step = _to_int(self.get_argument('step', '12'), 0, 1, 20)
            search = self.get_argument('search', '')
            group = self.get_argument('group', '')
            author = self.get_argument('author', '')
            hours = _to_int(self.get_argument('hours', ''), 0, 1, 23999999976)

            if start == -1 or step == 0:
                raise self.HTTPError(400)

            q = self.sql_session.query(Announce)
            if search:
                q = q.filter(Announce.full_text_search(search))
            else:
                q = q.order_by(Announce.created.desc())

            if author:
                q = q.filter(Announce.author_name == author)
            if group:
                q = q.filter(Announce.author_group_name == group)

            if hours:
                start_time = datetime.utcnow() - timedelta(hours=hours)
                q = q.filter(Announce.created >= start_time)

            if not self.is_group_user('Announcement Manager'):
                q = q.filter(Announce.is_private == False)

            total = q.count()
            q = q.offset(start).limit(step)
            anns = q.all()

            groups = self.sql_session.query(Announce.author_group_name).group_by(Announce.author_group_name).all()
            authors = self.sql_session.query(Announce.author_name).group_by(Announce.author_name).all()

            def _make_ann(ann):
                _d = ann.to_dict()
                del _d['content']
                _d['tags'] = AnnTag.get_ann_tags(ann.id, self.sql_session)
                return _d
            self.set_header('Cache-Control', 'max-age=300')
            self.page_render({
                    'anns' : [_make_ann(ann) for ann in anns],
                    'search' : search,
                    'start' : start,
                    'groups' : groups,
                    'authors' : authors,
                    'total' : total,
                })

    @BaseHandler.check_is_group_user('Announcement Manager')
    def delete(self, ann_id):
        if not ann_id:
            raise self.HTTPError(404)
        if not Announce.by_id(ann_id, self.sql_session).scalar():
            raise self.HTTPError(404)

        q = AttachmentList.by_ann_id(ann_id, self.sql_session)
        old_atts = q.all()
        for old_att in old_atts:
            shutil.rmtree('file/%s' % old_att.key)
        q.delete()
        Announce.by_id(ann_id, self.sql_session).delete()

        self.write({'success':True})


tag_re = re.compile(r'^[^\s,][^,]*[^\s,]$')

class EditAnnHandler(BaseHandler):
    def prepare(self):
        super(EditAnnHandler, self).prepare()
        self._ = {
            'id': '',
            'title': '',
            'content': '',
            'is_private': False,
            'group': '',
            'tmpatts': [],
            'atts': [],
            'tags': [],
            'alert': '',
        }

    @BaseHandler.check_is_group_user('Announcement Manager')
    def get(self, ann_id):
        if ann_id:
            ann = Announce.by_id(ann_id, self.sql_session).scalar()
            if not ann:
                raise self.HTTPError(404)
            self._['ann_id'] = ann_id
            self._['title'] = ann.title
            self._['content'] = ann.content
            self._['is_private'] = ann.is_private
            atts = AttachmentList.by_ann_id(ann_id, self.sql_session).all()
            self._['tags'] = AnnTag.get_ann_tags(ann_id, self.sql_session)
            self._['atts'] = [att.to_dict() for att in atts]
            if self.is_group_user(ann.author_group_name):
                self._['group'] = ann.author_group_name

        self._['user_groups'] = GroupList.get_user_groups(self.current_user.key, self.sql_session)

        self.page_render(self._)

    @BaseHandler.check_is_group_user('Announcement Manager')
    def post(self, ann_id):
        self.ann_id = ann_id if ann_id else ''
        del ann_id
        del self._['atts']
        self._['id'] = self.ann_id
        self._['title'] = self.get_argument('title', '')
        self._['content'] = self.get_argument('content', '')
        self.group = self.get_argument('group', '')
        self._['is_private'] = bool(self.get_argument('is_private', ''))
        self._['tags'] = self.get_arguments('tag')
        self.attkeys = self.get_arguments('attachment')

        # check ann and att
        if not self.check_ann():
            self._['tmpatts'] = [att.to_dict() for att in self._['tmpatts']]
            return self.write(self._)

        self._['author_name'] = self.current_user.name

        if self.ann_id:
            Announce.by_id(self.ann_id, self.sql_session).update({
                    'title' : self._['title'],
                    'content' : self._['content'],
                    'author_group_name' : self._['author_group_name'],
                    'author_name' : self._['author_name'],
                    'is_private' : self._['is_private'],
                })
            Record.add('update', self.ann_id, self.sql_session)
        else:
            new_ann = Announce(**self._)
            self.sql_session.add(new_ann)
            self.sql_session.flush()
            self.sql_session.refresh(new_ann)
            self.ann_id = new_ann.id
            Record.add('new', self.ann_id, self.sql_session)

        self.parse_att()
        self.parse_tag()

        self.sql_session.commit()
        self.write({'success': True,'id': self.ann_id})

    def check_ann(self):
        for i in xrange(len(self.attkeys)):
            if self.attkeys[i]:
                q = self.sql_session.query(TempFileList)
                q = q.filter(TempFileList.key == self.attkeys[i])
                try:
                    new_tmpatt = q.one()
                    if new_tmpatt.author_key != self.current_user.key:
                        raise ValueError('user key error!')
                    if not os.path.exists('file/tmp/%s' % new_tmpatt.key):
                        raise ValueError('att lost!')
                    self._['tmpatts'].append(new_tmpatt)
                except ValueError:
                    self._['alert'] = '遺失附件!'
        if self._['alert']:
            return False

        if not self._['title']:
            self._['alert'] = '標題不能空白'
            return False
        elif not self._['content']:
            self._['alert'] = '內容不能空白'
            return False
        elif not self.group or not GroupList.check(self.current_user.key, self.group, self.sql_session):
            self._['alert'] = '沒有選擇群組或群組不存在'
            return False

        self._['author_group_name'] = self.group

        return True

    def parse_att(self):
        for att in self._['tmpatts']:
            os.makedirs('file/%s' % att.key)
            os.rename('file/tmp/%s' % att.key, 'file/%s/%s' % (att.key, att.filename))
            new_att = AttachmentList(key=att.key, ann_id=self.ann_id, 
                                    content_type=att.content_type, filename=att.filename)
            self.sql_session.add(new_att)
            TempFileList.by_key(att.key, self.sql_session).delete()

    def parse_tag(self):
        for i in xrange(len(self._['tags'])):
            self._['tags'][i] = self._['tags'][i][:40:]
            if not tag_re.match(self._['tags'][i]):
                del self._['tags'][i]

        old_tags = AnnTag.get_ann_tags(self.ann_id, self.sql_session)
        new_tag_set = set(self._['tags'])
        old_tag_set = set(old_tags)

        add_set = new_tag_set - old_tag_set
        delete_set = old_tag_set - new_tag_set

        for tag in add_set:
            self.sql_session.add(AnnTag(self.ann_id, tag))
        for tag in delete_set:
            AnnTag.by_tag(self.ann_id, tag, self.sql_session).delete()
