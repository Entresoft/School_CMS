#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-schoolcms-group."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler

from schoolcms.db import Group, GroupList, User


class GroupHandler(BaseHandler):
    def get(self):
        q = self.sql_session.query(Group)
        groups = q.all()
        self.render('group.html', groups=groups)


class UserHandler(BaseHandler):
    def get(self):
        q = self.sql_session.query(User)
        total = q.count()
        q = q.limit(10)
        users = q.all()
        users_list = [user.to_dict() for user in users]
        for user_d in users_list:
            user_groups = GroupList.get_user_groups(user_d['key'], self.sql_session)
            user_d['groups'] = [group.to_dict() for group in user_groups]

        q = self.sql_session.query(Group)
        groups = q.all()

        self.write({
                'users': users_list,
                'groups': [group.to_dict() for group in groups if not group.id==1000],
                'total': total,
            })


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

    @BaseHandler.check_is_admin_user
    def get(self):
        self.render('user/adduser.html', **self._)

    @BaseHandler.check_is_admin_user
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
