#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS user login handlers.

handlers.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
from ..db import User, Login_Session

import re


class LoginHandler(BaseHandler):
    def post(self):
        if self.current_user:
            raise self.HTTPError(403)

        self._ = dict()
        self._['account'] = self.get_argument('account', '')
        self._['passwd'] = self.get_argument('passwd', '')
        self._['next'] = self.get_argument('next', '/')

        user = self.login()
        if not user:
            del self._['passwd']
            self.write(self._)
        else:
            login_session = Login_Session(user.key)
            self.sql_session.add(login_session)
            Login_Session.clear_old(self.sql_session)
            self.sql_session.commit()

            self.set_secure_cookie('session_key', login_session.key)
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
        session_key = self.get_secure_cookie('session_key')
        if session_key:
            Login_Session.delete_by_key(session_key, self.sql_session)
            Login_Session.clear_old(self.sql_session)
            self.sql_session.commit()

        self.clear_cookie('session_key')
        self.write({'logout':True})
