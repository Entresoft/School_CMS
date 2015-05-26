/** @jsx React.DOM */

SC.NavbarInstance = React.createClass({
  userSign: function(){
    if( this.props.current_user ){
      return (
        <RB.DropdownButton eventKey={1} title={ this.props.current_user.name }>
          <RB.MenuItem eventKey='1'>Action</RB.MenuItem>
          <RB.MenuItem eventKey='2'>Another action</RB.MenuItem>
          <RB.MenuItem eventKey='3'>Something else here</RB.MenuItem>
          <RB.MenuItem divider />
          <RB.MenuItem eventKey='4' href="/logout">Logout</RB.MenuItem>
        </RB.DropdownButton>
      )
    }else if(window.location.pathname.substr(0,6)!='/login'){
      return (
        <RB.NavItem eventKey={1} href={'/login?next='+encodeURIComponent(window.location.pathname)}>Login</RB.NavItem>
      );
    }
  },
  render: function(){
    return (
      <RB.Navbar brand={<a href="/">School Cms</a>} inverse toggleNavKey={0}>
        <RB.Nav right eventKey={0}> {/* This is the eventKey referenced */}
          { this.userSign() }
        </RB.Nav>
      </RB.Navbar>
    );
  },
});
