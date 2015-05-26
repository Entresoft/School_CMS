/** @jsx React.DOM */

SC.AnnouncePage = React.createClass({
  render: function() {
    return (
      <RB.Grid>
        <RB.PageHeader>{this.props.ann.title}
          <small> by 設備組‧組長</small>
        </RB.PageHeader>
        <RB.Row><RB.Col xs={12} md={12}><RB.Well>
          <span dangerouslySetInnerHTML={{__html: marked(this.props.ann.content, {sanitize: true,breaks:true})}} />
        </RB.Well></RB.Col></RB.Row>
        <RB.Row>
          <RB.Col xs={12} md={6}><RB.Well>
            <h4>附件</h4><hr/>
            <SC.AttachmentPanel attlist={this.props.attlist} />
          </RB.Well></RB.Col>
          <RB.Col xs={12} md={6}><RB.Well>
            <h4>時間</h4><hr/>
            <p>發布於：{this.props.ann.created}</p>
            <p>最後更新：{this.props.ann.updated}</p>
          </RB.Well></RB.Col>
        </RB.Row>
        <RB.Row>
          <RB.Col xs={12} md={2}>
            <a className="btn btn-warning btn-xs btn-block" href={'/announce/edit/'+this.props.ann.id}>編輯</a>
          </RB.Col>
          <RB.Col xs={12} md={2}>
            <a className="btn btn-primary btn-xs btn-block" href="/announce/">返回</a>
          </RB.Col>
        </RB.Row>
      </RB.Grid>
    );
  }
});


{/*ICON: http://www.webiconset.com/file-type-icons/*/}
SC.AttachmentPanel = React.createClass({
  _icon: ['aac','ai','aiff','asp','avi','bmp','c','cpp','css','dat','dmg','doc','docx',
      'dot','dotx','dwg','dxf','eps','exe','flv','gif','h','html','ics','iso','java',
      'jpg','key','m4v','mid','mov','mp3','mp4','mpg','odp','ods','odt','otp','ots',
      'ott','pdf','php','png','pps','ppt','pptx','psd','py','qt','rar','rb','rtf','sql',
      'tga','tgz','tiff','txt','wav','xls','xlsx','xml','yml','zip'],
  _ms_office: ['docx','doc','dot','dotx','xlsx','xlsb','xls','xlsm','pptx','ppsx','ppt',
      'pps','pptm','potm','ppam','potx','ppsm'],
  openlink: function(att){
    if(this._ms_office.indexOf(att.filetype)>=0){
      return <a target="_blank" href={'https://view.officeapps.live.com/op/view.aspx?src='+encodeURIComponent(window.location.host+'/file/'+att.path)}>開啟</a>
    }else if(att.filetype!=='file'){
      return <a target="_blank" href={'/file/'+att.path}>開啟</a>
    }
  },
  render: function() {
    var attItems = this.props.attlist.map(function (att) {
      if(this._icon.indexOf(att.filetype)<0){
        att.filetype = 'file';
      }
      return (
        <div key={att.key} className="media">
          <div className="media-left"><img src={'/static/icon/'+att.filetype+'.png'} alt={att.filetype} /></div>
          <div className="media-body">
            <div className="media-heading">{att.filename}</div>
            <div>
              {this.openlink(att)}
              <a href={'/file/'+att.path+'?download=1'}>下載</a>
            </div>
          </div>
        </div>
      );
    }.bind(this));
    if( this.props.attlist.length ){
      return <div>{attItems}</div>;
    }else{
      return <p>沒有附件</p>;
    }
  },
});


SC.EditAnnPage = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      title: this.props.ann.title,
      content: this.props.ann.content,
    };
  },
  render: function() {
    return (
      <RB.Grid>
        <RB.PageHeader>編輯公告</RB.PageHeader>
        <form action={'/announce/edit/'+this.props.ann.id} method="POST">
          <RB.Row>
            <RB.Col xs={12} md={6}>
              <RB.Well>
                <RB.Input type='hidden' name="_xsrf" value={this.props._xsrf_token} />
                <RB.Input type='text' name="title" valueLink={this.linkState('title')} label="公告標題" placeholder='輸入公告標題' />
                <SC.ResizeTextArea name="content" valueLink={this.linkState('content')} label="公告內容" placeholder='輸入公告內容' />
              </RB.Well>
              <RB.Well>
                <h4>編輯附件</h4><hr/>
                <SC.EditAttPanel attlist={this.props.attlist} tmpatts={this.props.tmpatts} _xsrf_token={this.props._xsrf_token} />
              </RB.Well>
            </RB.Col>
            <RB.Col xs={12} md={6}><RB.Well>
              <h4>預覽內容</h4><hr/>
              <span dangerouslySetInnerHTML={{__html: marked(this.state.content, {sanitize: true,breaks:true})}} />
            </RB.Well></RB.Col>
          </RB.Row>
          <RB.Row>
            <RB.Col xs={12} md={2}>
              <RB.Button bsStyle='success' bsSize='xsmall' block type='submit'>確定</RB.Button>
            </RB.Col>
            <RB.Col xs={12} md={2}>
              <a className="btn btn-primary btn-xs btn-block" href={'/announce/'+this.props.ann.id}>返回</a>
            </RB.Col>
          </RB.Row>
          
        </form>
      </RB.Grid>
    );
  }
});


