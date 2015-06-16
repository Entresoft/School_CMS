/** @jsx React.DOM */

SC.UserPage = React.createClass({
  mixins: [SC.LoginPageMixin, React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      users: [],
      groups: [],
      total: 0,
      checkAll: false,
      _xsrf: '',
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
  toggleGroup: function(group_name){
    var have_group = true;
    var checked_userkey = [];
    var form = new FormData();
    form.append('_xsrf', this.state._xsrf);
    form.append('group', group_name);
    for(var i=0;i<this.state.users.length;i++){
      if(this.refs['userItem_'+this.state.users[i].key].state.check){
        checked_userkey.push(this.state.users[i].key);
        form.append('userkey', this.state.users[i].key);
        have_group &= (this.state.users[i].groups.indexOf(group_name)!==-1);
      }
    }
    if(checked_userkey.length===0){
      return false;
    }else if(have_group){
      this.props.ajax('/api/admin/group', 'delete', form, function(json){
        if(json.success){
          this.ajax(function(){});
        }
      }.bind(this));
    }else{
      this.props.ajax('/api/admin/group', 'post', form, function(json){
        if(json.success){
          this.ajax(function(){});
        }
      }.bind(this));
    }
  },
  render: function() {
    var userItems = this.state.users.map(function (user) {
      return (
        <SC.UserPageUserItem key={user.key} ref={'userItem_'+user.key} user={user}/>
      );
    });
    return (
      <div>
        <RB.Grid>
          <RB.Row>
            <RB.Col xs={12} md={6}>
              <h1>Users</h1>
              <RB.ModalTrigger
                modal={<SC.UserPageGroupModal
                  groups={this.state.groups} toggleGroup={this.toggleGroup}/>}>
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
              <RB.Button key={group} className='btn-material-brown-500' bsSize='small'>
                {group}
              </RB.Button>);
          })}
        </td>
      </tr>
    );
  }
});


SC.UserPageGroupModal = React.createClass({
  addGroup: function(){
    var group_name = prompt("請輸入群組名稱");
    if(group_name){
      this.selectGroup(group_name);
    }
  },
  selectGroup: function(group_name){
    this.props.onRequestHide();
    this.props.toggleGroup(group_name);
  },
  render: function() {
    var groupTags = this.props.groups.map(function (group) {
      return (
        <RB.Button key={group} className='btn-material-brown-500'
          onClick={function(){this.selectGroup(group);}.bind(this)}>
          {group}
        </RB.Button>
      );
    }.bind(this));
    return (
      <RB.Modal {...this.props} title={<span style={{fontSize:'25px'}}>選擇群組</span>} bsSize='large'>
        <div className='modal-body btn-material-green-200'>
          <br/>
          <RB.Button className='mdi-content-add btn-material-blue-grey-500'
            bsSize='small' onClick={this.addGroup}></RB.Button>
          <br/>
          {groupTags}
        </div>
        <div className='modal-footer'><br/></div>
      </RB.Modal>
    );
  }
});
