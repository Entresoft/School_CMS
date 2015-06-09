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

from schoolcms.db import Announce, TempFileList, AttachmentList, Record
from sqlalchemy import desc

try:
    xrange
except NameError:
    xrange = range


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
            start = self.get_argument('start', '')
            search = self.get_argument('search', '')
            if not start.isdigit():
                start = 0
            start = int(start)

            total = 0
            if search:
                q = Announce.by_full_text(search, self.sql_session)
                total = q.count()
            else:
                total = self.sql_session.query(Announce.id).count()
                q = self.sql_session.query(Announce)
                q = q.order_by(Announce.created.desc())
            q = q.offset(start).limit(10)
            anns = q.all()

            self.write({
                    'anns' : [{
                        'title': ann.title,
                        'id' : ann.id,
                        'created' : ann.created.strftime("%Y-%m-%d %H:%M:%S"),} for ann in anns],
                    'search' : search,
                    'start' : start,
                    'total' : total,
                })


class EditAnnHandler(BaseHandler):
    def prepare(self):
        super(EditAnnHandler, self).prepare()
        self._ = {
            'title': '',
            'content': '',
            'id': '',
            'tmpatts': [],
            'atts': [],
            '_xsrf': self.xsrf_token,
            'alert': '',
        }

    @BaseHandler.is_group_user(1)
    def get(self, ann_id):
        if ann_id:
            ann = Announce.by_id(ann_id, self.sql_session).scalar()
            if not ann:
                raise self.HTTPError(404)
            self._['title'] = ann.title
            self._['content'] = ann.content
            self._['ann_id'] = ann_id
            atts = AttachmentList.by_ann_id(ann_id, self.sql_session).all()
            self._['atts'] = [att.to_dict() for att in atts]

        self.write(self._)

    @BaseHandler.is_group_user(1)
    def post(self, ann_id):
        self.ann_id = ann_id if ann_id else ''
        del ann_id
        self._['id'] = self.ann_id
        self._['title'] = self.get_argument('title', '')
        self._['content'] = self.get_argument('content', '')
        self.attkeys = self.get_arguments('attachment')

        # check ann and att
        if not self.check_ann():
            return self.write(self._)

        self._['author_key'] = self.current_user.key

        if self.ann_id:
            Announce.by_id(self.ann_id, self.sql_session).update({
                    'title' : self._['title'],
                    'content' : self._['content'],
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
                    new_att = q.one()
                    assert new_att.author_key == self.current_user.key
                    assert os.path.exists('file/tmp/%s' % new_att.key)
                    self._['tmpatts'].append(new_att)

                except:
                    self._['alert'] = '遺失附件!'
                    return False

        if not self._['title']:
            self._['alert'] = '標題不能空白'
            return False
        elif not self._['content']:
            self._['alert'] = '內容不能空白'
            return False
            
        return True

    def parse_att(self):
        for att in self._['tmpatts']:
            if not os.path.exists('file/%s' % att.key):
                os.makedirs('file/%s' % att.key)
            os.rename('file/tmp/%s' % att.key, 'file/%s/%s' % (att.key, att.filename))
            new_att = AttachmentList(key=att.key, ann_id=self.ann_id, 
                                    content_type=att.content_type, path='%s/%s' % (att.key, att.filename))
            self.sql_session.add(new_att)
            TempFileList.by_key(att.key, self.sql_session).delete()
