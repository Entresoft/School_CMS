#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS util add new user.

Terminal Tool.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import re
from getpass import getpass

from schoolcms.util.parse_config import parse_config
parse_config()
from schoolcms.db import SessionGen, User

try:
    xrange
except NameError:
    xrange = range


def create():
    print('Geez! Create a user!')
    account = raw_input('Account:')
    if not re.match(r'^[a-z]{4,20}$', account):
        print('Error!')
        return None
    else:
        with SessionGen() as session:
            q = session.query(User.account)
             = account)
    for i in xrange(3):
        passwd = getpass('Enter new password:')
        passwdv = getpass('Retype new password:')
        if re.match(r'^.{4,20}$', passwd) and passwd == passwdv:
            break
        else:
            passwd = None
    if not passwd:
        print('Error!')
        return None
    name = 'Mr.Geez'
    identity = '教師'
    isadmin = True

    with SessionGen() as session:
        user = User(account, passwd, name, identity, isadmin)
        session.add(user)
        session.commit()


if __name__ == '__main__':
    create()
