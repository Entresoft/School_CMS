#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS app.

The entrance of SchoolCMS.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import os

import tornado.options
from tornado.options import define, options


define('port', default=8000, help='run on the given port', type=int)
define('cookie_secret', default='', help='cookie_secret', type=unicode)
define('database_config', default='', help='', type=unicode)
define('server_debug', default=False, help='', type=bool)
define('database_debug', default=False, help='', type=bool)
define('rbdb', default=False, help='', type=bool)


def parse_config():
    config_file_path = os.path.join(os.path.dirname(__file__), '../../config.py')
    tornado.options.parse_config_file(config_file_path)
    tornado.options.parse_command_line()
