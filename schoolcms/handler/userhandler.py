#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-schoolcms-group."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler

from schoolcms.db import GroupList, User


class GroupHandler(BaseHandler):
    @BaseHandler.check_is_admin_user
    def post(self):
        userkeys = self.get_arguments('userkey')
        group = self.get_argument('group')

        for userkey in userkeys:
            if not User.by_key(userkey, self.sql_session).scalar():
                raise self.HTTPError(400)
            if not GroupList.check(userkey, group, self.sql_session):
                self.sql_session.add(GroupList(userkey, group))

        self.sql_session.commit()
        self.write({
                'success': True,
            })

    @BaseHandler.check_is_admin_user
    def delete(self):
        userkeys = self.get_arguments('userkey')
        group = self.get_argument('group')

        for userkey in userkeys:
            if not User.by_key(userkey, self.sql_session).scalar():
                raise self.HTTPError(400)
            if GroupList.check(userkey, group, self.sql_session):
                q = self.sql_session.query(GroupList)
                q = q.filter(GroupList.userkey == userkey).filter(GroupList.group == group)
                q.delete()

        self.sql_session.commit()
        self.write({
                'success': True,
            })


class UserHandler(BaseHandler):
    @BaseHandler.check_is_admin_user
    def get(self):
        q = self.sql_session.query(User)
        total = q.count()
        q = q.order_by(User.name)
        q = q.limit(10)
        users = q.all()
        users_list = [user.to_dict() for user in users]
        for user_d in users_list:
            user_d['groups'] = GroupList.get_user_groups(user_d['key'], self.sql_session)

        groups = GroupList.get_all_groups(self.sql_session)

        self.write({
                '_xsrf': self.xsrf_token,
                'users': users_list,
                'groups': groups,
                'total': total,
            })

    @BaseHandler.check_is_admin_user
    def post(self):
        pass


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
