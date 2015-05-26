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
      '/announce/edit/:annid': 'editAnnHandler',
      '/announce/:annid': 'announceHandler',
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
    };
  },
  componentDidMount: function(){
    this.getCurrentUser();
    $.material.init();
  },
  getCurrentUser: function(){
    this.ajax('/api','GET',null,function(json){
      this.setState({current_user:json.current_user});
    }.bind(this));
  },
  render: function() {
    var getPage = function(){
      if(this.state.status==200){
        return this.renderCurrentRoute();
      }else{
        return <h1>Geez, {this.state.status}</h1>;
      }
    }.bind(this);
    var progressBar = function(){
      if(this.state.loading>=0){
        return (
          <RB.ProgressBar now={this.state.loading} bsStyle='danger' 
            style={{position:'fixed',top:'0px',height:'4px',width:'100%',zIndex:100,}} />
        );
      }
    }.bind(this);
    return (
      <div>
        {progressBar()}
        <SC.NavbarInstance current_user={this.state.current_user} />
        {getPage()}
      </div>
    );
  },

  indexHandler: function() {
      return <a href='/announce'>Announce</a>;
  },
  loginHandler: function(params) {
    if(!params.next){params.next='/';}
    return <SC.LoginPage ajax={this.ajax} next={params.next} onLogin={this.getCurrentUser}/>;
  },
  logoutHandler: function() {
      return <SC.LogoutPage ajax={this.ajax} onLogout={this.getCurrentUser}/>;
  },
  adduserHandler: function() {
      return <SC.LoginPage/>;
  },
  annIndexHandler: function(params) {
    var toInt=function(i){
      return parseInt(i)?parseInt(i):0;
    }
    params.start = toInt(params.start);
    params.totle = toInt(params.totle);
    return <SC.AnnIndexPage ajax={this.ajax} start={params.start} totle={params.totle} search={params.search} />;
  },
  announceHandler: function() {
      return <SC.LoginPage/>;
  },
  editAnnHandler: function(annid, params) {
    return <SC.EditAnnPage ajax={this.ajax}/>;
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
