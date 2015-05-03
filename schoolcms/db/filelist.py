#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS db model Announcement.

File list.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import Base
from datetime import datetime

from sqlalchemy import Column, func
from sqlalchemy.dialects.mysql import INTEGER, CHAR, VARCHAR, TEXT, TIMESTAMP


class TempFileList(Base):
    __tablename__ = 'tempfilelist'

    key = Column(CHAR(40, collation='utf8_unicode_ci'), primary_key=True)
    filename = Column(VARCHAR(100, collation='utf8_unicode_ci'), nullable=False)
    content_type = Column(VARCHAR(50, collation='utf8_unicode_ci'), nullable=False)
    created = Column(TIMESTAMP, default=datetime.now())
    author_key = Column(CHAR(40, collation='utf8_unicode_ci'), nullable=False)
    
    def __init__(self, key, filename, content_type, author_key, **kwargs):
        self.key = key
        self.filename = filename
        self.content_type = content_type
        self.author_key = author_key

    def __repr__(self):
        return 'TempFileList(%s ,%s)' % \
        (self.key,self.filename)

    @classmethod
    def by_key(cls, key, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.key == key)


class AttachmentList(Base):
    __tablename__ = 'attachmentlist'

    key = Column(CHAR(40, collation='utf8_unicode_ci'), primary_key=True)
    ann_id = Column(INTEGER, nullable=False)
    content_type = Column(VARCHAR(50, collation='utf8_unicode_ci'), nullable=False)
    path = Column(TEXT(charset='utf8'), nullable=False)
    
    def __init__(self, key, ann_id, content_type, path, **kwargs):
        self.key = key
        self.ann_id = ann_id
        self.content_type = content_type
        self.path = path

    def __repr__(self):
        return 'AttachmentList(%s ,%s)' % \
        (self.ann_id,self.path)

    @classmethod
    def by_key(cls, key, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.key == key)
