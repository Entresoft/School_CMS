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
from datetime import datetime

from schoolcms.db import Record
from sqlalchemy import desc


class RecordHandler(BaseHandler):
    def get(self):
        time_s = self.get_argument('time', '')

        try:
            time_ob = datetime.strptime(time_s, '%Y-%m-%d %H:%M:%S')
            q = Record.by_time(time_ob, self.sql_session)
            q = q.order_by(Record.time)
            q = q.limit(20)
            records = q.all()
            last_time_s = records[-1].time.strftime('%Y-%m-%d %H:%M:%S')
        except (ValueError, IndexError):
            records = []
            last_time_s = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        self.write({
                'time': last_time_s,
                'records': [record.to_dict() for record in records],
            })
