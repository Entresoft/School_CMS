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
import tornado.options
from tornado.options import define, options

from .handler import route


define("port", default=8000, help="run on the given port", type=int)
define("cookie_secret", default="", help="test", type=unicode)


def make_app():
    return Application(
        handlers = route,
        template_path = os.path.join(os.path.dirname(__file__), "template"),
        static_path = os.path.join(os.path.dirname(__file__), "static"),
        cookie_secret = options.cookie_secret,
        login_url = "/login",
        xsrf_cookies = True,
        debug = False,
    )


def parse_config():
    tornado.options.parse_command_line()
    tornado.options.parse_config_file(
        os.path.join(os.path.dirname(__file__), "config.py")
    )


if __name__ == "__main__":
    parse_config()
    app = make_app()
    app.listen(options.port)
    IOLoop.current().start()
