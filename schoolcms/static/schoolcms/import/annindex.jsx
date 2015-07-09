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
  _getDayString: function(time_s){
    var this_day = moment.utc(time_s, 'YYYY-MM-DD HH:mm:ss').local();
    var today = moment().startOf('day');
    var yesterday = moment().startOf('day').subtract(1, 'days');
    var this_year = moment().startOf('year');
    if(this_day.isAfter(today))return this_day.format('MM/DD dddd [ (Today)]');
    if(this_day.isAfter(yesterday))return this_day.format('MM/DD dddd [ (Yesterday)]');
    if(this_day.isAfter(this_year))return this_day.format('MM/DD dddd');
    return this_day.format('YYYY - MM/DD dddd');
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
      <RB.Col xs={12} md={12} key={ann.id}>
        <RB.Well>
          <RB.Row>
            <RB.Col xs={12} md={12}>
              <h3><a href={SC.makeURL('/announce/'+ann.id,this.props.params)}>{ann.title}</a></h3>
              <small className='sc-border-a'>—— by&nbsp;
                <a href={SC.makeURL('/announce/',{group:ann.author_group_name})}>{ann.author_group_name}</a>
                &nbsp;‧&nbsp;
                <a href={SC.makeURL('/announce/',{author:ann.author_name})}>{ann.author_name}</a>
              </small><br/><br/>
            </RB.Col>
            <RB.Col xs={12} md={12}>
              標籤：{tags}<br/><br/>
            </RB.Col>
          </RB.Row>
        </RB.Well>
      </RB.Col>
    );
  },
  render: function() {
    var annItems = [];
    for(var i=0;i<this.state.anns.length;i++){
      var time_s = this._getDayString(this.state.anns[i].created);
      if(i==0||this._getDayString(this.state.anns[i-1].created)!==time_s){
        annItems.push(
          <RB.Col xs={12} md={12} key={i+'date'}>
            <h4>{time_s}</h4><hr/>
          </RB.Col>
        );
      }
      annItems.push(this._make_ann(this.state.anns[i]));
    }
    if(annItems.length===0)annItems[0]=(
      <RB.Col xs={12} md={12} key={0}>
        <h3>{function(){
          if(this.state.ready)return '抱歉，沒有找到符合的公告喔!';
          else return 'Loading...';
        }.bind(this)()}</h3>
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
      <div>
        <SC.SearchAnnForm params={this.props.params} groups={this.state.groups} authors={this.state.authors}/>
        <RB.Grid>
          {clear_search_btn}
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
        </RB.Grid>
      </div>
    );
  }
});


SC.SearchAnnForm = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function(){
    return {
      show: false,
      showing: false,
      search: this.props.params.search,
    };
  },
  componentWillReceiveProps: function(nextprops){
    if(this.props.params.search!=nextprops.params.search){
      this.setState({search: nextprops.params.search});
    }
  },
  componentDidUpdate: function(){
    this.refs.group.setValue(this.props.params.group);
    this.refs.author.setValue(this.props.params.author);
  },
  handleSearch: function(){
    var url = SC.makeURL(window.location.pathname,{
      search: this.state.search,
      group: this.refs.group.getValue(),
      author: this.refs.author.getValue(),
    });
    RMR.navigate(url);
  },
  handleToggle: function(){
    if(!this.state.showing){
      this.setState({showing:true});
      this.refs.fadein.toggle(function(){this.setState({showing:false})}.bind(this));
      this.setState({show: !this.state.show});
    }
  },
  render: function() {
    var search_nav_style = {
      position: 'relative',
      top:'-20px',
      width: '100%',
      padding: '5px 20px 5px 0',
      borderBottom: '2px solid #ddd',
      backgroundColor: '#f1f1f1',
    };
    var search_input_style = {
      display: 'block',
      'float': 'left',
      margin: '10px 5px 10px 5px',
      padding: '4px 4px 4px 4px',
      width: 'calc(100% - '+SC.getWindowSize('124px','238px','238px')+')',
      height: '40px',
      border: '0',
      backgroundColor: '#fff',
    };
    var search_btn_sytle = {
      'float': 'left',
      margin: '0 15px 0 15px',
      width: '84px',
    };
    var addon_search_input_sytle = {
      margin: '0 4px 0 4px',
      'float': 'left',
      width: '200px',
    };
    return (
      <SC.Form onSubmit={this.handleSearch}>
        <div style={search_nav_style}>
          <RB.Grid>
            <RB.Row>
              <div style={search_btn_sytle}>
                <RB.Button onClick={this.handleToggle} bsStyle={this.state.show?'danger':'warning'}
                    className={'btn-raised '+(this.state.show?'mdi-navigation-expand-less':'mdi-navigation-expand-more')}></RB.Button>
              </div>
              <input type='text' ref='search' name="search" valueLink={this.linkState('search')}
                  placeholder='請輸入關鍵字' style={search_input_style} className='form-control'/>
              {function(){
                if(SC.getWindowSize(0,1,1)){
                  return (
                    <div style={search_btn_sytle}>
                      <RB.Button onClick={this.handleSearch} bsStyle='success'
                          className='btn-raised mdi-action-search'></RB.Button>
                    </div>);
                }
              }.bind(this)()}
            </RB.Row>
          </RB.Grid>
        </div>
        <SC.SearchAnnFormFadein ref='fadein'>
          <RB.Grid>
            <div style={addon_search_input_sytle}>
              <SC.SelectInput ref='group' name="group" onChange={this.handleSearch}
                  options={this.props.groups} emptyOption label='公告群組' placeholder='公告群組'/><br/>
            </div>
            <div style={addon_search_input_sytle}>
              <SC.SelectInput ref='author' name="author" onChange={this.handleSearch}
                  options={this.props.authors} emptyOption label='公告者' placeholder='公告者'/><br/>
            </div>
          </RB.Grid>
        </SC.SearchAnnFormFadein>
      </SC.Form>
    );
  }
})

SC.SearchAnnFormFadein = React.createClass({
  getInitialState: function(){
    return {
      show: false,
    };
  },
  toggle: function(callback){
    this.setState({show: !this.state.show});
    setTimeout(callback, 300);
  },
  render: function() {
    var style = {
      position: 'relative',
      top:'-20px',
      width: '100%',
      height: 'auto',
      padding: '5px 0 0 0',
      borderBottom: '2px solid #bbb',
      backgroundColor: '#fcfcfc',
      transition: 'opacity 0.3s',
      MozTransition: 'opacity 0.3s', /* Firefox 4 */
      WebkitTransition: 'opacity 0.3s', /* Safari 和 Chrome */
      OTransition: 'opacity 0.3s', /* Opera */
      opacity: '1',
    };
    if(!this.state.show){
      style.height = '0';
      style.opacity = '0';
      style.overflow = 'hidden';
    }
    return (
      <div ref='div' style={style}>
        {this.props.children}
      </div>
    );
  }
});
