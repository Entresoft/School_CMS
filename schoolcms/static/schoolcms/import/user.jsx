/** @jsx React.DOM */

SC.UserPage = React.createClass({
  mixins: [SC.LoginPageMixin, React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      users: [],
      groups: [],
      total: 0,
      checkAll: false,
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
      callback();
      $.material.init();
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
  handleCheckAll: function(){
    var checkstate = !this.state.checkAll;
    for(var i=0;i<this.state.users.length;i++){
      this.refs['userItem_'+this.state.users[i].key].setState({check:checkstate});
    }
    this.setState({checkAll: checkstate});
  },
  render: function() {
    var userItems = this.state.users.map(function (user) {
      return (
        <SC.UserPageUserItem key={user.key} ref={'userItem_'+user.key} user={user}/>
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
                    <RB.Input type='checkbox' label={<b> 使用者名稱</b>}
                      onChange={this.handleCheckAll}/>
                  </th><th style={{padding:'0 8px 0 8px',lineHeight:'53px'}}>群組</th></tr>
                </thead>
                <tbody>{userItems}</tbody>
              </RB.Table>
            </RB.Well>
            <SC.Pagination path='/admin/user' start={this.props.start} total={this.state.total}
              query={{search:this.props.search}}/>
          </RB.Col></RB.Row>
        </RB.Grid>
      </div>
    );
  }
});


SC.UserPageUserItem = React.createClass({
  getInitialState: function(){
    return {
      'check': false,
    }
  },
  handleCheck: function(){
    this.setState({check:!this.state.check});
  },
  render: function() {
    return (
      <tr>
        <td className='col-md-2'>
          <RB.Input checked={this.state.check} type='checkbox'
            label={' '+this.props.user.name} onChange={this.handleCheck}/>
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
