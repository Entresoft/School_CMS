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
    SC.resetWindow();
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
    if(this_day.isAfter(today))return this_day.format('ll (dddd) '+(moment.locale()==='zh-tw'?'[- 今天]':'[- Today]'));
    if(this_day.isAfter(yesterday))return this_day.format('ll (dddd) '+(moment.locale()==='zh-tw'?'[- 昨天]':'[- Yesterday]'));
    return this_day.format('ll (dddd)');
  },
  _make_ann: function (ann) {
    var tag = function(ann){
      if(ann.tags.length){
        return (
          <RB.Col xs={12} md={12}>
            標籤：{
              ann.tags.map(function(tag){
                return (<RB.Button key={tag} className='btn-primary' bsSize='small'>{tag}</RB.Button>);
              })
            }
            <br/><br/>
          </RB.Col>);
        return 
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
            {tag}
          </RB.Row>
        </RB.Well>
      </RB.Col>
    );
  },
  render: function() {
    var annItems = [], message;
    if(this.state.ready){
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
      if(annItems.length===0){message=(
        <RB.Col xs={12} md={12}>
          <h3>抱歉，沒有找到符合的公告喔!</h3>
        </RB.Col>
      );}
    }else{
      message = (<SC.Loading height='180px'/>);
    };
    var clear_search_btn = function(){
      var search_key = ['author','group','search','hours'];
      for(var i=0;i<search_key.length;i++){
        if(this.props.params[search_key[i]]&&this.props.params[search_key[i]].length){
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
          </RB.Row>
          <RB.Row>
            {message}
            {annItems}
          </RB.Row>
          <RB.Row>
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
    this.refs.hours.setValue(this.props.params.hours);
  },
  handleSearch: function(){
    var group = this.refs.group.getValue();
    var author = this.refs.author.getValue();
    var hours = this.refs.hours.getValue();
    if(this.state.search!==this.props.params.search||
          group!==this.props.params.group||
          author!==this.props.params.author||
          hours!==this.props.params.hours){
      var url = SC.makeURL(window.location.pathname,{
        search: this.state.search, group: group, author: author, hours: hours,
      });
      RMR.navigate(url);
    }
  },
  handleToggle: function(){
    if(!this.state.showing){
      this.setState({showing:true});
      this.refs.fadein.toggle(function(){this.setState({showing:false})}.bind(this));
      this.setState({show: !this.state.show});
    }
  },
  start_times: {
    '1小時內': 1,
    '24小時內': 24,
    '一週內': 168,
    '一個月內': 720,
    '一年內': 8760,
  },
  search_nav_style: {
    position: 'relative',
    top:'-20px',
    width: '100%',
    padding: '5px 20px 5px 0',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f1f1f1',
  },
  search_input_style: {
    display: 'block',
    'float': 'left',
    margin: '10px 5px 10px 5px',
    padding: '4px 4px 4px 4px',
    width: 'calc(100% - '+SC.getWindowSize('124px','238px','238px')+')',
    height: '40px',
    border: '0',
    backgroundColor: '#fff',
  },
  search_btn_sytle: {
    'float': 'left',
    margin: '0 15px 0 15px',
    width: '84px',
  },
  addon_search_input_sytle: {
    margin: '0 4px 0 4px',
    'float': 'left',
    width: '200px',
  },
  render: function() {
    return (
      <SC.Form onSubmit={this.handleSearch}>
        <div style={this.search_nav_style}>
          <RB.Grid>
            <RB.Row>
              <div style={this.search_btn_sytle}>
                <RB.Button onClick={this.handleToggle} bsStyle={this.state.show?'danger':'warning'}
                    className={'btn-raised '+(this.state.show?'mdi-navigation-expand-less':'mdi-navigation-expand-more')}></RB.Button>
              </div>
              <input type='text' ref='search' name="search" valueLink={this.linkState('search')}
                  placeholder='請輸入關鍵字' style={this.search_input_style} className='form-control'/>
              {function(){
                if(SC.getWindowSize(0,1,1)){
                  return (
                    <div style={this.search_btn_sytle}>
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
            <div style={this.addon_search_input_sytle}>
              <SC.SelectInput ref='group' name="group" onChange={this.handleSearch}
                  options={this.props.groups} emptyOption label='公告群組' placeholder='不限群組'/><br/>
            </div>
            <div style={this.addon_search_input_sytle}>
              <SC.SelectInput ref='author' name="author" onChange={this.handleSearch}
                  options={this.props.authors} emptyOption label='公告單位' placeholder='不限單位'/><br/>
            </div>
            <div style={this.addon_search_input_sytle}>
              <SC.SelectInput ref='hours' name="author" onChange={this.handleSearch}
                  options_kv={this.start_times} emptyOption label='時間' placeholder='不限時間'/><br/>
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
  style: {
    position: 'relative',
    top:'-20px',
    width: '100%',
    padding: '5px 0 0 0',
    borderBottom: '2px solid #bbb',
    backgroundColor: '#fcfcfc',
    transition: 'opacity 0.3s',
    MozTransition: 'opacity 0.3s', /* Firefox 4 */
    WebkitTransition: 'opacity 0.3s', /* Safari 和 Chrome */
    OTransition: 'opacity 0.3s', /* Opera */
  },
  render: function() {
    if(this.state.show){
      this.style.height = 'auto';
      this.style.opacity = '1';
      this.style.overflow = 'visible';
    }else{
      this.style.height = '0';
      this.style.opacity = '0';
      this.style.overflow = 'hidden';
    }
    return (
      <div ref='div' style={this.style}>
        {this.props.children}
      </div>
    );
  }
});
