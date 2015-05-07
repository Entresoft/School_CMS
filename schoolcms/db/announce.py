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
from sqlalchemy.dialects.mysql import INTEGER, CHAR, TEXT, TIMESTAMP, BOOLEAN


class Announce(Base):
    __tablename__ = 'announcements'

    id = Column(INTEGER, primary_key=True)
    title = Column(CHAR(100, collation='utf8_unicode_ci'), nullable=False)
    content = Column(TEXT(charset='utf8'))
    created = Column(TIMESTAMP, default=datetime.now)
    updated = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now)
    author_key = Column(CHAR(40, collation='utf8_unicode_ci'), nullable=False)
    visible = Column(BOOLEAN, nullable=False)
    
    def __init__(self, title, content, author_key, visible, **kwargs):
        self.title = title
        self.content = content
        self.author_key = author_key
        self.visible = visible

    def __repr__(self):
        return 'Announce(%s ,%s)' % \
        (self.title,self.content)

    @classmethod
    def by_id(cls, ann_id, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.id == ann_id)

    def to_dict(self):
        return {
            'id' : self.id,
            'title' : self.title,
            'content' : self.content,
            'created' : self.created.strftime("%Y-%m-%d %H:%M:%S"),
            'updated' : self.updated.strftime("%Y-%m-%d %H:%M:%S"),
        }
