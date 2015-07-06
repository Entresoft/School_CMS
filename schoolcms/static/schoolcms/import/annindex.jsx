/** @jsx React.DOM */

SC.AnnIndexPage = React.createClass({
  getInitialState: function() {
    return {
      anns: [],
      groups: [],
      authors: [],
      total: 0,
      ready: false,
    };
  },
  ajax: function(){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      json.ready = true;
      this.setState(json);
    }.bind(this));
  },
  componentDidMount: function(){
    this.ajax();
    $("html, body").animate({ scrollTop: 0 }, "slow");
  },
  componentWillReceiveProps: function(nextprops) {
    for(var k in this.props.params){
      if(this.props.params[k] != nextprops.params[k]){
        this.setState({ready:false});
        this.ajax();
        break;
      }
    }
  },
  _getDateString: function(time_s){
    var pass_time = new Date() - new Date(time_s)
    if(pass_time <= 86400000)return '今天';
    if(pass_time <= 172800000)return '昨天';
    return time_s;
  },
  _make_ann: function (ann) {
    var tags = function(ann){
      if(ann.tags.length){
        return ann.tags.map(function(tag){
          return (<RB.Button key={tag} className='btn-primary' bsSize='small'>{tag}</RB.Button>);
        });
      }else{
        return (<span>沒有分類標籤</span>);
      }
    }(ann);
    return (
      <RB.Col xs={12} md={6} lg={4} key={ann.id}>
        <RB.Well>
          <RB.Row>
            <RB.Col xs={9} md={9}>
              <h3 style={{fontWeight:'500'}}>{ann.title}</h3>
              <small>—— by&nbsp;
                <SC.A href={SC.makeURL('/announce/',{group:ann.author_group_name})}>{ann.author_group_name}</SC.A>
                &nbsp;‧&nbsp;
                <SC.A href={SC.makeURL('/announce/',{author:ann.author_name})}>{ann.author_name}</SC.A>
              </small><br/><br/>
            </RB.Col>
            <RB.Col xs={3} md={3}>
              <p style={{textAlign:'right'}}>{this._getDateString(ann.created.substr(0,10))}</p>
            </RB.Col>
            <RB.Col xs={12} md={12}>
              標籤：{tags}<br/><br/>
            </RB.Col>
            <RB.Col xs={12} md={12}>
              <SC.A href={SC.makeURL('/announce/'+ann.id,this.props.params)}
                className='btn btn-fab btn-primary btn-raised mdi-navigation-arrow-forward'></SC.A>
              <span>&nbsp;</span>
              {function(){
                if(ann.att_count)return (
                  <RB.OverlayTrigger placement='top' overlay={<RB.Popover>這篇公告有{ann.att_count}個附件</RB.Popover>}>
                    <RB.Button bsStyle='warning'
                      className='btn-fab btn-raised mdi-editor-attach-file'></RB.Button>
                  </RB.OverlayTrigger>
                );
              }()}
              <span>&nbsp;</span>
              {function(){
                if(ann.is_private)return (
                  <RB.OverlayTrigger placement='top' overlay={<RB.Popover>內部公告：只有管理員可以瀏覽</RB.Popover>}>
                    <RB.Button bsStyle='default'
                      className='btn-fab btn-raised mdi-action-visibility-off'></RB.Button>
                  </RB.OverlayTrigger>
                );
              }()}
            </RB.Col>
          </RB.Row>
        </RB.Well>
      </RB.Col>
    );
  },
  render: function() {
    var annItems = [];
    for(var i=0;i<this.state.anns.length;i++){
      annItems.push(this._make_ann(this.state.anns[i]));
      if(i%2==1)annItems.push(<div key={i+'md'} className="clearfix visible-md-block"></div>);
      if(i%3==2)annItems.push(<div key={i+'lg'} className="clearfix visible-lg-block"></div>);
    }
    if(annItems.length===0)annItems[0]=(
      <RB.Col xs={12} md={12} key={0}>
        <h2>{function(){
          if(this.state.ready)return '抱歉，沒有找到符合的公告喔!';
          else return 'Loading...';
        }.bind(this)()}</h2>
      </RB.Col>
    );
    var clear_search_btn = function(){
      for(var k in this.props.params){
        if(this.props.params[k].length){
          return (
            <RB.Row>
              <RB.Col xs={12} md={12}>
                <SC.A href='/announce/' className='btn btn-sm btn-danger btn-raised'>
                  <span style={{fontSize:'16px',fontWeight: 'bold'}} className='mdi-content-clear'>清除搜尋</span>
                </SC.A>
              </RB.Col>
            </RB.Row>
          );
        }
      }
    }.bind(this)();
    return (
      <div className='container-fluid'>
        {clear_search_btn}
        <RB.Row>
          <RB.Col xs={12} md={6} mdOffset={3}>
            <SC.SearchAnnForm params={this.props.params} groups={this.state.groups} authors={this.state.authors}/>
          </RB.Col>
        </RB.Row>
        <RB.Row>
          <RB.Col xs={12} md={12}>
            <SC.Pagination path='/announce' start={this.props.params.start} step={12} total={this.state.total}
              query={this.props.params}/>
          </RB.Col>
          {annItems}
          <RB.Col xs={12} md={12}>
            <SC.Pagination path='/announce' start={this.props.params.start} step={12} total={this.state.total}
              query={this.props.params} resetWindow/>
          </RB.Col>
        </RB.Row>
      </div>
    );
  }
});


