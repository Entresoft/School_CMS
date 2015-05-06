/** @jsx React.DOM */

const RB = ReactBootstrap;
var Alert = RB.Alert;


const NavbarInstance = React.createClass({
  userSign: function(){
    if( this.props.current_user ){
      return (
        <RB.DropdownButton eventKey={3} title={ this.props.current_user.name }>
          <RB.MenuItem eventKey='1'>Action</RB.MenuItem>
          <RB.MenuItem eventKey='2'>Another action</RB.MenuItem>
          <RB.MenuItem eventKey='3'>Something else here</RB.MenuItem>
          <RB.MenuItem divider />
          <RB.MenuItem eventKey='4' href="/logout">Logout</RB.MenuItem>
        </RB.DropdownButton>
      )
    }else{
      return <RB.NavItem eventKey={3} href='#loginmodel'>Login</RB.NavItem>
    }
  },
  render: function(){
    return (
      <RB.Navbar brand={<a href="/">School Cms</a>} inverse toggleNavKey={0}>
        <RB.Nav right eventKey={0}> {/* This is the eventKey referenced */}
          <RB.NavItem eventKey={1} href='#'>Link</RB.NavItem>
          <RB.NavItem eventKey={2} href='#'>Link</RB.NavItem>
          { this.userSign() }
        </RB.Nav>
      </RB.Navbar>
    );
  },
});


const LoginForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      _xsrf : this.props._xsrf,
      account : this.props.account,
    };
  },
  render: function() {
    return (
      <form action="/login" method="POST">
        <h1>登入</h1>
        <hr/>
        <RB.Input type='hidden' name="_xsrf" value={this.state._xsrf} />
        <RB.Input type='text' name="account" valueLink={this.linkState('account')} placeholder='帳號' />
        <RB.Input type='password' name="passwd" placeholder='密碼' />
        <RB.Input type='submit' value='登入' />
      </form>
    );
  },
});


const LoginPage = React.createClass({
  render: function() {
    return (
      <RB.Grid>
        <RB.Col xs={12} md={6} mdOffset={3}>
          <RB.Well>
            <LoginForm account={this.props.account} _xsrf={this.props._xsrf}/>
          </RB.Well>
        </RB.Col>
      </RB.Grid>
    );
  }
});

function handleHide() {
  alert('Close me!');
}

const LoginModel = React.createClass({
  render: function() {
    return (
      <RB.Modal title='Modal title'
        bsStyle='primary'
        backdrop={false}
        animation={false}
        container={document.getElementById('loginmodel')}
        onRequestHide={handleHide}>
        <div className='modal-body'>
          One fine body...
        </div>
        <div className='modal-footer'>
          <RB.Button>Close</RB.Button>
          <RB.Button bsStyle='primary'>Save changes</RB.Button>
        </div>
      </RB.Modal>
    );
  }
});