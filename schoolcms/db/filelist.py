#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS db model filelist.

File list.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import re
import mimetypes

from . import Base
from datetime import datetime

from sqlalchemy import Column, func
from sqlalchemy.dialects.mysql import INTEGER, CHAR, VARCHAR, TEXT, TIMESTAMP


class TempFileList(Base):
    __tablename__ = 'tempfilelist'

    key = Column(CHAR(40, collation='utf8_unicode_ci'), primary_key=True)
    filename = Column(TEXT(charset='utf8'), nullable=False)
    content_type = Column(TEXT(charset='utf8'), nullable=False)
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

    def to_dict(self):
        return {
            'key' : self.key,
            'filename' : self.filename,
            'path' : self.key,
            'filetype' : 'file',
        }


class AttachmentList(Base):
    __tablename__ = 'attachmentlist'

    key = Column(CHAR(40, collation='utf8_unicode_ci'), primary_key=True)
    ann_id = Column(INTEGER, nullable=False)
    content_type = Column(TEXT(charset='utf8'), nullable=False)
    filename = Column(TEXT(charset='utf8'), nullable=False)
    
    def __init__(self, key, ann_id, content_type, filename, **kwargs):
        self.key = key
        self.ann_id = ann_id
        self.content_type = content_type
        self.filename = filename

    def __repr__(self):
        return 'AttachmentList(%s ,%s)' % \
        (self.ann_id,self.filename)

    @classmethod
    def by_key(cls, key, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.key == key)

    @classmethod
    def by_ann_id(cls, ann_id, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.ann_id == ann_id)

    def to_dict(self):
        _filetype = mimetypes.guess_extension(self.content_type)
        _filetype = _filetype if _filetype else ''
        return {
            'key' : self.key,
            'filename' : self.filename,
            'path' : self.key+'/'+self.filename,
            'filetype' : _filetype[1:],
        }
