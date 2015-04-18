#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-handler-init.

route.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import tornado.web
from tornado.escape import json_encode

from schoolcms.db import Session


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
        pass

    def render(self, *arg, **kwargs):
        super(BaseHandler, self).render(*arg, **kwargs)

    def render_json(self, dic):
        self.set_header('Content-Type', 'application/json; charset=UTF-8')
        self.write(json_encode(dic))

    def error(self,error):
        raise tornado.web.HTTPError(error)

    @staticmethod
    def authenticated(*arg, **kwargs):
        return tornado.web.authenticated(*arg, **kwargs)


from .indexhandler import IndexHandler
from .announcehandler import AnnounceHandler, NewAnnHandler

route = [
    (r'/', IndexHandler),
    (r'/announce(?:/([0-9]+))?/?', AnnounceHandler),
    (r'/announce/new/?', NewAnnHandler),
]
