#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-db."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from tornado.options import options

import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

version = -102


# creat engine
engine = sqlalchemy.create_engine(options.database_config, 
                        echo=options.database_debug, pool_recycle=3600)
Base = declarative_base()
Session = sessionmaker(bind=engine)


class SessionGen(object):
    """This allows us to create handy local sessions simply with:
    with SessionGen() as session:
        session.do_something()
    and at the end the session is automatically rolled back and
    closed. If one wants to commit the session, they have to call
    commit() explicitly.
    """
    def __init__(self):
        self.session = None

    def __enter__(self):
        self.session = Session()
        return self.session

    def __exit__(self, unused1, unused2, unused3):
        self.session.rollback()
        self.session.close()


from .user import User, Group, GroupList
from .announce import Announce
from .filelist import TempFileList, AttachmentList
from .record import Record

if options.rbdb:
    Base.metadata.drop_all(engine)

Base.metadata.create_all(engine)

if options.rbdb:
    with SessionGen() as session:
        new_user = User('root', 'root', 'root', '教師', True)
        new_user_grouplist = GroupList(new_user.key, 1)
        session.add_all([
                new_user,
                Group(1, '公告發佈者'),
                Group(2, '系統師'),
                Group(1000, 'END'),
                new_user_grouplist,
            ])

        session.commit()
