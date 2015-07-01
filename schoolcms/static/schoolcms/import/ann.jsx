/** @jsx React.DOM */

SC.AnnouncePage = React.createClass({
  getInitialState: function() {
    return {
      title: '',
      content: '',
      author_name: '',
      author_group_name: '',
      created: '',
      updated: '',
      atts: [],
      ready: false,
    };
  },
  componentDidMount: function(){
    var url = '/api'+window.location.pathname;
    this.props.ajax(url,'GET',null,function(json){
      json.ready = true;
      this.setState(json);
    }.bind(this));
  },
  handleDelete: function(){
    this.setState({ready: false});
    var url = '/api'+window.location.pathname
    var data = new FormData();
    data.append('_xsrf',this.props._xsrf);
    this.props.ajax(url,'DELETE',data,function(){});
    setTimeout(function(){ RMR.navigate(SC.makeURL('/announce',this.props.params)) }.bind(this), 1);
  },
  render: function() {
    var buttonGroup = (
      <RB.Row><RB.Col xs={12} md={12}>
        <SC.A
          href={SC.makeURL('/announce',this.props.params)}
          className='btn btn-fab btn-primary btn-raised mdi-navigation-arrow-back'></SC.A>
        &nbsp;&nbsp;
        {function(){
          if(this.props.manager)return (
            <span>
              <SC.A
              href={SC.makeURL('/announce/edit/'+this.props.id,this.props.params)}
              className='btn btn-fab btn-warning btn-raised mdi-content-create'></SC.A>
              &nbsp;&nbsp;
              <RB.Button bsStyle='danger' className='btn-fab btn-raised mdi-communication-no-sim'
                disabled={!this.state.ready}
                onClick={this.handleDelete}></RB.Button>
            </span>
          );
        }.bind(this)()}
        <br/><br/>
      </RB.Col></RB.Row>
    );
    return (
      <RB.Grid>
        <RB.PageHeader>{this.state.title}<br/>
          <small> by &nbsp;
            <SC.A href={SC.makeURL('/announce/',{group:this.state.author_group_name})}>{this.state.author_group_name}</SC.A>
            &nbsp; ‧ &nbsp;
            <SC.A href={SC.makeURL('/announce/',{author:this.state.author_name})}>{this.state.author_name}</SC.A>
          </small>
        </RB.PageHeader>
        {buttonGroup}
        <RB.Row><RB.Col xs={12} md={12}><RB.Well>
          <span className='sc-border-a' dangerouslySetInnerHTML={{__html: marked(this.state.content, {sanitize: false,breaks:true})}} />
        </RB.Well></RB.Col></RB.Row>
        <RB.Row>
          <RB.Col xs={12} md={6}><RB.Well>
            <h4>附件</h4><hr/>
            <SC.AttachmentPanel atts={this.state.atts} />
          </RB.Well></RB.Col>
          <RB.Col xs={12} md={6}><RB.Well>
            <h4>時間</h4><hr/>
            <p>發布於：{this.state.created}</p>
            <p>最後更新：{this.state.updated}</p>
          </RB.Well></RB.Col>
        </RB.Row>
        {buttonGroup}
      </RB.Grid>
    );
  }
});


{/*ICON: http://www.webiconset.com/file-type-icons/*/}
{/*xls will turn to xlb
    JPEG will turn to JPE*/}
SC.AttachmentPanel = React.createClass({
  _icon: ['aac','ai','aiff','asp','avi','bmp','c','cpp','css','dat','dmg','doc','docx',
      'dot','dotx','dwg','dxf','eps','exe','flv','gif','h','html','ics','iso','java',
      'jpe','key','m4v','mid','mov','mp3','mp4','mpg','odp','ods','odt','otp','ots',
      'ott','pdf','php','png','pps','ppt','pptx','psd','py','qt','rar','rb','rtf','sql',
      'tga','tgz','tiff','txt','wav','xlb','xlsx','xml','yml','zip'],
  _ms_office: ['docx','doc','dot','dotx','xlsx','xlsb','xlb','xlsm','pptx','ppsx','ppt',
      'pps','pptm','potm','ppam','potx','ppsm'],
  openlink: function(att){
    if(this._ms_office.indexOf(att.filetype)>=0){
      return <a target="_blank" href={'https://view.officeapps.live.com/op/view.aspx?src='+encodeURIComponent(window.location.host+'/file/'+att.path)}>開啟</a>
    }else if(att.filetype!=='file'){
      return <a target="_blank" href={'/file/'+att.path}>開啟</a>
    }
  },
  render: function() {
    var attItems = this.props.atts.map(function (att) {
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
              <a target="_blank" href={'/file/'+att.path+'?download=1'}>下載</a>
            </div>
          </div>
          <div className="media-left">
            
          </div>
        </div>
      );
    }.bind(this));
    if( this.props.atts.length ){
      return <div>{attItems}</div>;
    }else{
      return <p>沒有附件</p>;
    }
  },
});
