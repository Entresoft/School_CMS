/** @jsx React.DOM */

SC.App = React.createClass({
  mixins: [RMR.RouterMixin],
  routes: {
      '/': 'indexHandler',
      '/login': 'loginHandler',
      '/logout': 'logoutHandler',
      '/admin/adduser': 'adduserHandler',
      '/announce': 'annIndexHandler',
      '/announce/edit': 'editAnnHandler',
      '/announce/edit/:ann_id': 'editAnnHandler',
      '/announce/:ann_id': 'announceHandler',
      '/group': 'groupHandler',
      '/grouplist': 'groupListHandler',
  },
  ajax: function(url,method,data,callback){
    console.log('AJAX TO URL:'+url);
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    this.setState({loading:0});
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
      ready: false,
    };
  },
  componentDidMount: function(){
    this.getCurrentUser();
    $.material.init();
  },
  componentWillUpdate: function(){
    if(this.state.url!=window.location.pathname+window.location.search){
      this.setState({url:window.location.pathname+window.location.search});
    }
  },
  getCurrentUser: function(){
    this.setState({ready:false});
    this.ajax('/api','GET',null,function(json){
      this.setState({current_user:json.current_user,ready:true});
    }.bind(this));
  },
  render: function() {
    var getPage = function(){
      if(!this.state.ready){
        return <h1>Wait...</h1>;
      }else if(this.state.status==200){
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

  indexHandler: function() {
      return <a href='/announce'>Announce</a>;
  },
  loginHandler: function(params) {
    return <SC.LoginPage ajax={this.ajax} next={params.next} redirect={params.redirect} getCurrentUser={this.getCurrentUser}/>;
  },
  logoutHandler: function() {
      return <SC.LogoutPage ajax={this.ajax} onLogout={function(){this.setState({current_user:null})}.bind(this)}/>;
  },
  adduserHandler: function() {
      return <SC.LoginPage/>;
  },
  annIndexHandler: function(params) {
    var toInt=function(i){
      return parseInt(i)?parseInt(i):0;
    }
    params.start = toInt(params.start);
    if(!params.search)params.search = '';
    return <SC.AnnIndexPage ajax={this.ajax} start={params.start} search={params.search} />;
  },
  announceHandler: function() {
      return <SC.AnnouncePage ajax={this.ajax}/>;
  },
  editAnnHandler: function(ann_id, params) {
    return <SC.EditAnnPage ajax={this.ajax} current_user={this.state.current_user}/>;
  },
  groupHandler: function() {
      return <SC.LoginPage/>;
  },
  groupListHandler: function() {
      return <SC.LoginPage/>;
  },

  notFound: function(path) {
      return <div className="not-found">Page Not Found: {path}</div>;
  }
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
