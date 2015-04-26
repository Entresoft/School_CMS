#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

handlers.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler

from schoolcms.db import Announce
from sqlalchemy import desc


class AnnounceHandler(BaseHandler):
    def get(self, ann_id):
        if ann_id:
            q = self.sql_session.query(Announce)
            q = q.filter(Announce.id == ann_id)
            ann = q.first()
            if ann:
                self.render('ann/announce.html',ann=ann)
            else:
                raise self.HTTPError(404)
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
            'error_msg' : '',
        }

    @BaseHandler.is_admin_user
    def get(self):
        self.render('ann/newann.html',**self._)

    @BaseHandler.is_admin_user
    def post(self):
        self._['title'] = self.get_argument('title','')
        self._['content'] = self.get_argument('content','')

        has_error = False
        if not self._['title']:
            self._['error_msg'] = 'Title can\'t leave blank.'
            has_error = True

        if has_error:
            return self.render('ann/newann.html',**self._)

        self._['author_id'] = self.current_user.id
        new_ann = Announce(**self._)
        self.sql_session.add(new_ann)
        self.sql_session.commit()

        self.redirect('/announce')