SC.SearchAnnForm = React.createClass({
  getInitialState: function(){
    return {
      show: false,
    };
  },
  handleClick: function(){
    if(this.state.show){
      this.handleHide();
    }else{
      this.setState({show: true});
    }
  },
  handleHide: function(){
    this.refs.fade.fadeout();
    setTimeout(function(){this.setState({show: false})}.bind(this), 150);
  },
  render: function() {
    var style = {
      position: 'fixed',
      zIndex: 101,
      right: '0px',
      top: '20%',
      width: '100%',
    };
    var btnStyle = {
      position: 'relative',
      left: '-15px',
    };
    var btnState = function(){
      return this.state.show?' btn-danger mdi-content-clear':' btn-info mdi-action-search';
    }.bind(this);
    return (
      <div style={style}>
        <RB.Col xs={2} xsOffset={10} md={1} mdOffset={11} lg={12} lgOffset={11}
          style={{position: 'absolute'}}>
          <RB.Button ref='button' bsStyle='info' onClick={this.handleClick} style={btnStyle}
            className={'btn-fab btn-raised '+btnState()}></RB.Button>
        </RB.Col>
        <RB.Overlay show={this.state.show} placement="left" container={this}
          target={ function(){return React.findDOMNode(this.refs.button)}.bind(this) }>
          <SC.SearchAnnFormFadein ref='fade' {...this.props} onHide={this.handleHide}/>
        </RB.Overlay>
      </div>
    );
  }
})

SC.SearchAnnFormFadein = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function(){
    return {
      className: 'fade',
      search: this.props.params.search,
    }
  },
  componentDidMount: function(){
    this.setState({className: 'fade in'});
  },
  fadeout: function(){
    this.setState({className: 'fade'});
  },
  handleSearch: function(){
    var url = SC.makeURL(window.location.pathname,{
      search: this.state.search,
      group: this.refs.group.getValue(),
      author: this.refs.author.getValue(),
    });
    RMR.navigate(url);
    this.props.onHide();
  },
  handleClear: function(){
    this.setState({search: ''});
    this.refs.group.setValue('');
    this.refs.author.setValue('');
  },
  render: function() {
    return (
      <div className={this.state.className} style={{position:'static',width:'100%'}}>
        <RB.Col xs={10} md={6} mdOffset={5} lg={4} lgOffset={7} style={{position: 'absolute'}}>
          <div className='sc-ann-search-form'>
            <h3>搜尋</h3>
            <SC.Form onSubmit={this.handleSearch}>
              <RB.Input ref='search' type='text' name="search" valueLink={this.linkState('search')}
                  label='關鍵字搜尋' placeholder='輸入關鍵字'/>
              <SC.SelectInput ref='group' name="group" defaultValue={this.props.params.group}
                options={this.props.groups} emptyOption label='公告群組' placeholder='選擇公告群組'/><br/>
              <SC.SelectInput ref='author' name="author" defaultValue={this.props.params.author}
                options={this.props.authors} emptyOption label='公告者' placeholder='選擇公告者'/><br/>
              <RB.Button onClick={this.handleSearch}
                className='btn btn-fab btn-success btn-raised mdi-content-send'></RB.Button>
              &nbsp;
              <RB.Button onClick={this.handleClear}
                className='btn btn-fab btn-danger btn-raised mdi-content-reply-all'></RB.Button>
            </SC.Form>
          </div>
        </RB.Col>
      </div>
    );
  }
});
