/** @jsx React.DOM */

SC.AnnouncePage = React.createClass({
  getInitialState: function() {
    return {
      title: '',
      content: '',
      created: '',
      updated: '',
      atts: [],
      id: '',
    };
  },
  componentDidMount: function(){
    var url = '/api'+window.location.pathname;
    this.props.ajax(url,'GET',null,function(json){
      this.setState(json);
    }.bind(this));
  },
  render: function() {
    return (
      <RB.Grid>
        <RB.PageHeader>{this.state.title}
          <small> by 設備組‧組長</small>
        </RB.PageHeader>
        <RB.Row><RB.Col xs={12} md={12}><RB.Well>
          <span dangerouslySetInnerHTML={{__html: marked(this.state.content, {sanitize: true,breaks:true})}} />
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
        <RB.Row>
          <RB.Col xs={12} md={2}>
            <a className="btn btn-warning btn-xs btn-block" href={'/announce/edit/'+this.state.id}>編輯</a>
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
