#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS db model Announcement.

A model.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import Base

from sqlalchemy import Column, INTEGER, TEXT, TIMESTAMP


class Announce(Base):
    __tablename__ = 'announcements'

    id = Column(INTEGER, primary_key=True)
    title = Column(TEXT, nullable=False)
    content = Column(TEXT)
    created = Column(TIMESTAMP)

    def __init__(self, title, content, **kwargs):
        self.title = title
        self.content = content

    def __repr__(self):
        return 'Announce(%s ,%s)' % \
        (self.title,self.content)
