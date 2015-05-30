#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS util.

Move old_ann_system to SchoolCMS.
Terminal Tool.
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import requests
from bs4 import BeautifulSoup

from tornado.options import options
from schoolcms.util.parse_config import parse_config
parse_config()
from schoolcms.db import SessionGen, User


ann_url = options.ann_url

rel = requests.get(ann_url)
rel.encoding = 'utf8'
soup = BeautifulSoup(rel.text)
print(soup)