SC.EditAttPanel = React.createClass({
  getInitialState: function() {
    return {
      tmpatts: this.props.tmpatts,
      attlist: this.props.attlist,
    };
  },
  handleChange: function(file){
    tmpatts = this.state.tmpatts;
    tmpatts.push(file);
    this.setState({
      tmpatts: tmpatts,
    });
  },
  handleDelete: function(att, upload){
    if(upload){
      tmpatts = this.state.tmpatts;
      tmpatts.splice(tmpatts.indexOf(att),1);
      this.setState({
        tmpatts:tmpatts,
      });
    }else{
      attlist = this.state.attlist;
      attlist.splice(attlist.indexOf(att),1);
      this.setState({
        attlist:attlist,
      });
    }
  },
  render: function() {
    var uploadedatts = this.state.attlist.map(function (att) {
      return <SC.DeleteAttComponent key={att.key} att={att} handleDelete={this.handleDelete} _xsrf_token={this.props._xsrf_token} />
    }.bind(this));
    var atts = this.state.tmpatts.map(function (att) {
      return <SC.DeleteAttComponent key={att.key} att={att} handleDelete={this.handleDelete} upload={true} _xsrf_token={this.props._xsrf_token} />
    }.bind(this)); 
    return (
      <div>
        {uploadedatts}
        {atts}
        <SC.UploadAttBox _xsrf_token={this.props._xsrf_token} newUpload={this.handleChange} />
      </div>
    );
  }
});


SC.DeleteAttComponent = React.createClass({
  uploadfile: function(){
    if(this.props.upload){
      return <RB.Input key={0} type="hidden" name="attachment" value={this.props.att.key} />;
    }
  },
  deleteAtt: function(){
    if(!confirm('你確定要刪除 '+this.props.att.filename+' 嗎?'))return;
    xhr = new XMLHttpRequest();
    form = new FormData();
    form.append('_xsrf', this.props._xsrf_token);
    path = this.props.upload?'/fileupload/':'/file/';
    path+=this.props.att.key;
    xhr.open('DELETE',path,true);
    xhr.onreadystatechange = function(){
      if(xhr.readyState==4&&xhr.status==200){
        console.log(xhr.responseText);
        this.props.handleDelete(this.props.att,this.props.upload);
      }
    }.bind(this);
    xhr.send(form);
  },
  render: function() {
    return (
      <RB.Panel key={this.props.key}>
        <RB.Row>
          <RB.Col xs={10} md={10}>
            <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
            <span className="hideOverflow">{this.props.att.filename.substring(0,50)}</span>
          </RB.Col>
          <RB.Col xs={2} md={2}>
            <RB.Button onClick={this.deleteAtt} bsStyle='danger'>刪除</RB.Button>
            {this.uploadfile()}
          </RB.Col>
        </RB.Row>
      </RB.Panel>
    );
  }
});


SC.UploadAttBox = React.createClass({
  getInitialState: function() {
    return {
      file: '',
      filelist: {},
    };
  },
  handleChange: function(evt) {
    file = evt.target.files[0];
    form = new FormData();
    xhr = new XMLHttpRequest();
    uuid = new Date().getTime();

    filelist = this.state.filelist;
    filelist[uuid] = {
      percent: 0.0,
      filename: file.name,
    };
    this.setState({
      filelist:filelist,
      file: '',
    });

    form.append('file',file);
    form.append('_xsrf',this.props._xsrf_token);
    xhr.open('POST','/fileupload',true);
    xhr.onreadystatechange = function(){
      if(xhr.readyState==4&&xhr.status==200){
        console.log(xhr.responseText);
        attfile = JSON.parse(xhr.responseText);
        this.props.newUpload({
          'filename': attfile.file_name,
          'key': attfile.key,
        });
        filelist = this.state.filelist;
        delete filelist[uuid];
        this.setState({
          filelist: filelist,
        })
      }
    }.bind(this);
    xhr.upload.onprogress = function(e){
      if(e.lengthComputable){
          filelist = this.state.filelist;
          filelist[uuid].percent = e.loaded*100 / e.total;
          this.setState({filelist: filelist});
      }
    }.bind(this);
    xhr.send(form);
  },
  progressBar: function (uuid){
    return (
      <RB.Panel key={uuid}>
        <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
        {this.state.filelist[uuid].filename}
        <RB.ProgressBar active now={this.state.filelist[uuid].percent} label='%(percent)s%'/>
      </RB.Panel>
    )
  },
  render: function() {
    var uploading = [];
    for (var i in this.state.filelist){
      uploading.push(this.progressBar(i));
    }
    return (
      <div>
        {uploading}
        <RB.Input type="file" ref="file" value={this.state.file} onChange={this.handleChange} />
      </div>
    );
  }
});
