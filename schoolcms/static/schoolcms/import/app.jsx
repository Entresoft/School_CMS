/** @jsx React.DOM */

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
    '/admin/user': 'userHandler',
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
      current_user: null,
      current_groups: [],
      _xsrf: '',
      ready: false,
    };
  },
  componentDidMount: function(){
    this.getCurrentUser();
    $.material.init();
  },
  componentWillUpdate: function(){
    if(this.state.url!=window.location.pathname+window.location.search){
      this.setState({url:window.location.pathname+window.location.search,status:200});
    }
  },
  getCurrentUser: function(){
    this.setState({ready: false});
    this.ajax('/api','GET',null,function(json){
      this.setState({current_user:json.current_user,_xsrf:json._xsrf,ready:true});
    }.bind(this));
  },
  render: function() {
    var getPage = function(){
      if(!this.state.ready){
        return <h1>Wait...</h1>;
      }else if(this.state.status===200){
        return this.renderCurrentRoute();
      }else{
        return <h1>Geez, {this.state.status}</h1>;
      }
    }.bind(this);
    var progressBar = function(){
      if(this.state.loading>=0){
        return (
          <RB.ProgressBar now={this.state.loading} className='progress-bar-material-green-700'
            style={{position:'fixed',top:'0px',height:'4px',width:'100%',zIndex:100,}} />
        );
      }
    }.bind(this);
    return (
      <div>
        {progressBar()}
        <SC.NavbarInstance current_user={this.state.current_user} url={this.state.url}/>
        {getPage()}
      </div>
    );
  },

  toInt: function(s, df){
    return parseInt(s)?parseInt(s):df;
  },

  indexHandler: function() {
    return <SC.A href='/announce'>Announce</SC.A>;
  },
  loginHandler: function(params) {
    params = SC.makeOtherArray(['',], params);
    return <SC.LoginPage ajax={this.ajax} _xsrf={this.state._xsrf} next={params.next} redirect={params.redirect} getCurrentUser={this.getCurrentUser}/>;
  },
  logoutHandler: function() {
    return <SC.LogoutPage ajax={this.ajax} onLogout={function(){this.setState({current_user:null})}.bind(this)}/>;
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
    var manager = (this.state.current_user&&this.state.current_user.admin||this.state.current_groups.indexOf('Announcement Manager')>=0);
    return <SC.AnnouncePage ajax={this.ajax} _xsrf={this.state._xsrf} manager={manager} id={ann_id} params={params}/>;
  },
  editAnnHandler: function(ann_id, params) {
    if(!params){
      params = ann_id;
      ann_id = '';
    }
    params = SC.makeOtherArray(['',], params);
    return <SC.EditAnnPage ajax={this.ajax} _xsrf={this.state._xsrf} id={ann_id} params={params} current_user={this.state.current_user}/>;
  },

  // Admin Page
  userHandler: function(params) {
    params = SC.makeOtherArray(['',], params);
    params.start = this.toInt(params.start, 0);
    if(!params.search)params.search = '';
    return <SC.UserPage ajax={this.ajax} start={params.start} search={params.search} current_user={this.state.current_user} />;
  },

  // Else
  notFound: function(path) {
      return <div className="not-found">Page Not Found: {path}</div>;
  },
});


SC.Redirect = React.createClass({
  componentDidMount: function(){
    console.log('RB run');
    RMR.navigate(this.props.url);
  },
  render: function() {
    return (
      <div />
    );
  }
});
