/** @jsx React.DOM */

SC.UserPage = React.createClass({
  mixins: [SC.PageMixin, React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      users: [],
      groups: [],
      total: 0,
      checkAll: false,
      au_account: '',
      au_passwd: '',
      au_name: '',
      au_admin: false,
      au_alert: '',
      au_success: false
    };
  },
  ajax: function(callback){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      this.setState(json);
      if(callback)callback();
    }.bind(this));
  },
  pageInit: function(callback){
    this.ajax(function(){
      callback();
      $.material.init();
    });
  },
  componentWillReceiveProps: function(nextprops) {
    if(this.props.start!==nextprops.start||this.props.search!==nextprops.search){
      this.ajax(function(){
        this.setState({checkAll:false});
        $.material.init();
      }.bind(this));
    }
  },
  adduserModal: function(){
    var handleSubmin = function(){
      var form = new FormData(React.findDOMNode(this.refs.au_form));
      this.props.ajax('/api/admin/user', 'post', form, function(json){
        if(json.success){
          this.setState({
            au_account: '',
            au_passwd: '',
            au_name: '',
            au_alert: '',
            au_admin: false,
            au_success: true
          });
          this.ajax(function(){
            $.material.init();
          });
        }else{
          this.setState({au_alert:json.alert, au_success: false});
        }
      }.bind(this));
    }.bind(this);
    var successMsg = function(){
      if(this.state.au_success)return (
        <RB.Alert dismiss={true} bsStyle='success'
          onDismiss={function(){this.setState({au_success:false})}.bind(this)}>
          <strong>新增成功!</strong> 成功新增一位使用者
        </RB.Alert>);
    }.bind(this);
    var errorMsg = function(){
      if(this.state.au_alert)return (
        <RB.Alert dismiss={true} bsStyle='danger'
          onDismiss={function(){this.setState({au_alert:false})}.bind(this)}>
          <strong>失敗!</strong> {this.state.au_alert}
        </RB.Alert>);
    }.bind(this);
    return (
      <RB.Modal onRequestHide={function(){}}
        title={<span style={{fontSize:'25px'}}>新增使用者</span>} >
        <div className='modal-body'>
          <SC.Form ref='au_form' onSubmit={handleSubmin}>
            { successMsg() }
            { errorMsg() }
            <RB.Input type='hidden' name="_xsrf" value={SC.getCookie('_xsrf')} />
            <RB.Input type='text' name="account" valueLink={this.linkState('au_account')} label='帳號' placeholder='帳號' />
            <RB.Input type='text' name="passwd" valueLink={this.linkState('au_passwd')} label='密碼' placeholder='密碼' />
            <RB.Input type='text' name="name" valueLink={this.linkState('au_name')} label='名稱' placeholder='名稱' />
            <SC.SelectInput name='identity' options={['學生','教師']} label='身份' placeholder='身份'/><br/>
            <RB.Input type='checkbox' checked={this.state.au_admin} name="admin" label=' 系統管理員'
              onChange={function(){this.setState({au_admin:!this.state.au_admin})}.bind(this)}/>
            <hr/>
            <div className="btn-group btn-group-justified">
              <a className='btn btn-danger btn-flat' onClick={function(){this.onRequestHide}}>返回</a>
              <a className='btn btn-primary' onClick={handleSubmin}>新增</a>
            </div>
            <SC.MaterialInit/>
          </SC.Form>
        </div>
        <div className='modal-footer'><br/></div>
      </RB.Modal>);
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
    form.append('_xsrf', SC.getCookie('_xsrf'));
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
              <RB.ModalTrigger modal={this.adduserModal()}>
                <RB.Button className='mdi-social-person-add'></RB.Button>
              </RB.ModalTrigger>
              <RB.ModalTrigger
                modal={<SC.UserPageGroupModal
                  groups={this.state.groups} toggleGroup={this.toggleGroup}/>}>
                <RB.Button className='mdi-social-group-add'></RB.Button>
              </RB.ModalTrigger>
            </RB.Col>
          </RB.Row>
          <RB.Row><RB.Col xs={12} md={12}>
            <RB.Well>
              <RB.Table striped hover>
                <thead><tr>
                  <th style={{padding:'0 8px 0 8px'}}>
                    <RB.Input type='checkbox' label={<b> 使用者帳號</b>}
                      onChange={this.handleCheckAll} checked={this.state.checkAll}/>
                  </th>
                  <th style={{padding:'0 8px 0 8px',lineHeight:'53px'}}>使用者名稱</th>
                  <th style={{padding:'0 8px 0 8px',lineHeight:'53px'}}>群組</th>  
                </tr></thead>
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
      'check': false
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
            label={' '+this.props.user.account} onChange={this.handleCheck}/>
        </td>
        <td className='col-md-2'>
          <span style={{padding:'0 8px 0 8px',lineHeight:'53px'}}>{this.props.user.name}</span>
        </td>
        <td className='col-md-8'>
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
