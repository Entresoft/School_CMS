/** @jsx React.DOM */

SC.AnnIndexPage = React.createClass({
  getInitialState: function() {
    return {
      annlist: [],
    };
  },
  componentWillMount: function(){
    var url = '/api'+window.location.pathname+window.location.search;
    this.props.ajax(url,'GET',null,function(data){
      this.setState({annlist:data.anns,start:data.start,totle:data.totle});
    }.bind(this));
  },
  handleSearch: function(search){
    var url = SC.makeURL(window.location.pathname,{
                  'start': this.props.start,
                  'totle': this.props.totle,
                  'search': search,
                });
    RMR.navigate(url, true);
    this.props.ajax('/api'+url,'GET',null,function(data){
      this.setState({annlist:data.anns,start:data.start,totle:data.totle});
    }.bind(this));
  },
  render: function() {
    var annItems = this.state.annlist.map(function (ann) {
      return (
        <tr key={ann.id}>
          <td><a href={'/announce/'+ann.id}>{ann.title}</a></td>
          <td>{ann.created}</td>
        </tr>
      );
    });
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
          <RB.Row><RB.Col xs={12} md={12}>
            <RB.Well>
              <RB.Table striped bordered hover>
                <thead>
                  <tr><th>標題</th><th>公告時間</th></tr>
                </thead>
                <tbody>{annItems}</tbody>
              </RB.Table>
            </RB.Well>
            <SC.Pager start={this.props.start} totle={this.props.totle} />
          </RB.Col></RB.Row>
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


SC.Pager = React.createClass({
  pageUrl: function(start){
    return '/announce?start='+start;
  },
  render: function() {
    var max = function(a,b){return a>b?a:b;};
    var min = function(a,b){return a<b?a:b;};
    return (  
      <RB.Pager>
        <RB.PageItem previous href={this.pageUrl(max(0,this.props.start-10))} disabled={this.props.start<=0} >&larr; Previous Page</RB.PageItem>
        <RB.PageItem next href={this.pageUrl(this.props.start+10)} disabled={this.props.start+10>=this.props.totle} >Next Page &rarr;</RB.PageItem>
      </RB.Pager>
    );
  }
});