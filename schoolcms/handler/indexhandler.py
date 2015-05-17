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
        if self.get_argument('restart', ''):
            IOLoop.current().stop()

        greeting = self.get_argument('greeting', 'Hello')
        self.render('index.html', greeting=greeting)
