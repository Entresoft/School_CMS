#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

TmpHandler.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler

import os
import time

import tornado
from tornado import gen
from tornado.ioloop import IOLoop


class TempFileHandler(BaseHandler):
    @gen.coroutine
    def get(self):
        if self.get_argument('restart', ''):
            ioloop = IOLoop.instance()
            ioloop.stop()

        self.write('JIZZ1<br>')
        self.flush()
        yield tornado.gen.Task(tornado.ioloop.IOLoop.instance().add_timeout, time.time() + 3)
        self.write('JIZZ2<br>')
        self.flush()
        yield tornado.gen.Task(tornado.ioloop.IOLoop.instance().add_timeout, time.time() + 3)
        self.write('JIZZ3<br>')
        
