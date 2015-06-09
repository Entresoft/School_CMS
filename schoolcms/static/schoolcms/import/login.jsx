/** @jsx React.DOM */

SC.LoginForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      _xsrf : '',
      account : '',
      alert: null,
      ready: false,
    };
  },
  componentDidMount: function(){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      this.setState({_xsrf:json._xsrf,alert: json.alert,ready: true});
    }.bind(this));
  },
  handleLogin: function(){
    console.log('handleLogin');
    if(!this.state.ready)return;
    var url = '/api'+window.location.pathname;
    var form = new FormData(React.findDOMNode(this.refs.form));
    this.props.ajax(url,'POST',form,function(json){
      if(json.success){
        this.props.getCurrentUser();
        RMR.navigate(this.props.next);
      }else{
        this.setState({alert: json.alert});
      }
    }.bind(this));
  },
  errorMsg: function() {
    if(this.state.alert){
      return (
        <RB.Alert dismiss={true} bsStyle='danger'>
          <strong>登入失敗!</strong> {this.state.alert}
        </RB.Alert>
      );
    }
  },
  render: function() {
    return (
      <SC.Form ref='form' onSubmit={this.handleLogin}>
        {this.errorMsg() }
        <RB.Input type='hidden' name="_xsrf" value={this.state._xsrf} />
        <RB.Input type='hidden' name="next" value={this.props.next} />
        <RB.Input type='text' name="account" valueLink={this.linkState('account')} placeholder='帳號' />
        <RB.Input type='password' name="passwd" placeholder='密碼' />
        <hr/>
        <div className="btn-group btn-group-justified">
          <a className='btn btn-danger btn-flat' onClick={function(){window.history.go(this.props.redirect?-2:-1);}.bind(this)}>返回</a>
          <a className='btn btn-primary' onClick={this.handleLogin} disabled={!this.state.ready}>登入</a>
        </div>
      </SC.Form>
    );
  },
});


SC.LoginPage = React.createClass({
  componentDidMount: function(){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      this.setState({_xsrf:json._xsrf,alert: json.alert});
    }.bind(this));
  },
  render: function() {
    return (
      <RB.Grid>
        <RB.Col xs={12} md={6} mdOffset={3}>
          <RB.Well>
            <h1>登入</h1>
            <hr/>
            <SC.LoginForm {...this.props} />
          </RB.Well>
        </RB.Col>
      </RB.Grid>
    );
  }
});


SC.LogoutPage = React.createClass({
  componentWillMount: function(){
    var url = '/api'+window.location.pathname;
    this.props.ajax(url,'GET',null,function(json){
      this.props.onLogout();
      RMR.navigate('/');
    }.bind(this));
  },
  render: function() {
    return (
      <div />
    );
  }
});


SC.LoginPageMixin = {
  getInitialState: function() {
    return {
      ready: false,
    };
  },
  componentDidMount: function(){
    console.log('IF login');
    if(!this.props.current_user){
      RMR.navigate(SC.makeURL('/login',{redirect:1,next:window.location.pathname+window.location.search}));
      return false;
    }
    this.pageInit(function(){
      this.setState({ready: true});
    }.bind(this));
  },
};
