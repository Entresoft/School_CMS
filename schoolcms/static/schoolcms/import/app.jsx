/** @jsx React.DOM */

SC.App = React.createClass({
  mixins: [RMR.RouterMixin],
  routes: {
      '/': 'indexHandler',
      '/login': 'loginHandler',
      '/logout': 'logoutHandler',
      '/admin/adduser': 'adduserHandler',
      '/announce': 'annIndexHandler',
      '/announce/:annid': 'announceHandler',
      '/announce/edit/:annid': 'editAnnHandler',
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
    };
  },
  componentDidMount: function(){
    $.material.init();
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
          <RB.ProgressBar now={this.state.loading} bsStyle='info' 
            style={{position:'fixed',top:'0px',height:'4px',width:'100%',zIndex:100,}} />
        );
      }
    }.bind(this);
    return (
      <div>
        {progressBar()}
        <SC.NavbarInstance loginpage={false} current_user={null} />
        {getPage()}
      </div>
    );
  },

  indexHandler: function() {
      return <div>Hello World</div>;
  },
  loginHandler: function(params) {
    if(!params.next){params.next='/';}
    return <SC.LoginPage ajax={this.ajax} next={params.next}/>;
  },
  logoutHandler: function() {
      return <SC.LoginPage/>;
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
  editAnnHandler: function() {
      return <SC.LoginPage/>;
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
