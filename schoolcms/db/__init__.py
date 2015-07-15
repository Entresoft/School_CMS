#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-db."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from tornado.options import options

version = '-108'


# creat engine
engine = sqlalchemy.create_engine(options.database_config, 
                        echo=options.database_debug, pool_recycle=3600)
Base = declarative_base()
SQL_Session = sessionmaker(bind=engine)


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
        self.session = SQL_Session()
        return self.session

    def __exit__(self, unused1, unused2, unused3):
        self.session.rollback()
        self.session.close()


from .system import System
from .user import User, GroupList, Login_Session
from .announce import Announce, AnnTag
from .filelist import TempFileList, AttachmentList
from .record import Record
