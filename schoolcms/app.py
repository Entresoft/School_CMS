#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS app.

The entrance of SchoolCMS.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from .util.parse_config import parse_config
parse_config()

from .handler import route, AppHandler
from .db import SessionGen, System
from .db import version as db_version

import os
import logging
# logging.basicConfig(filename='logging.txt', filemod='w', level=logging.DEBUG)

from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm.exc import NoResultFound

from tornado.ioloop import IOLoop
from tornado.web import Application
from tornado.httpserver import HTTPServer
from tornado.options import options


def check_db():
    with SessionGen() as session:
        try:
            db_info = System.by_key('db_version', session).one()
            if db_info.value != db_version:
                raise ValueError('db version error')
        except (ProgrammingError, NoResultFound) as e:
            print(e)
            print('資料庫未初始化。請先初始化資料庫後再啟動系統。')
            exit()
        except ValueError as e:
            print(e)
            print('資料庫版本不符合，請更新或是重新初始化。')
            exit()


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
        default_handler_class = AppHandler,
    )


if __name__ == '__main__':
    check_db()
    server = HTTPServer(make_app(), xheaders=True)
    server.listen(options.port)
    IOLoop.current().start()
