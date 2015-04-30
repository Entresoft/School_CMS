#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

TmpFileHandler.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
from schoolcms.db import TempFileList

import os
import uuid

import tornado
from tornado import gen
from tornado.web import stream_request_body, StaticFileHandler


class TempUploadHandler(BaseHandler):
    def prepare(self):
        super(TempUploadHandler, self).prepare()
        
        if not os.path.exists('file'):
            os.makedirs('file')
        if not os.path.exists('file/tmp'):
            os.makedirs('file/tmp')

        self.tmp_file_name = '%s' % uuid.uuid1()

    def get(self):
        self.render('file.html')

    @BaseHandler.is_admin_user
    def post(self):
        if not self.request.files.get('file'):
            raise self.HTTPError(403)

        filename = self.request.files['file'][0]['filename']
        body = self.request.files['file'][0]['body']
        content_type = self.request.files['file'][0]['content_type']

        with open('file/tmp/%s' % self.tmp_file_name, 'wb') as f:
            f.write(body)

        new_file = TempFileList(self.tmp_file_name, filename, content_type, self.current_user.id)
        self.sql_session.add(new_file)
        self.sql_session.commit()

        self.write({'file_name':self.tmp_file_name})

    # def check_xsrf_cookie(self):
    #     """Testing!!!!!"""
    #     return True

    def on_finish(self):
        super(TempUploadHandler, self).on_finish()
        self.tmp_file.close()


class FileHandler(StaticFileHandler):
    @gen.coroutine
    def get(self, *arg, **kargs):
        yield super(FileHandler, self).get(*arg, **kargs)
