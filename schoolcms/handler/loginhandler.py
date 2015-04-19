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
    def prepare(self):
        super(LoginHandler, self).prepare()
        self._ = {
            'account' : '',
            'error_msg' : '',
            'next_page' : '',
        }

    def get(self):
        self._['next_page'] = self.get_argument('next', '/')
        self.render('user/login.html', **self._)

    def post(self):
        self._['account'] = self.get_argument('account', '')
        self._['passwd'] = self.get_argument('passwd', '')
        self._['next_page'] = self.get_argument('next', '/')

        user = self.login()
        if not user:
            self.render('user/login.html', **self._)
        else:
            self.set_secure_cookie('uid',unicode(user.id))
            self.redirect(self._['next_page'])

    def login(self):
        if not re.match(r'^[a-z]{6,20}$', self._['account']):
            self._['error_msg'] = '無效的帳號或密碼'
            return None
        elif not re.match(r'^.{8,20}$', self._['passwd']):
            self._['error_msg'] = '帳號或密碼錯誤'
            return None
        
        q = self.sql_session.query(User)
        q = q.filter(User.account == self._['account'])
        user = q.first()

        if not user or not user.check_passwd(self._['passwd']):
            self._['error_msg'] = '帳號或密碼錯誤'
            return None
        else:
            return user


class LogoutHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            self.error(403)
        else :
            self.clear_cookie('uid')
            self.redirect('/')


class AddUserHandler(BaseHandler):
    def get(self):
        pass

    def post(self):
        pass
