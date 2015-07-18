/** @jsx React.DOM */

SC.LoginPage = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      account : '',
      alert: false,
    };
  },
  handleLogin: function(){
    console.log('handleLogin');
    var url = '/api'+window.location.pathname;
    var form = new FormData(React.findDOMNode(this.refs.form));
    this.props.ajax(url,'POST',form,function(json){
      if(json.success){
        this.props.setCurrentUser(json.current_user, json.current_groups);
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
      <RB.Grid>
        <RB.Col xs={12} md={6} mdOffset={3}>
          <RB.Well>
            <h1>登入</h1>
            <hr/>
            <SC.Form ref='form' onSubmit={this.handleLogin}>
              {this.errorMsg() }
              <RB.Input type='hidden' name="_xsrf" value={SC.getCookie('_xsrf')} />
              <RB.Input type='hidden' name="next" value={this.props.next} />
              <RB.Input type='text' name="account" valueLink={this.linkState('account')} placeholder='帳號' />
              <RB.Input type='password' name="passwd" placeholder='密碼' />
              <hr/>
              <div className="btn-group btn-group-justified">
                <a className='btn btn-primary' onClick={this.handleLogin}>登入</a>
                <a className='btn btn-danger btn-flat' onClick={function(){window.history.go(-1);}}>返回</a>
              </div>
            </SC.Form>
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
      this.props.setCurrentUser(null, []);
      RMR.navigate('/');
    }.bind(this));
  },
  render: function() {
    return (
      <div />
    );
  }
});
