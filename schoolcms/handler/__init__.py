#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-handler-init.

route.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import functools
import os
import markdown

import tornado.web
from tornado.escape import json_encode

from schoolcms.db import Session, User


class BaseHandler(tornado.web.RequestHandler):
    def prepare(self):
        """This method is executed at the beginning of each request.

        """
        self.sql_session = Session()

    def on_finish(self):
        """Finish this response, ending the HTTP request 
        and properly close the database.
        """
        self.sql_session.close()

    def get_current_user(self):
        """Gets the current user logged in from the cookies
        If a valid cookie is retrieved, return a User object.
        Otherwise, return None.
        """
        uid = self.get_secure_cookie('uid')
        if not uid:
            return None
        return User.by_key(uid, self.sql_session).scalar()

    def get_template_namespace(self):
        _ = super(BaseHandler, self).get_template_namespace()
        _['markdown'] = markdown.markdown
        return _

    @property
    def HTTPError(self):
        return tornado.web.HTTPError
    
    def write_error(self, error, **kargs):
        self.write('<p style="font-size:150px;">Geez! %d!</h1>' % error)

    @staticmethod
    def authenticated(method):
        return tornado.web.authenticated(method)

    @staticmethod
    def is_admin_user(method):
        @BaseHandler.authenticated
        def wrapper(self, *args, **kwargs):
            if not self.current_user.admin:
                raise self.HTTPError(403)
            return method(self, *args, **kwargs)
        return wrapper


from .indexhandler import IndexHandler
from .announcehandler import AnnounceHandler, EditAnnHandler
from .userhandler import LoginHandler, LogoutHandler, AddUserHandler
from .defaulthandler import DefaultHandler
from .filehandler import FileHandler, TempUploadHandler

print(os.path.join(os.path.dirname(__file__), '../../file'))

route = [
    (r'/', IndexHandler),
    (r'/login/?', LoginHandler),
    (r'/logout/?', LogoutHandler),
    (r'/admin/adduser/?', AddUserHandler),
    (r'/announce(?:/([0-9]+))?/?', AnnounceHandler),
    (r'/announce/edit(?:/([0-9]+))?/?', EditAnnHandler),
    (r'/file/(.*)', FileHandler, {"path": os.path.join(os.path.dirname(__file__), '../../file')}),
    (r'/fileupload/?', TempUploadHandler),
]
