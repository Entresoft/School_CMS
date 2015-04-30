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

from schoolcms.db import Announce, TempFileList, AttachmentList
from sqlalchemy import desc

try:
    xrange
except NameError:
    xrange = range


class AnnounceHandler(BaseHandler):
    def get(self, ann_id):
        if ann_id:
            q = self.sql_session.query(Announce)
            q = q.filter(Announce.id == ann_id)
            ann = q.scalar()
            if not ann:
                raise self.HTTPError(404)
            
            q = self.sql_session.query(AttachmentList)
            q = q.filter(AttachmentList.ann_id == ann.id)
            atts = q.all()
            self.render('ann/announce.html',ann=ann, atts=atts)

        else:
            q = self.sql_session.query(Announce)
            q = q.order_by(Announce.created.desc())
            anns = q.all()
            self.render('ann/annindex.html',anns=anns)


class NewAnnHandler(BaseHandler):
    def prepare(self):
        super(NewAnnHandler, self).prepare()
        self._ = {
            'title' : '',
            'content' : '',
            'attachments' : [],
            'error_msg' : '',
        }

    @BaseHandler.is_admin_user
    def get(self):
        self.render('ann/newann.html',**self._)

    @BaseHandler.is_admin_user
    def post(self):
        self._['title'] = self.get_argument('title', '')
        self._['content'] = self.get_argument('content', '')
        self._['attachments'] = self.get_arguments('attachment')

        has_error = False
        self.attachments = []
        if not self._['title']:
            self._['error_msg'] = 'Title can\'t leave blank.'
            has_error = True
        elif not self._['content']:
            self._['error_msg'] = 'Content can\'t leave blank.'
            has_error = True
        else:
            for i in xrange(len(self._['attachments'])):
                if self._['attachments'][i]:
                    q = self.sql_session.query(TempFileList)
                    q = q.filter(TempFileList.key == self._['attachments'][i])
                    try:
                        new_att = q.one()
                        assert new_att.author_id == self.current_user.id
                        self.attachments.append()

                    except:
                        self._['error_msg'] = 'Miss attachment!'
                        has_error = True
                        self._['attachments'][i] = ''

        if has_error:
            return self.render('ann/newann.html',**self._)

        self._['author_id'] = self.current_user.id
        new_ann = Announce(**self._)
        self.sql_session.add(new_ann)
        self.sql_session.flush()
        self.sql_session.refresh(new_ann)
        
        for att in self.attachments:
            if not os.path.exists('file/%s' % att.key):
                os.makedirs('file/%s' % att.key)
            os.rename('file/tmp/%s' % att.key, 'file/%s/%s' % (att.key, att.filename))
            new_att = AttachmentList(att.key, new_ann.id, att.content_type, '%s/%s' % (att.key, att.filename))
            self.sql_session.add(new_att)
            self.sql_session.query(TempFileList).filter(TempFileList.key == att.key).delete()

        self.sql_session.commit()

        self.redirect('/announce')
