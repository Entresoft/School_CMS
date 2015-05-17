#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

TmpFileHandler.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
from schoolcms.db import TempFileList, AttachmentList

import re
import os
import uuid
import shutil

import tornado
from tornado import gen
from tornado.web import stream_request_body, StaticFileHandler


class TempUploadHandler(BaseHandler):
    def initialize(self):
        if not os.path.exists('file'):
            os.makedirs('file')
            if not os.path.exists('file/tmp'):
                os.makedirs('file/tmp')

    def get(self, path):
        if path:
            raise self.HTTPError(404)
        self.render('file.html')

    @BaseHandler.is_admin_user
    def post(self, path):
        if path:
            raise self.HTTPError(404)
        if not self.request.files.get('file'):
            raise self.HTTPError(403)

        filename = self.request.files['file'][0]['filename']
        body = self.request.files['file'][0]['body']
        content_type = self.request.files['file'][0]['content_type']

        self.tmp_file_name = '%s' % uuid.uuid1().hex
        try:
            with open('file/tmp/%s' % self.tmp_file_name, 'wb') as f:
                f.write(body)

            new_file = TempFileList(self.tmp_file_name, filename, content_type, self.current_user.key)
            self.sql_session.add(new_file)
        except:
            os.remove('file/tmp/%s' % self.tmp_file_name)
            raise self.HTTPError(403)

        self.sql_session.commit()
        self.write({'file_name':filename,'key':self.tmp_file_name})

    @BaseHandler.is_admin_user
    def delete(self, path):
        deletefile = TempFileList.by_key(path, self.sql_session).scalar()
        if not deletefile:
            raise self.HTTPError(404)
        if self.current_user.key != deletefile.author_key:
            raise self.HTTPError(403)
        if os.path.exists('file/tmp/%s' % deletefile.key):
            os.remove('file/tmp/%s' % deletefile.key)

        self.write('delete!')

    # def check_xsrf_cookie(self):
    #     """Testing!!!!!"""
    #     return True


class FileHandler(StaticFileHandler, BaseHandler):
    @gen.coroutine
    def get(self, *arg, **kargs):
        self.download = bool(self.get_argument('download', False))
        yield super(FileHandler, self).get(*arg, **kargs)

    @BaseHandler.is_admin_user
    def delete(self, path):
        if not re.match(r'^[a-zA-Z0-9]+$', path):
            raise self.HTTPError(403)
        file = AttachmentList.by_key(path, self.sql_session).scalar()
        if not file:
            raise self.HTTPError(404)

        shutil.rmtree('file/%s' % file.path[:32])
        AttachmentList.by_key(path, self.sql_session).delete()
        self.sql_session.commit()

        self.write('delete!');

    def get_content_type(self):
        """Returns the ``Content-Type`` header to be used for this request.
        if self.download is true, return application/octet-stream to ask 
        the browser to download the file instead of trying to open it.
        """
        if self.download:
            return 'application/octet-stream'
        else:
            mime_type = super(FileHandler, self).get_content_type()
            return mime_type
