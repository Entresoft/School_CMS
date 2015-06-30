/** @jsx React.DOM */

SC.AnnIndexPage = React.createClass({
  getInitialState: function() {
    return {
      anns: [],
      total: 0,
      ready: false,
    };
  },
  ajax: function(){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      this.setState({anns:json.anns,total:json.total,ready:true});
    }.bind(this));
  },
  componentDidMount: function(){
    this.ajax();
  },
  componentWillReceiveProps: function(nextprops) {
    if(this.props.search!=nextprops.search||this.props.start!=nextprops.start){
      this.setState({ready:false});
      this.ajax();
    }
  },
  handleSearch: function(search){
    var url = SC.makeURL(window.location.pathname,{search: search});
    RMR.navigate(url);
  },
  _getDateString: function(time_s){
    var pass_time = new Date() - new Date(time_s)
    if(pass_time <= 86400000)return '今天';
    if(pass_time <= 172800000)return '昨天';
    return time_s;
  },
  _make_ann: function (ann) {
    return (
      <RB.Col xs={12} md={6} lg={4} key={ann.id}>
        <RB.Well>
          <RB.Row>
            <RB.Col xs={9} md={9}>
              <h3 style={{fontWeight:'500'}}>{ann.title}</h3>
              <small>—— by {ann.author_group_name} ‧ {ann.author_name}</small><br/><br/>
            </RB.Col>
            <RB.Col xs={3} md={3}>
              <p style={{textAlign:'right'}}>{this._getDateString(ann.created.substr(0,10))}</p>
            </RB.Col>
            <RB.Col xs={12} md={12}>
              <SC.A
                href={SC.makeURL('/announce/'+ann.id,{start:this.props.start,search:this.props.search})}
                className='btn btn-fab btn-primary btn-raised mdi-content-send'></SC.A>
              &nbsp;
              {function(){
                if(ann.att_count)return (
                  <RB.OverlayTrigger placement='top' overlay={<RB.Popover>這篇公告有{ann.att_count}個附件</RB.Popover>}>
                    <RB.Button bsStyle='warning'
                      className='btn-fab btn-raised mdi-editor-attach-file'></RB.Button>
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
    return (
      <div className='container-fluid'>
        <RB.Row>
          <RB.Col xs={12} md={6} lg={5} lgOffset={1}>
            <h1>Announcement</h1>
            <a href="/announce/edit">New Announcement!</a>
            <SC.SearchAnnForm search={this.props.search} onSearch={this.handleSearch} />
          </RB.Col>
        </RB.Row>
        <RB.Row>
          <RB.Col xs={12} md={12}>
            <SC.Pagination path='/announce' start={this.props.start} step={12} total={this.state.total}
              query={{search:this.props.search}}/>
          </RB.Col>
          {annItems}
          <RB.Col xs={12} md={12}>
            <SC.Pagination path='/announce' start={this.props.start} step={12} total={this.state.total}
              query={{search:this.props.search}} resetWindow/>
          </RB.Col>
        </RB.Row>
      </div>
    );
  }
});


SC.SearchAnnForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      search: this.props.search,
    };
  },
  componentWillReceiveProps: function(nextprops) {
    if(nextprops.search!=this.props.search){
      this.setState({search:nextprops.search});
    }
  },
  handleSearch: function(){
    this.props.onSearch(this.state.search);
  },
  render: function() {
    var search_button = (
      <RB.Button bsStyle='primary' className='btn-flat' onClick={this.handleSearch}>搜尋</RB.Button>
    );
    return (
      <SC.Form onSubmit={this.handleSearch}>
        <RB.Input rel='search' type='text' name="search" valueLink={this.linkState('search')}
            placeholder='搜尋公告'
            buttonAfter={search_button}/>
      </SC.Form>
    );
  }
})
