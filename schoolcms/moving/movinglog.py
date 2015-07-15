#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS util.

Move old_ann_system to SchoolCMS.
Terminal Tool.

DB Model.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from ..db import Base, engine

from sqlalchemy import Column
from sqlalchemy.dialects.mysql import INTEGER, TIMESTAMP


class MovingLog(Base):
    __tablename__ = 'movinglogs'

    id = Column(INTEGER, nullable=False)
    mytid = Column(INTEGER, primary_key=True)
    time = Column(TIMESTAMP, nullable=False)
    
    def __init__(self, id, mytid, time, **kwargs):
        self.id = id
        self.mytid = mytid
        self.time = time

    @classmethod
    def by_mytid(cls, mytid, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.mytid == mytid)

Base.metadata.create_all(engine)
