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

version = -105


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


from .user import User, GroupList
from .announce import Announce, AnnTag
from .filelist import TempFileList, AttachmentList
from .record import Record

if options.rbdb:
    meta = sqlalchemy.MetaData(bind=engine)
    meta.reflect()
    for tb in reversed(meta.sorted_tables):
        tb.drop(engine)

Base.metadata.create_all(engine)

if options.rbdb:
    with SessionGen() as session:
        user1 = User('root', 'root', 'root', '教師', True)
        user2 = User('anner', 'anner', '組長', '教師', False)
        session.add_all([
                GroupList('system', 'Announcement Manager'),
                GroupList('system', '系統師'),
                user1,
                GroupList(user1.key, 'Announcement Manager'),
                user2,
                GroupList(user2.key, 'Announcement Manager'),
            ])

        session.commit()
