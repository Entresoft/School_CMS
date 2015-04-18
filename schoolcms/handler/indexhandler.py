#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-schoolcms-init."""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler


class IndexHandler(BaseHandler):
    def get(self):
        greeting = self.get_argument('greeting', 'Hello')
        self.render('index.html', greeting=greeting)
