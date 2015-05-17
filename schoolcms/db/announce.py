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
from schoolcms.util.sqlalchemy_fulltext import FullText, FullTextSearch
import schoolcms.util.sqlalchemy_fulltext.modes as FullTextMode
import jieba


class Announce(FullText, Base):
    __tablename__ = 'announcements'
    __table_args__ = {'mysql_engine': 'MyISAM'}
    __fulltext_columns__ = ('search',)

    id = Column(INTEGER, primary_key=True)
    # title = Column(CHAR(100, collation='utf8_unicode_ci'), nullable=False)
    title = Column(TEXT(charset='utf8'), nullable=False)
    content = Column(TEXT(charset='utf8'), nullable=False)
    created = Column(TIMESTAMP, default=datetime.now)
    updated = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now)
    author_key = Column(CHAR(40, collation='utf8_unicode_ci'), nullable=False)
    visible = Column(BOOLEAN, nullable=False)
    search = Column(TEXT(charset='utf8'), nullable=False)
    
    def __init__(self, title, content, author_key, visible, **kwargs):
        self.title = title
        self.content = content
        self.author_key = author_key
        self.visible = visible
        self.search = ' '.join(jieba.cut_for_search('%s %s' % (title,content)))

    def __repr__(self):
        return 'Announce(%s ,%s)' % \
        (self.title,self.content)

    @classmethod
    def by_id(cls, ann_id, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.id == ann_id)

    @classmethod
    def full_text_search(cls, query):
        return FullTextSearch(query, cls, FullTextMode.NATURAL)

    @classmethod
    def by_full_text(cls, query, sql_session):
        q = sql_session.query(cls)
        query = ' '.join(jieba.cut_for_search(query))
        return q.filter(cls.full_text_search(query))

    def to_dict(self):
        return {
            'id' : self.id,
            'title' : self.title,
            'content' : self.content,
            'created' : self.created.strftime("%Y-%m-%d %H:%M:%S"),
            'updated' : self.updated.strftime("%Y-%m-%d %H:%M:%S"),
        }
