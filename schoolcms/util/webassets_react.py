#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS app.

webassets react filter.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import os

from webassets.filter import Filter, register_filter
from react.jsx import JSXTransformer


class React(Filter):
    name = 'react'

    def input(self, _in, out, **kw):
        content = _in.read()
        transformer = JSXTransformer()
        js = transformer.transform_string(content)
        out.write(js)

    def output(self, _in, out, **kw):
        content = _in.read()
        transformer = JSXTransformer()
        js = transformer.transform_string(content)
        out.write(js)

register_filter(React)