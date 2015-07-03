#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS db model System info.

A model.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import Base

from sqlalchemy import Column
from sqlalchemy.dialects.mysql import VARCHAR, TEXT


class System(Base):
    __tablename__ = 'system'

    key = Column(VARCHAR(40, collation='utf8_unicode_ci'), primary_key=True)
    value = Column(TEXT(charset='utf8'), nullable=False)

    def __init__(self, key, value):
        self.key = key
        self.value = value

    @classmethod
    def by_key(cls, key, sql_session):
        q = sql_session.query(cls)
        q = q.filter(cls.key == key)
        return q
