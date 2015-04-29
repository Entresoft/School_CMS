#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

TmpFileHandler.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler

import os
import uuid

import tornado
from tornado import gen
from tornado.web import stream_request_body, StaticFileHandler


@stream_request_body
class TempUploadHandler(BaseHandler):
    def prepare(self):
        super(TempUploadHandler, self).prepare()
        
        if not os.path.exists('file'):
            os.makedirs('file')
        if not os.path.exists('file/tmp'):
            os.makedirs('file/tmp')

        self.tmp_file_name = '%s' % uuid.uuid1()
        self.tmp_file = open('file/tmp/%s' % self.tmp_file_name, 'wb')

    def get(self):
        self.render('file.html')

    def post(self):
        self.write({'file_name':self.tmp_file_name})

    def check_xsrf_cookie(self):
        """Testing!!!!!"""
        return True

    def data_received(self, chunk):
        self.write({'TT':'GG'})
        self.tmp_file.write(chunk)

    def on_finish(self):
        self.tmp_file.close()


class TempFileHandler(BaseHandler, StaticFileHandler):
    @BaseHandler.authenticated
    def get(self):
        super(TempFileHandler, self).get()


class TempHandler(BaseHandler):
    def get(self):
        self.render('file.html')