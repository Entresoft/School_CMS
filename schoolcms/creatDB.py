#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS.

CreatDB.

DB ver -106

"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from .util.parse_config import parse_config
parse_config()

import re
from getpass import getpass
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm.exc import NoResultFound

from .db import engine, Base, SessionGen
from .db import System, User, GroupList, Announce, AnnTag, TempFileList, AttachmentList, Record
from . import version as system_version
from . import db


def creat_db(sql_session):
    Base.metadata.create_all(engine)

    passwd = ''
    while True:
        print('設定root系統帳號密碼(4-20個字元)')
        passwd = getpass('Enter password:')
        passwdv = getpass('Enter password again:')
        if not re.match(r'^.{4,20}$', passwd):
            print('密碼格式錯誤，請重新輸入(4-20個字元)')
        elif passwd != passwdv:
            print('驗證密碼不符，請重新輸入')
        else:
            break

    user = User('root', passwd, 'root', '教師', True)
    session.add_all([
            System('system_version', system_version),
            System('db_version', db.version),
            user,
            GroupList('system', 'Announcement Manager'),
            GroupList(user.key, 'Announcement Manager'),
        ])
    session.commit()
    print('資料庫初始化程序完成')


if __name__ == '__main__':
    with SessionGen() as session:
        try:
            info = System.by_key('system_version', session).one()
        except (ProgrammingError, NoResultFound) as e:
            try:
                creat_db(session)
            except KeyboardInterrupt:
                print('\n初始化程序取消')
        else:
            print('資料庫已經初始化，初始化程序停止。如果想要重新初始化，請先清空資料庫。')
