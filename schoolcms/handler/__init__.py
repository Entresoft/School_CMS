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

from schoolcms.db import Session, User, GroupList
from webassets import Environment, Bundle
from schoolcms.util  import webassets_react


class BaseHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.assets = Environment(
                os.path.join(os.path.dirname(__file__), '../static'),'/static')
        jsx = Bundle('schoolcms/init.jsx','schoolcms/import/*.jsx',filters=('react','jsmin'),output='js/jsx.js')
        all_js = Bundle(
                'js/jquery-2.1.3.min.js',
                'bootstrap-3.3.4-dist/js/bootstrap.min.js',
                'react-0.13.2/react-with-addons.js',
                'react-0.13.2/JSXTransformer.js',
                'js/react-bootstrap.min.js',
                'js/react-mini-router.min.js',
                'js/marked.min.js',
                'bootstrap-material/js/material.min.js',
                output='js/plugin.js')
        self.assets.register('js_all', all_js)
        self.assets.register('jsx', jsx)

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
        _['xsrf'] = self.xsrf_token
        _['js_urls'] = self.assets['js_all'].urls()
        _['jsx_urls'] = self.assets['jsx'].urls()
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

    @staticmethod
    def is_group_user(groupid):
        def decorator(method):
            @BaseHandler.authenticated
            def wrapper(self, *args, **kwargs):
                if not self.current_user.admin:
                    group = GroupList.check(self.current_user.key,
                                            groupid, self.sql_session)
                    if not group:
                        raise self.HTTPError(403)
                return method(self, *args, **kwargs)
            return wrapper
        return decorator


class AppHandler(BaseHandler):
    def get(self):
        self.render('app.html')


from .indexhandler import IndexHandler
from .announcehandler import AnnounceHandler, EditAnnHandler
from .userhandler import LoginHandler, LogoutHandler, AddUserHandler
from .defaulthandler import DefaultHandler
from .filehandler import FileHandler, TempUploadHandler
from .grouphandler import GroupHandler, GroupListHandler

print(os.path.join(os.path.dirname(__file__), '../../file'))

route = [
    (r'/', IndexHandler),
    (r'/login/?', AppHandler),
    (r'/logout/?', LogoutHandler),
    (r'/admin/adduser/?', AddUserHandler),
    (r'/announce(?:/([0-9]+))?/?', AppHandler),
    (r'/announce/edit(?:/([0-9]+))?/?', EditAnnHandler),
    (r'/file/(.*)', FileHandler, {"path": os.path.join(os.path.dirname(__file__), '../../file')}),
    (r'/fileupload(?:/([a-zA-Z0-9]+))?/?', TempUploadHandler),
    (r'/group/?', GroupHandler),
    (r'/grouplist/?', GroupListHandler),
    # API
    (r'/api/login/?', LoginHandler),
    (r'/api/announce(?:/([0-9]+))?/?', AnnounceHandler),
]
