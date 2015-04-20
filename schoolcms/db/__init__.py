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

version = -100


# creat engine
engine = sqlalchemy.create_engine(options.database_config, 
                        echo=options.database_debug)
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


from .user import User
from .announce import Announce

# Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
