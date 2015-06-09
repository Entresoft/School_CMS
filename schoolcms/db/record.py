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
    ann_id = Column(INTEGER, nullable=True)
    created = Column(TIMESTAMP, default=datetime.now())
    
    def __init__(self, method, ann_id, **kwargs):
        self.method = method
        self.ann_id = ann_id

    def __repr__(self):
        return 'Record(%s ,%s)' %\
        (self.method,self.ann_id)

    @classmethod
    def by_time(cls, time, sql_session):
        return sql_session.query(cls)

    def to_dict(self):
        return {
            'id' : self.id,
            'method' : self.method,
            'ann_id' : self.ann_id,
            'time' : self.created.strftime("%Y-%m-%d %H:%M:%S"),
        }
