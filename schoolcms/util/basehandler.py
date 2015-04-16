#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-BaseHandler
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import tornado.web
from tornado.escape import json_encode

# from schoolcms.db import User


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        pass

    def render(self, *arg, **kwargs):
        super(BaseHandler, self).render(*a, **kwargs)

    def render_json(self, dic):
        self.set_header('Content-Type', 'application/json; charset=UTF-8')
        self.write(json_encode(dic))

    def error(self, error):
        raise tornado.web.HTTPError(error)

    @staticmethod
    def authenticated(*arg, **kwargs):
        return tornado.web.authenticated(*a, **kwargs)
