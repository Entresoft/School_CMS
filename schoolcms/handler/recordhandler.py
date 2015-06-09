#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS announce handlers.

handlers.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from . import BaseHandler
import os

from schoolcms.db import Record
from sqlalchemy import desc


class RecordHandler(BaseHandler):
    def get(self):
        records = Record.by_time(None, self.sql_session).all()
        self.write({
                'time': None,
                'records': [record.to_dict() for record in records],
            })
