#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-handler-init.

route.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import functools

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
        q = self.sql_session.query(User)
        return q.filter(User.id == uid).first()

    def render(self, *arg, **kwargs):
        super(BaseHandler, self).render(*arg, **kwargs)

    def render_json(self, dic):
        self.set_header('Content-Type', 'application/json; charset=UTF-8')
        self.write(json_encode(dic))

    HTTPError = tornado.web.HTTPError
    def write_error(self, error, **kargs):
        self.write('<p style="font-size:150px;">Geez! %d!</h1>' % error)

    @staticmethod
    def authenticated(method):
        return tornado.web.authenticated(method)

    @staticmethod
    def is_admin_user(method):
        @BaseHandler.authenticated
        def wrapper(self, *args, **kwargs):
            if not self.current_user.isadmin:
                raise self.HTTPError(403)
            return method(self, *args, **kwargs)
        return wrapper


from .indexhandler import IndexHandler
from .announcehandler import AnnounceHandler, NewAnnHandler
from .userhandler import LoginHandler, LogoutHandler, AddUserHandler
from .defaulthandler import DefaultHandler

route = [
    (r'/', IndexHandler),
    (r'/login/?', LoginHandler),
    (r'/logout/?', LogoutHandler),
    (r'/admin/adduser/?', AddUserHandler),
    (r'/announce(?:/([0-9]+))?/?', AnnounceHandler),
    (r'/announce/new/?', NewAnnHandler),
]
