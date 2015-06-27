#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

handlers.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
import os
import shutil

from schoolcms.db import Announce, TempFileList, AttachmentList, Record, GroupList
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
        if ann_id:
            ann = Announce.by_id(ann_id, self.sql_session).scalar()
            if not ann:
                raise self.HTTPError(404)

            atts = AttachmentList.by_ann_id(ann_id, self.sql_session).all()

            self._ = ann.to_dict()
            self._['atts'] = [att.to_dict() for att in atts]
            self.write(self._)

        else:
            start = _to_int(self.get_argument('start', ''), 0, 0)
            step = _to_int(self.get_argument('step', ''), 12, 1, 20)
            search = self.get_argument('search', '')

            total = 0
            if search:
                q = Announce.by_full_text(search, self.sql_session)
                total = q.count()
            else:
                total = self.sql_session.query(Announce.id).count()
                q = self.sql_session.query(Announce)
                q = q.order_by(Announce.created.desc())
            q = q.offset(start).limit(step)
            anns = q.all()

            def _make_ann(ann):
                _d = ann.to_dict()
                _d['att_count'] = AttachmentList.count_by_ann_id(ann.id, self.sql_session)
                return _d
            self.write({
                    'anns' : [_make_ann(ann) for ann in anns],
                    'search' : search,
                    'start' : start,
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


class EditAnnHandler(BaseHandler):
    def prepare(self):
        super(EditAnnHandler, self).prepare()
        self._ = {
            'id': '',
            'title': '',
            'content': '',
            'is_private': False,
            'tmpatts': [],
            'atts': [],
            '_xsrf': self.xsrf_token,
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
            self._['atts'] = [att.to_dict() for att in atts]

        self._['user_groups'] = GroupList.get_user_groups(self.current_user.key, self.sql_session)

        self.write(self._)

    @BaseHandler.check_is_group_user('Announcement Manager')
    def post(self, ann_id):
        self.ann_id = ann_id if ann_id else ''
        del ann_id
        self._['id'] = self.ann_id
        self._['title'] = self.get_argument('title', '')
        self._['content'] = self.get_argument('content', '')
        self.group = self.get_argument('group', '')
        self._['is_private'] = bool(self.get_argument('is_private', ''))
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

        self.sql_session.commit()
        self.write({'success': True,'id': self.ann_id})

    def check_ann(self):
        for i in xrange(len(self.attkeys)):
            if self.attkeys[i]:
                q = self.sql_session.query(TempFileList)
                q = q.filter(TempFileList.key == self.attkeys[i])
                try:
                    new_tmpatt = q.one()
                    assert new_tmpatt.author_key == self.current_user.key
                    assert os.path.exists('file/tmp/%s' % new_tmpatt.key)
                    self._['tmpatts'].append(new_tmpatt)
                except:
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
