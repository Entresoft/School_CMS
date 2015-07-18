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
      tags: [],
      ready: false,
    };
  },
  componentDidMount: function(){
    var url = '/api'+window.location.pathname;
    this.props.ajax(url,'GET',null,function(json){
      json.ready = true;
      this.setState(json);
    }.bind(this));
    SC.resetWindow();
    if (typeof FB !== 'undefined')FB.XFBML.parse();
  },
  handleDelete: function(){
    if(!confirm('你確定要刪除這篇公告嗎?'))return;
    this.setState({ready: false});
    var url = '/api'+window.location.pathname
    var data = new FormData();
    data.append('_xsrf',SC.getCookie('_xsrf'));
    this.props.ajax(url,'DELETE',data,function(){});
    setTimeout(function(){ RMR.navigate(SC.makeURL('/announce',this.props.params)) }.bind(this), 1);
  },
  _get_locale_time: function(time_s){
    var time = moment.utc(time_s, 'YYYY-MM-DD HH:mm:ss').local();
    return time.format('LLL');
  },
  _get_time_from_now: function(time_s){
    var time = moment.utc(time_s, 'YYYY-MM-DD HH:mm:ss').local();
    return time.fromNow();
  },
  render: function() {
    var buttonGroup = (
      <RB.Row><RB.Col xs={12} md={12}>
        <a href={SC.makeURL('/announce',this.props.params)}
          className='btn btn-fab btn-primary btn-raised mdi-navigation-arrow-back'></a>
        &nbsp;&nbsp;
        {function(){
          if(this.props.ann_manager)return (
            <span>
              <a href={SC.makeURL('/announce/edit/'+this.props.id,this.props.params)}
              className='btn btn-fab btn-warning btn-raised mdi-content-create'></a>
              &nbsp;&nbsp;
              <RB.Button bsStyle='danger' className='btn-fab btn-raised mdi-action-delete'
                disabled={!this.state.ready}
                onClick={this.handleDelete}></RB.Button>
            </span>
          );
        }.bind(this)()}
        <br/><br/>
      </RB.Col></RB.Row>
    );
    var tags = function(){
      var tags = [];
      if(this.state.tags.length){
        tags.push(<span key={-1}><i className='mdi-maps-local-offer'/> </span>);
        for(var i in this.state.tags){
          tags.push(<RB.Button key={i} className='btn-primary' bsSize='small'>{this.state.tags[i]}</RB.Button>);
        }
        tags.push(<span key={-2}><br/><br/></span>);
      }
      return tags;
    }.bind(this)();
    return (
      <RB.Grid>
        <RB.PageHeader>{this.state.title}<br/>
          <small className='sc-border-a'> by &nbsp;
            <a href={SC.makeURL('/announce/',{group:this.state.author_group_name})}>{this.state.author_group_name}</a>
            &nbsp; ‧ &nbsp;
            <a href={SC.makeURL('/announce/',{author:this.state.author_name})}>{this.state.author_name}</a>
          </small>
        </RB.PageHeader>
        {buttonGroup}
        <RB.Row>
          <RB.Col xs={12} md={12}>
            {tags}
          </RB.Col>
          <RB.Col xs={12} md={12}><RB.Well>
            <div style={{width:'100%',textAlign:'right'}}>
              <SC.FBLikeBtn uri={window.location.pathname}/>
              <span style={{color:'#777'}}> {this._get_time_from_now(this.state.created)} </span>
            </div><br/>
            <span className='sc-border-a' dangerouslySetInnerHTML={{__html: marked(this.state.content, {sanitize: true,breaks:true})}} />
          </RB.Well></RB.Col>
          <RB.Col xs={12} md={6}><RB.Well>
            <h4>附件</h4><hr/>
            <SC.AttachmentPanel atts={this.state.atts} />
          </RB.Well></RB.Col>
          <RB.Col xs={12} md={6}><RB.Well>
            <h4>時間</h4><hr/>
            <p>發布於：{this._get_locale_time(this.state.created)}</p>
            <p>最後更新：{this._get_locale_time(this.state.updated)}</p>
          </RB.Well></RB.Col>
          <RB.Col xs={12} md={8}>
            <SC.FBCommentBox uri={window.location.pathname}/>
          </RB.Col>
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
  btn_style: {
    margin: '1px 1px 1px 1px',
  },
  openlink: function(att){
    if(this._ms_office.indexOf(att.filetype)>=0){
      return (
        <a target="_blank" href={'https://view.officeapps.live.com/op/view.aspx?src='+encodeURIComponent(window.location.host+'/file/'+att.path)}
          className='btn btn-primary btn-sm btn-raised mdi-action-visibility' style={this.btn_style}></a>
      );
    }else if(att.filetype!=='file'){
      return (
        <a target="_blank" href={'/file/'+att.path}
          className='btn btn-primary btn-sm btn-raised mdi-action-visibility' style={this.btn_style}></a>
      );
    }
  },
  render: function() {
    var attItems = this.props.atts.map(function (att) {
      if(this._icon.indexOf(att.filetype)<0){
        att.filetype = 'file';
      }
      return (
        <div key={att.key} className="media">
          <div className="media-left media-middle"><img src={'/static/icon/'+att.filetype+'.png'} alt={att.filetype} /></div>
          <div className="media-body media-middle">
            <div className="media-heading">{att.filename}</div>
          </div>
          <div className="media-right media-middle">
            {this.openlink(att)}
            <a target="_blank" href={'/file/'+att.path+'?download=1'} style={this.btn_style}
              className='btn btn-danger btn-sm btn-raised mdi-file-file-download'></a>
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
