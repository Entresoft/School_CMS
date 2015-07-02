#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""SchoolCMS util.

Move old_ann_system to SchoolCMS.
Terminal Tool.

Add att.

DB version -105
"""

from __future__ import absolute_import
from __future__ import print_function
from __future__ import unicode_literals

try:
    xrange
except NameError:
    xrange = range

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

import os
import uuid
import shutil
import subprocess
import mimetypes

from .db import SessionGen, Announce, Record, AttachmentList


def _get_content_type(filename, real_filename=''):
    _content_type, encoding = mimetypes.guess_type(real_filename)
    if not _content_type:
        _content_type = subprocess.check_output('file -b --mime-type %s' % filename, shell=True)
        _content_type = re.search(r'([\S]+)', _content_type).group()
    return _content_type


ann_url = options.ann_url
mv_page = options.mv_page
mv_update = options.mv_update

show = 0
mytid_re = re.compile(r'mytid=([0-9]+)')
time_re = re.compile(r'([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})(?: \(最新編修時間 ([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})\))?')
att_link_re = re.compile(r'^相關附件[0-9]：([\S]+) \(大小：[\S]+ 時間：([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})\)$')

with SessionGen() as sql_session:
    while show < mv_page*20:
        rel = requests.get('%s?show=%d' % (ann_url, show))
        rel.encoding = 'utf8'
        soup = BeautifulSoup(rel.text, 'html.parser')

        post_trs = soup.find_all('table')[1].find_all('tr')[1:]
        for post_tr in post_trs:
            link = post_tr.find_all('td')[1]
            post_url = link.find('a')['href']
            # private ann
            ann_is_private = link.text[-4::] == '[內部]'


            rel = requests.get(post_url)
            rel.encoding = 'utf8'
            soup = BeautifulSoup(rel.text, 'html.parser')
            ann_trs = soup.find_all('tr')

            mytid = int(mytid_re.search(post_url).group(1))
            movinglog = MovingLog.by_mytid(mytid, sql_session).scalar()
            
            ann_time_s = ann_trs[2].find_all('td')[0].find('font').text
            m = time_re.match(ann_time_s)
            time_s = m.group(2) if m.group(2) else m.group(1)
            ann_time = datetime.strptime(time_s, '%Y-%m-%d %H:%M:%S')

            if not movinglog or movinglog.time < ann_time or mv_update:
                title = ann_trs[1].find_all('td')[0].find('font').text
                content = ann_trs[3].find('td').find('font').text
                author_group_name = ann_trs[0].find_all('td')[0].find('font').text
                author_name = ann_trs[0].find_all('td')[1].find('font').text

                addition_content = '''

***
這篇公告從「Ann公告系統」讀取後自動同步。
因為該系統沒有排版功能，這篇公告可能會：
1.在奇怪的地方換行。
2.超連結包含奇怪的文字。(請手動去除多餘的字元)
本系統更新頻率為一小時一次，如有需要可以參考「[原系統公告連結](%s)」。

''' % post_url
                for tr in ann_trs[4:]:
                    a = tr.find('a')
                    if att_link_re.match(a.text):
                        break
                    content += '\n * '+unicode(a)
                content += addition_content

                if movinglog:
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
                    new_ann = Announce(title, content, author_group_name, author_name, ann_is_private, created=ann_time)
                    sql_session.add(new_ann)
                    sql_session.flush()
                    sql_session.refresh(new_ann)
                    movinglog = MovingLog(new_ann.id, mytid, ann_time)
                    sql_session.add(movinglog)
                    Record.add('new', new_ann.id, sql_session)

                old_atts = AttachmentList.by_ann_id(movinglog.id, sql_session).all()
                for old_att in old_atts:
                    shutil.rmtree('file/%s' % old_att.key)
                AttachmentList.by_ann_id(movinglog.id, sql_session).delete()
                for tr in ann_trs[4:]:
                    a = tr.find('a')
                    m = att_link_re.match(a.text)
                    if m:
                        att_key = '%s' % uuid.uuid1().hex
                        att_name = m.group(1)
                        att_time = datetime.strptime(m.group(2), '%Y-%m-%d %H:%M:%S')

                        os.makedirs('file/%s' % att_key)
                        r = requests.get(a['href'], stream=True)
                        with open('file/%s/%s' % (att_key, att_name), 'wb') as f:
                            for chunk in r.iter_content(chunk_size=1024): 
                                if chunk: # filter out keep-alive new chunks
                                    f.write(chunk)
                                    f.flush()
                        att_content_type = _get_content_type('file/%s/%s' % (att_key, att_name), att_name)
                        sql_session.add(AttachmentList(att_key, movinglog.id, att_content_type, att_name))
            sql_session.commit()

        show +=20
