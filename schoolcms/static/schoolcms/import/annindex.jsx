/** @jsx React.DOM */

SC.AnnIndexPage = React.createClass({
  getInitialState: function() {
    return {
      anns: [],
      total: 0,
    };
  },
  ajax: function(){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(json){
      this.setState({anns:json.anns,total:json.total});
    }.bind(this));
  },
  componentDidMount: function(){
    this.ajax();
  },
  componentWillReceiveProps: function(nextprops) {
    if(this.props.search!=nextprops.search||this.props.start!=nextprops.start){
      this.ajax();
    }
  },
  handleSearch: function(search){
    var url = SC.makeURL(window.location.pathname,{search: search});
    RMR.navigate(url);
  },
  render: function() {
    var annItems = this.state.anns.map(function (ann) {
      // return (
      //   <tr key={ann.id}>
      //     <td className='col-md-8 col-xs-8'><a href={'/announce/'+ann.id}>{ann.title}</a></td>
      //     <td className='col-md-2 col-xs-2'>{ann.created.substr(0,10)}</td>
      //     <td className='col-md-2 col-xs-2'>{ann.author_group_name}</td>
      //   </tr>
      // );
      return (
        <RB.Col xs={12} md={6} key={ann.id}>
          <RB.Well>
            <RB.Row>
              <RB.Col xs={9} md={9}>
                <h3>{ann.title}</h3>
                <small>—— by {ann.author_group_name} ‧ {ann.author_name}</small><br/><br/>
              </RB.Col>
               <RB.Col xs={3} md={3}>
                <p>{ann.created.substr(0,10)}</p>
              </RB.Col>
              <RB.Col xs={12} md={12}>
                <div style={{maxHeight: '180px',overflow:'hidden'}}>
                  <span dangerouslySetInnerHTML={{__html: marked(''+ann.content, {sanitize: false,breaks:true})}} />
                </div><br/>
              </RB.Col>
              <RB.Col xs={12} md={12}>
                <SC.A bsStyle='primary'
                  href={'/announce/'+ann.id}
                  className='btn btn-fab btn-primary mdi-content-forward'></SC.A>
              </RB.Col>
            </RB.Row>
          </RB.Well>
        </RB.Col>
      );
    });
    for(var i=2;i<annItems.length;i+=3){
      console.log(i);
      annItems.splice(i, 0, <div key={i+'c'} className="clearfix"></div>);
    }
    if(annItems.length===0)annItems[0]=(
      <RB.Col xs={12} md={12} key={0}>
        <h2>抱歉，沒有找到符合的公告喔!</h2>
      </RB.Col>
    );
    return (
      <div>
        <RB.Grid>
          <RB.Row>
            <RB.Col xs={12} md={6}>
              <h1>Announcement</h1>
              <a href="/announce/edit">New Announcement!</a>
              <SC.SearchAnnForm search={this.props.search} onSearch={this.handleSearch} />
            </RB.Col>
          </RB.Row>
          <RB.Row>
            <RB.Col xs={12} md={12}>
              <SC.Pagination path='/announce' start={this.props.start} total={this.state.total}
                query={{search:this.props.search}}/>
            </RB.Col>
            {/*<RB.Well>
              <RB.Table striped hover responsive>
                <thead>
                  <tr><th>標題</th><th>公告日期</th><th>單位</th></tr>
                </thead>
                <tbody>{annItems}</tbody>
              </RB.Table>
            </RB.Well>*/}
            {annItems}
            <RB.Col xs={12} md={12}>
              <SC.Pagination path='/announce' start={this.props.start} total={this.state.total}
                query={{search:this.props.search}}/>
            </RB.Col>
          </RB.Row>
        </RB.Grid>
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
