#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-handler-init.

route.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from ..import version as system_version
from ..db import SQL_Session, User, GroupList, Login_Session
from ..util  import webassets_react

import functools
import os
from webassets import Environment, Bundle

import tornado.web
from tornado.escape import json_encode
from tornado.options import options


class BaseHandler(tornado.web.RequestHandler):
    def initialize(self, is_api=True):
        self.is_api = is_api

        self.assets = Environment(
                os.path.join(os.path.dirname(__file__), '../static'),'/static')
        css_all = Bundle(
                'css/bootstrap.min.css',
                'css/material.min.css',
                Bundle('css/schoolcms.css','css/dropdown.css', filters='cssmin'),
                'outdatedbrowser/outdatedbrowser.min.css',
                output='dict/plugin.min.css')
        js_all = Bundle(
                Bundle(
                    'outdatedbrowser/outdatedbrowser.min.js',
                    'react-0.13.2/react-with-addons.min.js',
                    'js/jquery-2.1.3.min.js',
                    'js/bootstrap.min.js',
                    'js/react-bootstrap.min.js',
                    'js/react-mini-router.min.js',
                    'js/marked.min.js',
                    'js/material.min.js',
                    'js/isMobile.min.js',
                    'js/moment-with-locales.min.js',
                    'js/dropdown.js',filters='jsmin'),
                Bundle(
                    'schoolcms/init.jsx',
                    'schoolcms/mixin/*.jsx',
                    'schoolcms/component/*.jsx',
                    'schoolcms/page/*.jsx', filters=('react','jsmin')),
                output='dict/plugin.min.js')
        self.assets.register('css_all', css_all)
        self.assets.register('js_all', js_all)

    def prepare(self):
        """This method is executed at the beginning of each request.

        """
        self.sql_session = SQL_Session()

    def on_finish(self):
        """Finish this response, ending the HTTP request 
        and properly close the database.
        """
        try:
            self.sql_session.close()
        except AttributeError:
            pass

    def get_current_user(self):
        """Gets the current user logged in from the cookies
        If a valid cookie is retrieved, return a User object.
        Otherwise, return None.
        """
        session_key = self.get_secure_cookie('session_key')
        if not session_key:
            return None
        login_session = Login_Session.get_by_key(session_key, self.sql_session)
        if not login_session:
            return None
        return User.by_key(login_session.userkey, self.sql_session).scalar()

    def get_template_namespace(self):
        _ = super(BaseHandler, self).get_template_namespace()
        _['css_urls'] = self.assets['css_all'].urls()
        _['js_urls'] = self.assets['js_all'].urls()
        _['system_name'] = options.system_name
        _['SERVER_DEBUG'] = options.server_debug
        _['ip'] = self.request.remote_ip
        _['system_version'] = system_version
        _['_host'] = self.request.host
        _['_protocol'] = self.request.protocol
        
        if self.current_user:
            groups = GroupList.get_user_groups(self.current_user.key, self.sql_session)
        else:
            groups = []
        _['current_user'] = self.current_user.to_dict() if self.current_user else None
        _['current_groups'] = groups
        return _

    def page_render(self, page_json, template='app.html', **kw):
        if self.is_api:
            self.write(page_json)
        else:
            self.render(template, page_json=page_json, **kw)

    @property
    def HTTPError(self):
        return tornado.web.HTTPError
    
    def write_error(self, error, **kargs):
        self.render('app.html', page_json={})

    @staticmethod
    def authenticated(method):
        return tornado.web.authenticated(method)

    @staticmethod
    def check_is_admin_user(method):
        def wrapper(self, *args, **kwargs):
            if not self.current_user or not self.current_user.admin:
                raise self.HTTPError(403)
            return method(self, *args, **kwargs)
        return wrapper

    @staticmethod
    def check_is_group_user(group):
        def decorator(method):
            def wrapper(self, *args, **kwargs):
                if not self.is_group_user(group):
                    raise self.HTTPError(403)
                return method(self, *args, **kwargs)
            return wrapper
        return decorator

    def is_group_user(self, group):
        if not self.current_user:
            return False
        if self.current_user.admin:
            return True
        group = GroupList.check(self.current_user.key,
                                group, self.sql_session)
        return bool(group)


class AppHandler(BaseHandler):
    def get(self,  *a, **kwargs):
        self.render('app.html', page_json={})


from .indexhandler import IndexHandler
from .announcehandler import AnnounceHandler, EditAnnHandler
from .signhandler import LoginHandler, LogoutHandler
from .userhandler import GroupHandler, UserHandler
from .filehandler import FileHandler, TempUploadHandler
from .recordhandler import RecordHandler

print(os.path.join(os.path.dirname(__file__), '../../file'))

route = [
    # (r'/', AppHandler),
    # (r'/login/?', AppHandler),
    # (r'/logout/?', AppHandler),
    (r'/announce(?:/([0-9]+))?/?', AnnounceHandler, {'is_api': False}),
    (r'/announce/edit(?:/([0-9]+))?/?', EditAnnHandler, {'is_api': False}),

    # Admin
    (r'/admin/user/?', UserHandler, {'is_api': False}),

    # API
    (r'/api/?', IndexHandler),
    (r'/api/login/?', LoginHandler),
    (r'/api/logout/?', LogoutHandler),
    (r'/api/announce(?:/([0-9]+))?/?', AnnounceHandler),
    (r'/api/announce/edit(?:/([0-9]+))?/?', EditAnnHandler),
    (r'/api/announce/record/?', RecordHandler),

    # Admin API
    (r'/api/admin/group/?', GroupHandler),
    (r'/api/admin/user/?', UserHandler),

    # Att and File
    (r'/file/(.*)', FileHandler, {"path": os.path.join(os.path.dirname(__file__), '../../file')}),
    (r'/fileupload(?:/([a-zA-Z0-9]+))?/?', TempUploadHandler),
]
