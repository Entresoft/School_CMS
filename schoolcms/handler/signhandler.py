#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS user login handlers.

handlers.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import re

from . import BaseHandler

from schoolcms.db import User


class LoginHandler(BaseHandler):
    def get(self):
        if self.current_user:
            raise self.HTTPError(404)

        next_page = self.get_argument('next', '/')
        self.write({
                '_xsrf': self.xsrf_token,
                'alert': '',
                'next': next_page,
            })

    def post(self):
        if self.current_user:
            raise self.HTTPError(404)

        self._ = dict()
        self._['account'] = self.get_argument('account', '')
        self._['passwd'] = self.get_argument('passwd', '')
        self._['next'] = self.get_argument('next', '/')

        user = self.login()
        if not user:
            del self._['passwd']
            self.write(self._)
        else:
            self.set_secure_cookie('uid', unicode(user.key))
            self.write({'success':True,'next':self._['next']})

    def login(self):
        if not re.match(r'^[a-zA-Z0-9]{4,20}$', self._['account']):
            self._['alert'] = '無效的帳號或密碼'
            return None
        elif not re.match(r'^.{4,20}$', self._['passwd']):
            self._['alert'] = '帳號或密碼錯誤'
            return None
        
        q = self.sql_session.query(User)
        q = q.filter(User.account == self._['account'])
        user = q.first()

        if not user or not user.check_passwd(self._['passwd']):
            self._['alert'] = '帳號或密碼錯誤'
            return None
        else:
            return user


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie('uid')
        self.write({'logout':True})
