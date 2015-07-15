#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-schoolcms-init."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
from ..db import GroupList

from tornado.ioloop import IOLoop


class IndexHandler(BaseHandler):
    def get(self):
        if self.current_user:
            groups = GroupList.get_user_groups(self.current_user.key, self.sql_session)
        else:
            groups = []
        self.write({
                'current_user': self.current_user.to_dict() if self.current_user else None,
                'current_groups': groups,
                '_xsrf': self.xsrf_token,
            })
