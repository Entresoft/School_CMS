#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS.

DropDB.

DB ver -106

"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

from .util.parse_config import parse_config
parse_config()

import sqlalchemy

from .db import engine


if __name__ == '__main__':
    print('你確定要清除資料庫中的所有資料嗎?如果你這麼做，你必須在下次啟動系統前初始化資料庫.(輸入yes執行)', end='')
    ans = raw_input()
    if ans=='yes':
        meta = sqlalchemy.MetaData(bind=engine)
        meta.reflect()
        for tb in reversed(meta.sorted_tables):
            tb.drop(engine)
