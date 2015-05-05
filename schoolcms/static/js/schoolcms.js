/** @jsx React.DOM */

var Alert = ReactBootstrap.Alert;
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem


var NavbarInstance = React.createClass({
  userSign: function(){
    if( this.props.current_user ){
      return (
        <DropdownButton eventKey={3} title={ this.props.current_user.name }>
          <MenuItem eventKey='1'>Action</MenuItem>
          <MenuItem eventKey='2'>Another action</MenuItem>
          <MenuItem eventKey='3'>Something else here</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey='4' href="/logout">Logout</MenuItem>
        </DropdownButton>
      )
    }else{
      return <NavItem eventKey={3} href='/login'>Login</NavItem>
    }
  },
  render: function(){
    return (
      <Navbar brand={<a href="/">School Cms</a>} inverse toggleNavKey={0}>
        <Nav right eventKey={0}> {/* This is the eventKey referenced */}
          <NavItem eventKey={1} href='#'>Link</NavItem>
          <NavItem eventKey={2} href='#'>Link</NavItem>
          { this.userSign() }
        </Nav>
      </Navbar>
    );
  },
});

// const navbarInstance = (
//       <Navbar brand='React-Bootstrap' inverse toggleNavKey={0}>
//         <Nav right eventKey={0}> {/* This is the eventKey referenced */}
//           <NavItem eventKey={1} href='#'>Link</NavItem>
//           <NavItem eventKey={2} href='#'>Link</NavItem>
//           <DropdownButton eventKey={3} title='Dropdown'>
//             <MenuItem eventKey='1'>Action</MenuItem>
//             <MenuItem eventKey='2'>Another action</MenuItem>
//             <MenuItem eventKey='3'>Something else here</MenuItem>
//             <MenuItem divider />
//             <MenuItem eventKey='4'>Separated link</MenuItem>
//           </DropdownButton>
//         </Nav>
//       </Navbar>
//     );

// React.render(navbarInstance, document.getElementById('navbar'));