#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS util.

Move old_ann_system to SchoolCMS.
Terminal Tool.

For version 0.0.0.4
DB version -102
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals


from tornado.options import options
from .util.parse_config import parse_config
parse_config()
from .db import Base, engine
from sqlalchemy import Column
from sqlalchemy.dialects.mysql import INTEGER, TIMESTAMP


class MovingLog(Base):
    __tablename__ = 'movinglogs'

    id = Column(INTEGER, nullable=False)
    mytid = Column(INTEGER, primary_key=True)
    time = Column(TIMESTAMP, nullable=False)
    
    def __init__(self, id, mytid, time, **kwargs):
        self.id = id
        self.mytid = mytid
        self.time = time

    @classmethod
    def by_mytid(cls, mytid, sql_session):
        q = sql_session.query(cls)
        return q.filter(cls.mytid == mytid)

Base.metadata.create_all(engine)


import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime

from .db import SessionGen, Announce, Record


ann_url = options.ann_url
mv_page = options.mv_page
mv_update = options.mv_update

post_urls = []
for i in range(mv_page):
    rel = requests.get('%s?show=%d' % (ann_url, i*20))
    rel.encoding = 'utf8'
    soup = BeautifulSoup(rel.text, 'html.parser')

    post_trs = soup.find_all('table')[1].find_all('tr')[1:]
    for post_tr in post_trs:
        post_urls.append(post_tr.find_all('td')[1].find('a')['href'])
post_urls = post_urls[::-1]

mytid_re = re.compile(r'mytid=([0-9]+)')
time_re = re.compile(r'([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})(?: \(最新編修時間 ([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})\))?')

with SessionGen() as sql_session:
    for post_url in post_urls:
        rel = requests.get(post_url)
        rel.encoding = 'utf8'
        soup = BeautifulSoup(rel.text, 'html.parser')
        ann_trs = soup.find_all('tr')

        title = ann_trs[1].find_all('td')[0].find('font').text
        content = ann_trs[3].find('td').find('font').text
        author_group_name = ann_trs[0].find_all('td')[0].find('font').text
        author_name = ann_trs[0].find_all('td')[1].find('font').text

        addition_content = '  \n  \n  \n***\n本公告是由管理員從舊系統發出，故附件無法提供自動預覽功能，請見諒。\n'
        for tr in ann_trs[4:]:
            addition_content += ' * '+unicode(tr.find('a'))+'\n'
        if ann_trs[4:]:
            addition_content += '\n以上為從舊系統上傳的附件，如無法使用請恰系舊系統的管理人員。\n***'
        content = content + addition_content

        mytid = int(mytid_re.search(post_url).group(1))
        movinglog = MovingLog.by_mytid(mytid, sql_session).scalar()
        ann_time_s = ann_trs[2].find_all('td')[0].find('font').text
        m = time_re.match(ann_time_s)
        time_s = m.group(2) if m.group(2) else m.group(1)
        ann_time = datetime.strptime(time_s, '%Y-%m-%d %H:%M:%S')
        if movinglog:
            if movinglog.time < ann_time or mv_update:
                Announce.by_id(movinglog.id, sql_session).update({
                        'title': title,
                        'content': content,
                        'author_group_name': author_group_name,
                        'author_name': author_name,
                    })
                MovingLog.by_mytid(mytid, sql_session).update({
                        'time': ann_time,
                    })
                Record.add('update', movinglog.id, sql_session)
        else:
            new_ann = Announce(title, content, author_group_name, author_name, False, created=ann_time)
            sql_session.add(new_ann)
            sql_session.flush()
            sql_session.refresh(new_ann)
            new_movinglog = MovingLog(new_ann.id, mytid, ann_time)
            sql_session.add(new_movinglog)
            Record.add('new', new_ann.id, sql_session)
        
        sql_session.commit()
