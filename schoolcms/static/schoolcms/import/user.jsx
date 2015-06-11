/** @jsx React.DOM */

SC.UserPage = React.createClass({
  mixins: [React.addons.LinkedStateMixin, SC.LoginPageMixin],
  getInitialState: function() {
    return {
      users: [],
      groups: [],
      total: 0,
    };
  },
  ajax: function(callback){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      this.setState(json);
      callback();
    }.bind(this));
  },
  pageInit: function(callback){
    this.ajax(function(){
      $.material.init();
      callback();
    });
  },
  componentWillReceiveProps: function(nextprops) {
    if(false){
      this.ajax(function(){});
    }
  },
  // handleSearch: function(search){
  //   var url = SC.makeURL(window.location.pathname,{
  //                 'start': this.props.start,
  //                 'search': search,
  //               });
  //   RMR.navigate(url);
  // },
  render: function() {
    var userItems = this.state.users.map(function (user) {
      return (
        <SC.UserPageUserItem key={user.key} user={user}/>
      );
    });
    var groupTags = this.state.groups.map(function (group) {
      return (
        <RB.Button key={group.id} className='btn-material-brown-500'>
          {group.name}
        </RB.Button>
      );
    });
    var modal = (
      <RB.Modal title={<span style={{fontSize:'25px'}}>選擇群組</span>} bsSize='large' onRequestHide={function() {}}>
        <div className='modal-body btn-material-green-200'>
          <br/>
          <RB.Button className='mdi-content-add btn-material-blue-grey-500' bsSize='small'></RB.Button>
          <br/>
          {groupTags}
        </div>
        <div className='modal-footer'><br/></div>
      </RB.Modal>
    );
    return (
      <div>
        <RB.Grid>
          <RB.Row>
            <RB.Col xs={12} md={6}>
              <h1>Users</h1>
              <RB.ModalTrigger modal={modal}>
                <RB.Button className='mdi-social-people'></RB.Button>
              </RB.ModalTrigger>
            </RB.Col>
          </RB.Row>
          <RB.Row><RB.Col xs={12} md={12}>
            <RB.Well>
              <RB.Table striped hover>
                <thead>
                  <tr><th style={{padding:'0 8px 0 8px'}}>
                    <RB.Input type='checkbox' label={<b> 使用者名稱</b>}/>
                  </th><th style={{padding:'0 8px 0 8px',lineHeight:'53px'}}>群組</th></tr>
                </thead>
                <tbody>{userItems}</tbody>
              </RB.Table>
            </RB.Well>
            <SC.Pager start={this.props.start} total={this.state.total} />
          </RB.Col></RB.Row>
        </RB.Grid>
      </div>
    );
  }
});


SC.UserPageUserItem = React.createClass({
  render: function() {
    return (
      <tr>
        <td className='col-md-2'>
          <RB.Input type='checkbox' label={' '+this.props.user.name}/>
        </td>
        <td className='col-md-10'>
          {this.props.user.groups.map(function (group) {
            return (
              <RB.Button key={group.id} className='btn-material-brown-500' bsSize='small'>
                {group.name}
              </RB.Button>);
          })}
        </td>
      </tr>
    );
  }
});
