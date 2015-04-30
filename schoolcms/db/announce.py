#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS db model Announcement.

A model.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import Base
from datetime import datetime

from sqlalchemy import Column, func
from sqlalchemy.dialects.mysql import INTEGER, CHAR, TEXT, TIMESTAMP


class Announce(Base):
    __tablename__ = 'announcements'

    id = Column(INTEGER, primary_key=True)
    title = Column(CHAR(100, collation='utf8_unicode_ci'), nullable=False)
    content = Column(TEXT(charset='utf8'))
    created = Column(TIMESTAMP, default=datetime.now)
    updated = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now)
    author_id = Column(INTEGER, nullable=False)
    
    def __init__(self, title, content, author_id, **kwargs):
        self.title = title
        self.content = content
        self.author_id = author_id

    def __repr__(self):
        return 'Announce(%s ,%s)' % \
        (self.title,self.content)
