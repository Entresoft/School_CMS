#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS-handler-init.

route.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from .indexhandler import IndexHandler


route = [
    (r"/", IndexHandler),
]
