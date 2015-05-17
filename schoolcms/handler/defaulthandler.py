#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS default handler.

To send HTTP 404 error.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler


class DefaultHandler(BaseHandler):
    def get(self):
        raise self.HTTPError(404)

    def post(self):
        raise self.HTTPError(404)
