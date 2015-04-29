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
import uuid

import tornado
from tornado import gen
from tornado.web import stream_request_body


@stream_request_body
class TempFileHandler(BaseHandler):
    def prepare(self):
        super(TempFileHandler, self).prepare()
        # print self.request.headers

    def post(self):
        print 'POST successfully completed.'

    def data_received(self, chunk):
        print len(chunk)
        
        
