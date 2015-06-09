#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS util.

Move old_ann_system to SchoolCMS.
Terminal Tool.

For version 0.0.0.1
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

import requests
from bs4 import BeautifulSoup

from tornado.options import options
from schoolcms.util.parse_config import parse_config
parse_config()
from schoolcms.db import SessionGen, User, Announce


ann_url = options.ann_url

post_urls = []
for i in range(2):
    rel = requests.get('%s?show=%d' % (ann_url, i*20))
    rel.encoding = 'utf8'
    soup = BeautifulSoup(rel.text)

    post_trs = soup.find_all('table')[1].find_all('tr')[1:]
    for post_tr in post_trs:
        post_urls.append(post_tr.find_all('td')[1].find('a')['href'])
post_urls = post_urls[::-1]

with SessionGen() as sql_session:
    q = sql_session.query(User)
    q = q.filter(User.account == 'root')
    user_key = q.first().key
    for post_url in post_urls:
        rel = requests.get(post_url)
        rel.encoding = 'utf8'
        soup = BeautifulSoup(rel.text)
        ann_trs = soup.find_all('tr')
        title = ann_trs[1].find_all('td')[0].find('font').text
        content = ann_trs[3].find('td').find('font').text
        new_ann = Announce(title, content, user_key)
        sql_session.add(new_ann)
        sql_session.commit()
