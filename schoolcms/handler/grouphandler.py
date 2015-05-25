#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-schoolcms-group."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler

from schoolcms.db import Group, GroupList


class GroupHandler(BaseHandler):
    def get(self):
        q = self.sql_session.query(Group)
        groups = q.all()
        self.render('group.html', groups=groups)


class GroupListHandler(BaseHandler):
    def get(self):
        pass