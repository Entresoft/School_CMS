#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS db model Record.

Record updated log.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import re

from . import Base
from datetime import datetime

from sqlalchemy import Column, func
from sqlalchemy.dialects.mysql import INTEGER, CHAR, VARCHAR, TEXT, TIMESTAMP


class Record(Base):
    __tablename__ = 'records'

    id = Column(INTEGER, primary_key=True)
    method = Column(CHAR(20, collation='utf8_unicode_ci'), nullable=False)
    time = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now)
    
    def __init__(self, method, ann_id, **kwargs):
        self.id = ann_id
        self.method = method

    def __repr__(self):
        return 'Record(%s ,%s)' %\
        (self.method,self.id)

    @classmethod
    def by_time(cls, time_ob, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.time > time_ob)

    @classmethod
    def add(cls, method, ann_id, sql_session):
        q = sql_session.query(cls).filter(cls.id == ann_id)
        if q.count():
            q.update({'method':method})
        else:
            sql_session.add(cls(method, ann_id))

    def to_dict(self):
        return {
            'id' : self.id,
            'method' : self.method,
            'time' : self.time.strftime('%Y-%m-%d %H:%M:%S'),
        }
