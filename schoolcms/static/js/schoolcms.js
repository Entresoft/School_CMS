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
    }else if(!this.props.loginpage){
      return (
        <RB.ModalTrigger modal={<LoginModel _xsrf_token={this.props._xsrf_token} />}>
          <RB.NavItem eventKey={3}>Login</RB.NavItem>
        </RB.ModalTrigger>
      );
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
      _xsrf_token : this.props._xsrf_token,
      account : this.props.account,
    };
  },
  render: function() {
    return (
      <form action="/login" method="POST">
        <RB.Input type='hidden' name="_xsrf" value={this.state._xsrf_token} />
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
            <h1>登入</h1>
            <hr/>
            <LoginForm account={this.props.account} _xsrf_token={this.props._xsrf_token}/>
          </RB.Well>
        </RB.Col>
      </RB.Grid>
    );
  }
});


const LoginModel = React.createClass({
  render: function() {
    return (
      <RB.Modal {...this.props} title='登入' bsStyle='info' backdrop={true} animation={true}>
        <div className='modal-body'>
          <LoginForm {...this.props} />
        </div>
      </RB.Modal>
    );
  }
});


const AnnIndexPage = React.createClass({
  render: function() {
    var annItems = this.props.annlist.map(function (ann) {
      return (
        <tr key={ann.id}>
          <td><a href={'/announce/'+ann.id}>{ann.title}</a></td>
          <td>{ann.created}</td>
        </tr>
      );
    });
    return (
      <RB.Grid>
        <RB.Row>
          <RB.Col xs={12} md={12}>
            <h1>Announcement</h1>
            <a href="/announce/edit">New Announcement!</a>
          </RB.Col>
        </RB.Row>
        <RB.Row><RB.Col xs={12} md={12}><RB.Well>
          <RB.Table striped bordered hover>
            <thead>
              <tr><th>標題</th><th>公告時間</th></tr>
            </thead>
            <tbody>{annItems}</tbody>
          </RB.Table>
        </RB.Well></RB.Col></RB.Row>
      </RB.Grid>
    );
  }
});


const AnnouncePage = React.createClass({
  render: function() {
    return (
      <RB.Grid>
        <RB.PageHeader>{this.props.ann.title} 
          <small>發布於：{this.props.ann.created}，最後更新：{this.props.ann.updated}</small>
        </RB.PageHeader>
        <RB.Row><RB.Col xs={12} md={12}><RB.Well>
          <span dangerouslySetInnerHTML={{__html: marked(this.props.ann.content, {sanitize: true,breaks:true})}} />
        </RB.Well></RB.Col></RB.Row>
      </RB.Grid>
    );
  }
});
