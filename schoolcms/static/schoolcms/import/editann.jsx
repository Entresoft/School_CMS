/** @jsx React.DOM */

SC.EditAnnPage = React.createClass({
  mixins: [React.addons.LinkedStateMixin, SC.LoginPageMixin],
  getInitialState: function() {
    return {
      title: '',
      content: '',
      user_groups: [],
      is_private: false,
      tmpatts: [],
      atts: [],
      tag_string: '',
      submitLock: 0,
    };
  },
  pageInit: function(callback){
    var url = '/api'+window.location.pathname;
    this.props.ajax(url,'GET',null,function(json){
      json.tag_string = json.tags.join(', ');
      this.setState(json);
      callback();
    }.bind(this));
    $.material.init();
  },
  handlePost: function(){
    if(this.state.submitLock)return false;
    this.lock(1);
    var url = '/api'+window.location.pathname;
    var data = this._parse_data();
    this.props.ajax(url,'POST',data,function(json){
      if(json.success){
        RMR.navigate('/announce/'+json.id);
      }else{
        this.setState(json);
        this.lock(-1);
      }
    }.bind(this));
  },
  _parse_data: function(){
    var data = new FormData(React.findDOMNode(this.refs.form));
    var tags = this.state.tag_string.split(/\s*,(?:\s|,)*/);
    for(var i=0;i<tags.length;i++){
      if(tags[i].match(/\S/)){
        data.append('tag', tags[i]);
      }
    }
    return data;
  },
  alert: function(msg){
    this.setState({alert:msg});
  },
  lock: function(lock){
    this.setState({submitLock:this.state.submitLock+lock});
  },
  uploadAtt: function(att){
    var tmpatts = this.state.tmpatts;
    tmpatts.push(att);
    this.setState({tmpatts:tmpatts});
  },
  render: function() {
    var getAlert = function(){
      if(this.state.alert){
        return (
          <Alert bsStyle='danger' onDismiss={function(){this.setState({alert:null});}.bind(this)}>
            <h4>錯誤！</h4>
            <p>{this.state.alert}</p>
          </Alert>
        );
      }
    }.bind(this);
    var buttonGroup = (
      <RB.Row><RB.Col sm={12} md={12} lg={10} lgOffset={1}>
        <SC.A
          href={SC.makeURL('/announce/'+this.props.id,this.props.params)}
          className='btn btn-fab btn-warning btn-raised mdi-navigation-arrow-back'></SC.A>
        &nbsp;&nbsp;
        <RB.Button bsStyle='success' className='btn-fab btn-raised mdi-content-send'
          disabled={this.state.submitLock>0||this.state.title.length===0||this.state.content.length===0}
          onClick={this.handlePost}></RB.Button>
        <br/><br/>
      </RB.Col></RB.Row>
    );
    return (
      <div className='container-fluid'>
        <RB.Row>
          <RB.Col xs={12} md={12} lg={10} lgOffset={1}><RB.PageHeader>編輯公告</RB.PageHeader></RB.Col>
        </RB.Row>
        {buttonGroup}
        <SC.Form ref='form' onSubmit={function(){}}>
          <RB.Row>
            <RB.Col sm={12} md={12} lg={10} lgOffset={1}>{getAlert()}</RB.Col>
          </RB.Row>
          <RB.Row>
            <RB.Col sm={12} md={6} lg={5} lgOffset={1}>
              <RB.Well>
                <RB.Input type='hidden' name='_xsrf' value={this.props._xsrf}/>
                <RB.Input type='text' name='title' valueLink={this.linkState('title')} label='公告標題' placeholder='輸入公告標題' disabled={!this.state.ready}/>
                <SC.ResizeTextArea name='content' valueLink={this.linkState('content')} label='公告內容' placeholder='輸入公告內容' disabled={!this.state.ready}/>
              </RB.Well>
              <RB.Well>
                <SC.SelectInput name='group' options={this.state.user_groups} label='發佈公告群組' placeholder='選擇發佈公告的群組'/><br/>
                <label>內部公告</label>
                <SC.ToggleButton name='is_private' checked={this.state.is_private} label='只有公告管理員可以瀏覽這篇公告' disabled={!this.state.ready}/>
                <SC.ResizeTextArea valueLink={this.linkState('tag_string')} label='分類標籤'
                    placeholder='輸入分類標籤' disabled={!this.state.ready}
                    help='當有多個標籤時，每個標籤請用英文半形逗號(,)隔開，逗號前後的空白和換行都會被忽略。一個標籤最長30個字元，超過的部份會被忽略。'/>
              </RB.Well>
              <RB.Well>
                <h4>編輯附件</h4><hr/>
                <SC.AttPanel atts={this.state.atts} _xsrf={this.props._xsrf} uploaded={true}
                  onChange={function(atts){this.setState({atts:atts})}.bind(this)} />
                <SC.AttPanel atts={this.state.tmpatts} _xsrf={this.props._xsrf}
                  onChange={function(atts){this.setState({tmpatts:atts})}.bind(this)} />
                <SC.UploadAttBox _xsrf={this.props._xsrf} onUpload={this.uploadAtt}
                  disabled={!this.state.ready} alert={this.alert} lock={this.lock}/>
              </RB.Well>
            </RB.Col>
            <RB.Col sm={12} md={6} lg={5}><RB.Well>
              <h4>預覽內容</h4><hr/>
              <span className='sc-border-a' dangerouslySetInnerHTML={{__html: marked(this.state.content, {sanitize: true,breaks:true})}} />
            </RB.Well></RB.Col>
          </RB.Row>
          {buttonGroup}
        </SC.Form>
      </div>
    );
  }
});


