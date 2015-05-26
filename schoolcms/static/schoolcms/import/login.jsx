/** @jsx React.DOM */

SC.LoginForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      _xsrf : '',
      account : '',
      alert: null,
    };
  },
  componentDidMount: function(){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      this.setState({_xsrf:json._xsrf,alert: json.alert});
    }.bind(this));
  },
  handleLogin: function(){
    ;
  }
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
      <form onSubmit={function(e){e.preventDefault();e.stopPropagation();this.handleLogin();}.bind(this)}>
        {this.errorMsg() }
        <RB.Input type='hidden' name="_xsrf" value={this.state._xsrf} />
        <RB.Input type='hidden' name="next" value={this.props.next} />
        <RB.Input type='text' name="account" valueLink={this.linkState('account')} placeholder='帳號' />
        <RB.Input type='password' name="passwd" placeholder='密碼' />
        <RB.Button></RB.Button>
      </form>
    );
  },
});


SC.LoginPage = React.createClass({
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
