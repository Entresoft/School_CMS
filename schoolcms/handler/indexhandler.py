#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-schoolcms-init."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler

from tornado.ioloop import IOLoop


class IndexHandler(BaseHandler):
    def get(self):
        self.write({
                'current_user': self.current_user.to_dict() if self.current_user else None,
            })