SC.AttPanel = React.createClass({
  handleDelete: function(att){
    atts = this.props.atts;
    atts.splice(atts.indexOf(att),1);
    this.props.onChange(atts);
  },
  render: function() {
    var atts = this.props.atts.map(function (att) {
      return <SC.AttComponent key={att.key} att={att} _xsrf={this.props._xsrf}
        onDelete={this.handleDelete} uploaded={this.props.uploaded}/>
    }.bind(this));
    return (
      <div>
        {atts}
      </div>
    );
  }
});


SC.AttComponent = React.createClass({
  deleteAtt: function(){
    if(!confirm('你確定要刪除 '+this.props.att.filename+' 嗎?'))return;
    var xhr = new XMLHttpRequest();
    var form = new FormData();
    form.append('_xsrf', this.props._xsrf);
    var path = this.props.uploaded?'/file/':'/fileupload/';
    path+=this.props.att.key;
    xhr.open('DELETE',path,true);
    xhr.onreadystatechange = function(){
      if(xhr.readyState==4&&xhr.status==200){
        console.log(xhr.response);
        this.props.onDelete(this.props.att);
      }
    }.bind(this);
    xhr.send(form);
  },
  render: function() {
    var uploadinput=function(){
      if(!this.props.uploaded){
        return <input type='hidden' name='attachment' value={this.props.att.key} />
      }
    }.bind(this);
    return (
      <RB.Panel key={this.props.key}>
        {uploadinput()}
        <RB.Row>
          <RB.Col xs={9} md={9}>
            <i className="mdi-action-description" />
            <span className="hideOverflow">{this.props.att.filename.substring(0,50)}</span>
          </RB.Col>
          <RB.Col xs={3} md={3}>
            <RB.Button onClick={this.deleteAtt} bsStyle='danger'>刪除</RB.Button>
          </RB.Col>
        </RB.Row>
      </RB.Panel>
    );
  }
});


SC.UploadAttBox = React.createClass({
  getInitialState: function() {
    return {
      filelist: {},
    };
  },
  componentWillMount: function(){
    this.xhr = {};
  },
  handleChange: function(evt) {
    var file = evt.target.files[0];
    if(file.size>100000000){
      this.props.alert('檔案過大，檔案大小上限為100MB');
      return;
    }
    this.props.lock(1);
    var form = new FormData();
    var uuid = new Date().getTime();
    this.xhr[uuid] = new XMLHttpRequest();

    var filelist = this.state.filelist;
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
    this.xhr[uuid].open('POST','/fileupload',true);
    this.xhr[uuid].onreadystatechange = function(){
      if(this.xhr[uuid].readyState==4){
        if(this.xhr[uuid].status==200){
          var attfile = JSON.parse(this.xhr[uuid].response);
          this.props.onUpload({
            'filename': attfile.file_name,
            'key': attfile.key,
          });
        }else if(this.xhr[uuid].status){
          this.props.alert('發生錯誤，請重新整理網頁');
        }
      }
    }.bind(this);
    this.xhr[uuid].onerror = function(e){
      this.props.alert('發生錯誤，請重新整理網頁');
    }.bind(this);
    this.xhr[uuid].upload.onprogress = function(e){
      if(e.lengthComputable){
          var filelist = this.state.filelist;
          filelist[uuid].percent = e.loaded*100 / e.total;
          this.setState({filelist: filelist});
      }
    }.bind(this);
    this.xhr[uuid].onloadend = function(){
      var filelist = this.state.filelist;
      delete filelist[uuid];
      this.setState({
        filelist: filelist,
      });
      this.props.lock(-1);
    }.bind(this);
    this.xhr[uuid].send(form);
  },
  progressBar: function (uuid){
    return (
      <RB.Panel key={uuid}>
        <RB.Row>
          <RB.Col md={9}>
            <i className="mdi-action-description" />
            {this.state.filelist[uuid].filename.substr(0,50)}
            <RB.ProgressBar active now={this.state.filelist[uuid].percent} label='%(percent)s%'/>
          </RB.Col>
          <RB.Col md={3}>
            <RB.Button bsStyle='danger' onClick={function(){this.xhr[uuid].abort();}.bind(this)}>取消</RB.Button>
          </RB.Col>
        </RB.Row>
      </RB.Panel>
    )
  },
  render: function() {
    var uploading = [];
    for (var i in this.state.filelist){
      uploading.push(this.progressBar(i));
    }
    var uploadButtonStyle = {
        width: '100%',
      };
    var uploadInputStyle = {
      display: 'none',
    };
    var uploadButton = (
        <RB.Button disabled={this.props.disabled} style={uploadButtonStyle}
        className='btn-material-grey-300 mdi-content-add'
        onClick={function(){React.findDOMNode(this.refs.file).click()}.bind(this)}>
          <input style={uploadInputStyle} type='file' ref='file'
            onChange={this.handleChange} disabled={this.props.disabled} value={''}/>
        </RB.Button>
    );
    return (
      <div>
        {uploading}
        {uploadButton}
      </div>
    );
  }
});
