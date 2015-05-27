/** @jsx React.DOM */

SC.EditAnnPage = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      title: '',
      content: '',
      tmpatts: [],
      atts: [],
      ann_id: '',
      _xsrf: '',
      submitLock: true,
    };
  },
  componentWillMount: function(){
    var url = '/api'+window.location.pathname;
    this.props.ajax(url,'GET',null,function(json){
      json.submitLock=false;
      this.setState(json);
    }.bind(this));
  },
  handlePost: function(){
    if(this.state.submitLock)return false;
    this.setState({submitLock:true});
    var url = '/api'+window.location.pathname;
    var data = new FormData(React.findDOMNode(this.refs.form));
    this.props.ajax(url,'POST',data,function(json){
      if(json.posted){
        RMR.navigate('/announce/'+json.ann_id);
      }else{
        this.setState(json);
      }
    }.bind(this));
  },
  render: function() {
    return (
      <RB.Grid>
        <RB.PageHeader>編輯公告</RB.PageHeader>
        <SC.Form ref='form'>
          <RB.Row>
            <RB.Col xs={12} md={6}>
              <RB.Well>
                <RB.Input type='hidden' name="_xsrf" value={this.state._xsrf} />
                <RB.Input type='text' name="title" valueLink={this.linkState('title')} label="公告標題" placeholder='輸入公告標題' />
                <SC.ResizeTextArea name="content" valueLink={this.linkState('content')} label="公告內容" placeholder='輸入公告內容' />
              </RB.Well>
              <RB.Well>
                <h4>編輯附件</h4><hr/>
                <SC.EditAttPanel atts={this.state.atts} tmpatts={this.state.tmpatts}
                  onChange={function(atts,tmpatts){this.setState({atts:atts,tmpatts:tmpatts})}.bind(this)}
                  _xsrf={this.state._xsrf} />
              </RB.Well>
            </RB.Col>
            <RB.Col xs={12} md={6}><RB.Well>
              <h4>預覽內容</h4><hr/>
              <span dangerouslySetInnerHTML={{__html: marked(this.state.content, {sanitize: true,breaks:true})}} />
            </RB.Well></RB.Col>
          </RB.Row>
          <RB.Row>
            <RB.Col xs={12} md={2}>
              <RB.Button bsStyle='success' bsSize='xsmall' block
                disabled={this.state.submitLock||this.state.title.length===0}
                onClick={this.handlePost}>確定</RB.Button>
            </RB.Col>
            <RB.Col xs={12} md={2}>
              <a className="btn btn-primary btn-xs btn-block" href={'/announce/'+this.state.ann_id}>返回</a>
            </RB.Col>
          </RB.Row>
        </SC.Form>
      </RB.Grid>
    );
  }
});


SC.EditAttPanel = React.createClass({
  handleChange: function(file){
    tmpatts = this.props.tmpatts;
    tmpatts.push(file);
    this.props.onChange(this.props.atts,tmpatts);
  },
  handleDelete: function(att, upload){
    if(upload){
      tmpatts = this.props.tmpatts;
      tmpatts.splice(tmpatts.indexOf(att),1);
      this.props.onChange(this.props.atts,tmpatts);
    }else{
      atts = this.props.atts;
      atts.splice(atts.indexOf(att),1);
      this.props.onChange(atts,this.props.tmpatts);
    }
  },
  render: function() {
    var uploadedatts = this.props.atts.map(function (att) {
      return <SC.DeleteAttComponent key={att.key} att={att} handleDelete={this.handleDelete} _xsrf={this.props._xsrf} />
    }.bind(this));
    var atts = this.props.tmpatts.map(function (att) {
      return <SC.DeleteAttComponent key={att.key} att={att} handleDelete={this.handleDelete} upload={true} _xsrf={this.props._xsrf} />
    }.bind(this)); 
    return (
      <div>
        {uploadedatts}
        {atts}
        <SC.UploadAttBox _xsrf={this.props._xsrf} newUpload={this.handleChange} />
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
    form.append('_xsrf', this.props._xsrf);
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
    form.append('_xsrf',this.props._xsrf);
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
        });
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
