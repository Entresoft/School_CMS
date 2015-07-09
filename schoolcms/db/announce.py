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
from sqlalchemy.dialects.mysql import INTEGER, VARCHAR, TEXT, TIMESTAMP, BOOLEAN
from schoolcms.util.sqlalchemy_fulltext import FullText, FullTextSearch
import schoolcms.util.sqlalchemy_fulltext.modes as FullTextMode
import jieba

jieba.set_dictionary('schoolcms/util/sqlalchemy_fulltext/dict.txt.big')


def _search_update(context):
    return ' '.join(jieba.cut_for_search(
        '%s %s' % (context.current_parameters['title'],context.current_parameters['content'])))

class Announce(FullText, Base):
    __tablename__ = 'announcements'
    __table_args__ = {'mysql_engine': 'MyISAM'}
    __fulltext_columns__ = ('search',)

    id = Column(INTEGER, primary_key=True)
    title = Column(TEXT(charset='utf8'), nullable=False)
    content = Column(TEXT(charset='utf8'), nullable=False)
    author_group_name = Column(VARCHAR(30, collation='utf8_unicode_ci'), nullable=False)
    author_name = Column(VARCHAR(30, collation='utf8_unicode_ci'), nullable=False)
    is_private = Column(BOOLEAN, nullable=False)
    created = Column(TIMESTAMP, default=datetime.utcnow)
    updated = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    search = Column(TEXT(charset='utf8'), nullable=False, onupdate=_search_update)
    
    def __init__(self, title, content, author_group_name, author_name, is_private, **kwargs):
        self.title = title
        self.content = content
        self.author_group_name = author_group_name
        self.author_name = author_name
        self.is_private = is_private
        self.search = ' '.join(jieba.cut_for_search('%s %s' % (title,content)))
        if kwargs.get('created'):
            self.created = kwargs['created']
        if kwargs.get('updated'):
            self.updated = kwargs['updated']

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
            'author_name' : self.author_name,
            'author_group_name' : self.author_group_name,
            'is_private' : self.is_private,
            'created' : self.created.strftime('%Y-%m-%d %H:%M:%S'),
            'updated' : self.updated.strftime('%Y-%m-%d %H:%M:%S'),
        }


class AnnTag(Base):
    __tablename__ = 'anntags'
    id = Column(INTEGER, primary_key=True)
    ann_id = Column(INTEGER, nullable=False)
    tag_name = Column(VARCHAR(30, collation='utf8_unicode_ci'), nullable=False)

    def __init__(self, ann_id, tag_name, **kwargs):
        self.ann_id = ann_id
        self.tag_name = tag_name

    def __repr__(self):
        return 'AnnTag(%s ,%s)' % (self.ann_id,self.tag_name)

    @classmethod
    def by_tag(cls, ann_id, tag_name, sql_session):
        q = sql_session.query(cls)
        q = q.filter(cls.ann_id == ann_id)
        q = q.filter(cls.tag_name == tag_name)
        return q

    @classmethod
    def filter_a_tag(cls, tag_name, sql_query, sql_session):
        q = sql_session.query(cls)
        q = q.filter(cls.tag_name == tag_name)
        q = q.intersect(sql_query)
        return q

    @classmethod
    def get_ann_tags(cls, ann_id, sql_session):
        q = sql_session.query(cls)
        q = q.filter(cls.ann_id == ann_id)
        q = q.order_by(cls.tag_name)
        tag_lists = q.all()
        tags = [i.tag_name for i in tag_lists]
        return tags

    @classmethod
    def get_all_tags(cls, sql_session):
        q = sql_session.query(cls)
        q = q.group_by(cls.tag_name)
        q = q.order_by(cls.tag_name)
        tag_lists = q.all()
        tags = [i.tag_name for i in tag_lists]
        return tags

    def to_dict(self):
        return {
            'ann_id' : self.ann_id,
            'tag_name' : self.tag_name,
        }
