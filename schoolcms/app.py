#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS app.

The entrance of SchoolCMS.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import os

from tornado.ioloop import IOLoop
from tornado.web import Application
from tornado.options import options

from .util.parse_config import parse_config
parse_config()

from .handler import route, DefaultHandler


def make_app():
    return Application(
        handlers = route,
        template_path = os.path.join(os.path.dirname(__file__), 'template'),
        static_path = os.path.join(os.path.dirname(__file__), 'static'),
        cookie_secret = options.cookie_secret,
        login_url = '/login',
        xsrf_cookies = True,
        debug = options.server_debug,
        autoreload = False,
        default_handler_class = DefaultHandler,
    )


if __name__ == '__main__':
    print("JIZZ %s" % options.cookie_secret)
    app = make_app()
    app.listen(options.port)
    IOLoop.current().start()
