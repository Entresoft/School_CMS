/** @jsx React.DOM */

var RB = ReactBootstrap;
var RMR = ReactMiniRouter;
var Alert = RB.Alert;
var SC = {}
moment.locale(window.navigator.userLanguage || window.navigator.language);


SC.App = React.createClass({
  mixins: [RMR.RouterMixin],
  routes: {
    '/': 'indexHandler',
    '/login': 'loginHandler',
    '/logout': 'logoutHandler',

    // Ann Page
    '/announce': 'annIndexHandler',
    '/announce/edit': 'editAnnHandler',
    '/announce/edit/:ann_id': 'editAnnHandler',
    '/announce/:ann_id': 'announceHandler',

    // Admin Page
    '/admin/adduser': 'adduserHandler',
    '/admin/group': 'groupHandler',
    '/admin/user': 'userHandler'
  },
  ajax: function(url,method,data,callback){
    console.log('AJAX TO URL:'+url);
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    this.setState({loading:15});
    xhr.onreadystatechange = function(){
      if(xhr.readyState==4){
        console.log('AJAX END');
        if(xhr.status){
          this.setState({status:xhr.status});
        }
        setTimeout(function(){this.setState({loading:-1});}.bind(this), 1000);
        if(xhr.status==200){
          callback(JSON.parse(xhr.response));
        }
      }
    }.bind(this);
    xhr.onprogress = function(e){
      if(e.lengthComputable){
        console.log('AJAX:'+e.loaded*100 / e.total+'%');
        this.setState({loading: e.loaded*100 / e.total});
      }
    }.bind(this);
    xhr.onerror = function(){
      this.setState({status: 500});
    };
    xhr.send(data);
  },
  getInitialState: function() {
    return {
      loading: -1,
      status: 200,
      current_user: this.props.current_user,
      current_groups: this.props.current_groups,
      uri: window.location.pathname+window.location.search
    };
  },
  componentDidMount: function(){
    $.material.init();
  },
  componentWillUpdate: function(){
    if(this.state.uri!=window.location.pathname+window.location.search){
      this.setState({uri:window.location.pathname+window.location.search,status:200});
    }
  },
  componentDidUpdate: function(prevProps, prevState){
    if(this.state.uri != prevState.uri){
      ga('send', 'pageview', this.state.uri);
    }
  },
  setCurrentUser: function(current_user, current_groups){
    this.setState({current_user:current_user,current_groups:current_groups});
  },
  render: function() {
    var getPage = function(){
      // if(!this.state.ready){
      //   return <h1>Wait...</h1>;
      if(this.state.status===200){
        return this.renderCurrentRoute();
      }else{
        return <SC.ErrorPage errorCode={this.state.status} />;
      }
    }.bind(this);
    var progressBar = function(){
      if(this.state.loading>=0){
        return (
          <RB.ProgressBar now={this.state.loading} bsStyle='danger'
            style={{position:'fixed',top:'0px',height:'6px',width:'100%',zIndex:100}} />
        );
      }
    }.bind(this);
    return (
      <div>
        {progressBar()}
        <SC.NavbarInstance name={this.props.name} current_user={this.state.current_user} uri={this.state.uri}/>
        {getPage()}
        <hr/>
        <RB.Grid className="footer">
          <RB.Row>
            <RB.Col xs={12} md={6}>
              <h4>Information</h4>
              <p>
                單位：台北市立建國高級中學 <br/>
                地址：台北市南海路56號 <br/>
                單位電話：(02)2303-4381 <br/>
                維謢人員：samsam2310@gmail.com <br/>
              </p>
            </RB.Col>
            <RB.Col xs={12} md={6}>
              <h4>School CMS</h4>
              <p>
                版本：{ this.props.information.system_version } <br/>
                系統開發中，有任何建議歡迎到 <a target="_blank" href="https://www.facebook.com/ckschoolcms">FaceBook 粉絲專頁</a> 留言。<br/>
                IP: { this.props.information.ip }
              </p>
            </RB.Col>
          </RB.Row>
        </RB.Grid>
      </div>
    );
  },

  toInt: function(s, df){
    return parseInt(s)?parseInt(s):df;
  },

  indexHandler: function() {
    return <SC.RedirectPage url='/announce' />;
  },
  loginHandler: function(params) {
    params = SC.makeOtherArray(['',], params);
    return <SC.LoginPage ajax={this.ajax} next={params.next} setCurrentUser={this.setCurrentUser}/>;
  },
  logoutHandler: function() {
    return <SC.LogoutPage ajax={this.ajax} setCurrentUser={this.setCurrentUser}/>;
  },

  // Ann Page
  annIndexHandler: function(params) {
    params = SC.makeOtherArray(['',], params);
    params.start = this.toInt(params.start, 0);
    if(!params.search)params.search = '';
    if(!params.author)params.author = '';
    if(!params.group)params.group = '';
    return <SC.AnnIndexPage ajax={this.ajax} params={params} />;
  },
  announceHandler: function(ann_id, params) {
    params = SC.makeOtherArray(['',], params);
    var ann_manager = SC.is_group('Announcement Manager', this.state.current_user, this.state.current_groups);
    return <SC.AnnouncePage ajax={this.ajax} ann_manager={ann_manager} id={ann_id} params={params}/>;
  },
  editAnnHandler: function(ann_id, params) {
    if(!params){
      params = ann_id;
      ann_id = '';
    }
    params = SC.makeOtherArray(['',], params);
    return <SC.EditAnnPage ajax={this.ajax} id={ann_id} params={params} redirect={!this.state.current_user}/>;
  },

  // Admin Page
  userHandler: function(params) {
    params = SC.makeOtherArray(['',], params);
    params.start = this.toInt(params.start, 0);
    if(!params.search)params.search = '';
    return <SC.UserPage ajax={this.ajax} start={params.start} search={params.search} redirect={!this.state.current_user} />;
  },

  // Else
  notFound: function(path) {
    return <SC.ErrorPage errorCode='404' />;
  }
});


SC.RedirectPage = React.createClass({
  componentDidMount: function(){
    console.log('Redirect to '+this.props.url);
    SC.Redirect(this.props.url);
  },
  render: function() {
    return (
      <div />
    );
  }
});
