#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS db model User.

A model.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import random
import hashlib
import string

from . import Base
import uuid

from sqlalchemy import Column
from sqlalchemy.dialects.mysql import INTEGER, BOOLEAN, CHAR, VARCHAR, ENUM


try:
    xrange
except NameError:
    xrange = range


class User(Base):
    __tablename__ = 'users'

    key = Column(CHAR(40, collation='utf8_unicode_ci'), primary_key=True)
    account = Column(CHAR(20, collation='utf8_unicode_ci'), nullable=False)
    passwd = Column(VARCHAR(90, collation='utf8_unicode_ci'))
    name = Column(VARCHAR(20, collation='utf8_unicode_ci'), nullable=False)
    identity = Column(ENUM('學生','教師', charset='utf8'), nullable=False)
    admin = Column(BOOLEAN, nullable=False)

    def __init__(self, account, passwd, name,
                identity='學生', admin=False, **kwargs):
        self.key = uuid.uuid3(uuid.uuid1(), account.encode()).hex
        self.account = account
        self.name = name
        self.identity = identity
        self.admin = admin
        self.passwd = self.hash_passwd(self.account, passwd)

    @staticmethod
    def make_salt():
        return ''.join(random.choice(string.letters) for i in xrange(5))

    @classmethod
    def hash_passwd(cls, account, passwd, salt=''):
        if not salt:
            salt = cls.make_salt()
        h = hashlib.sha256(account+passwd+salt).hexdigest()
        return '%s,%s'%(h,salt)

    def check_passwd(self, passwd):
        salt = self.passwd.split(',')[1]
        return self.passwd == self.hash_passwd(self.account,passwd,salt)

    @classmethod
    def by_key(cls, key, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.key == key)

    def to_dict(self):
        return {
            'key' : self.key,
            'name' : self.name,
            'account' : self.account,
            'admin' : self.admin,
            'identity' : self.identity,
        }

    def to_dict_str(self):
        _l = []
        _map = self.to_dict()
        for i in _map:
            _l.append("'%s':'%s'" % (i, _map[i]))
        return '{%s}' % ','.join(_l)


class GroupList(Base):
    __tablename__ = 'grouplist'

    id = Column(INTEGER, primary_key=True)
    userkey = Column(CHAR(40, collation='utf8_unicode_ci'))
    group = Column(CHAR(40, collation='utf8_unicode_ci'), nullable=False)

    def __init__(self, userkey, group):
        self.userkey = userkey
        self.group = group

    @classmethod
    def check(cls, userkey, group, sql_session):
        q = sql_session.query(cls)
        q = q.filter(cls.userkey == userkey)
        q = q.filter(cls.group == group)
        return q.scalar()

    @classmethod
    def get_user_groups(cls, userkey, sql_session):
        q = sql_session.query(cls)
        q = q.filter(cls.userkey == userkey)
        q = q.order_by(cls.group)
        group_lists = q.all()
        groups = [i.group for i in group_lists]

        return groups

    @classmethod
    def get_all_groups(cls, sql_session):
        q = sql_session.query(cls)
        q = q.group_by(cls.group)
        q = q.order_by(cls.group)
        group_lists = q.all()
        groups = [i.group for i in group_lists]

        return groups

    def to_dict(self):
        return {
            'userkey' : self.userkey,
            'group' : self.group,
        }
