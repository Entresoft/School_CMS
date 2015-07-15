#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-schoolcms-group."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
from ..db import GroupList, User

import re


def _to_int(s, default):
    if not s.isdigit():
        return default
    return int(s)


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
        start = _to_int(self.get_argument('start', ''),0)
        
        q = self.sql_session.query(User)
        total = q.count()
        q = q.order_by(User.account)
        q = q.offset(start).limit(10)
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
        self._ = {}
        self._['account'] = self.get_argument('account', '')
        self._['passwd'] = self.get_argument('passwd', '')
        self._['name'] = self.get_argument('name', '')
        self._['identity'] = self.get_argument('identity', '')
        self._['admin'] = bool(self.get_argument('admin', ''))

        user = self.add_user()
        if user:
            self.sql_session.add(user)
            self.sql_session.commit()
            self.write({'success': True})
        else:
            self.write(self._)


    def add_user(self):
        if not re.match(r'^[a-zA-Z0-9]{4,20}$', self._['account']):
            self._['alert'] = '帳號格式錯誤(4-20個英數字)'
            return None
        elif not re.match(r'^.{4,20}$', self._['passwd']):
            self._['alert'] = '密碼格式錯誤(4-20個任意字元)'
            return None
        elif not re.match(r'^[\S]{1,15}$', self._['name']):
            self._['alert'] = '姓名格式錯誤(1-15個非空白字元)'
            return None
        elif not (self._['identity'] == '學生' or self._['identity'] == '教師'):
            self._['alert'] = '請選擇帳號身份（學生或教師）'
            return None
        else:
            q = self.sql_session.query(User.account)
            q = q.filter(User.account == self._['account'])
            if q.first():
                self._['alert'] = '此帳號已被使用'
                return None

        self._['name'] = unicode(self._['name'])
        return User(**self._)
