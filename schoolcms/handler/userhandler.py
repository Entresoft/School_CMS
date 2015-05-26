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
                'alert': None,
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
            self.write({'login':True,'next':self._['next']})

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


class AddUserHandler(BaseHandler):
    def prepare(self):
        super(AddUserHandler, self).prepare()
        self._ = {
            'account' : '',
            'passwd' : '',
            'name' : '',
            'student' : True,
            'admin' : False,
            'error_msg' : '',
        }

    @BaseHandler.is_admin_user
    def get(self):
        self.render('user/adduser.html', **self._)

    @BaseHandler.is_admin_user
    def post(self):
        self._['account'] = self.get_argument('account', '')
        self._['passwd'] = self.get_argument('passwd', '')
        self._['name'] = self.get_argument('name', '')
        self._['identity'] = self.get_argument('identity', '')
        self._['admin'] = bool(self.get_argument('admin', ''))
        self._['student'] = self._['identity'] != '教師'

        user = self.add_user()
        if user:
            self.sql_session.add(user)
            self.sql_session.commit()
            self._={
                'account' : '',
                'passwd' : '',
                'name' : '',
                'student' : True,
                'admin' : False,
                'error_msg' : 'Add User Success!!',
            }
        
        self.render('user/adduser.html', **self._)


    def add_user(self):
        if not re.match(r'^[a-zA-Z0-9]{4,20}$', self._['account']):
            self._['error_msg'] = '帳號格式錯誤'
            return None
        elif not re.match(r'^.{4,20}$', self._['passwd']):
            self._['error_msg'] = '密碼格式錯誤'
            return None
        elif not re.match(r'^[\S]{0,15}$', self._['name']):
            self._['error_msg'] = '姓名格式錯誤'
            return None
        elif not (self._['identity'] == '學生' or self._['identity'] == '教師'):
            self._['error_msg'] = '錯誤'
            return None
        else:
            q = self.sql_session.query(User.account)
            q = q.filter(User.account == self._['account'])
            if q.first():
                self._['error_msg'] = '帳號已被使用'
                return None

        self._['name'] = unicode(self._['name'])
        return User(**self._)
