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
        q = self.sql_session.query(Announce)
        q = q.order_by(Announce.created.desc())
        ann = q.all()
        self.render('ann/announce.html',ann=ann)


class NewAnnHandler(BaseHandler):
    def prepare(self):
        super(NewAnnHandler, self).prepare()
        self.kw = dict()
        self.kw['title'] = ''
        self.kw['content'] = ''
        self.kw['error_msg'] = ''

    def get(self):
        self.render('ann/newann.html',**self.kw)

    def post(self):
        self.kw['title'] = self.get_argument('title','')
        self.kw['content'] = self.get_argument('content','')

        has_error = False
        if not self.kw['title']:
            self.kw['error_msg'] = 'Title can\'t leave blank.'
            has_error = True

        if has_error:
            return self.render('ann/newann.html',**self.kw)

        new_ann = Announce(**self.kw)
        self.sql_session.add(new_ann)
        self.sql_session.commit()

        self.redirect('/announce')
