/** @jsx React.DOM */

SC.ResizeTextArea = React.createClass({
  handleChange: function(){
    if(this.props.onChange){
      this.props.onChange();
    }else if(this.props.valueLink){
      this.props.valueLink.requestChange(this.refs.textarea.getValue());
    }
  },
  textareaResize: function(){
    var textarea = React.findDOMNode(this.refs.textarea).getElementsByTagName('textarea')[0];
    textarea.style.height = '0px'
    textarea.style.height = textarea.scrollHeight+20 + 'px';
  },
  componentWillReceiveProps: function(nextprops) {
    this.textareaResize();
  },
  getValue: function(){
    return this.refs.textarea.getValue();
  },
  render: function() {
    var other = SC.makeOtherArray(['valueLink', 'onChange', 'type', 'ref'],this.props);
    if(!other.style)other.style={};
    other.style.resize='None';
    return (
      <RB.Input {...other} type='textarea' ref='textarea' onChange={this.handleChange}
        value={this.props.valueLink?this.props.valueLink.value:this.props.value}/>
    );
  }
});


SC.Form = React.createClass({
  handleSubmit: function(e){
    console.log('handleSubmit');
    e.preventDefault();
    e.stopPropagation();
    this.props.onSubmit();
  },
  render: function() {
    var other = SC.makeOtherArray(['onSubmit'],this.props);
    return (
      <form {...other} onSubmit={this.handleSubmit}>
        {this.props.children}
        <input type='submit' style={{display:'none'}}/>
      </form>
    );
  }
});


SC.A = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
  },
  componentDidMount: function(){
    React.findDOMNode(this.refs.a).addEventListener('click', this.handleClick);
  },
  handleClick: function(e){
    e.preventDefault();
    e.stopPropagation();
    setTimeout(function(){ RMR.navigate(this.props.href); }.bind(this), 1);
    console.log('nave to '+this.props.href);
  },
  render: function() {
    var other = SC.makeOtherArray(['onClick'],this.props);
    return (
      <a ref='a' {...other} >{this.props.children}</a>
    );
  }
});

SC.MenuItem = React.createClass({
  propTypes: {
    href:      React.PropTypes.string,
  },
  getDefaultProps: function() {
    return {
      href: '#',
    };
  },
  render: function() {
    return (
      <RB.MenuItem eventKey={this.props.eventKey}>
        <SC.A href={this.props.href}>{this.props.children}</SC.A>
      </RB.MenuItem>
    );
  }
});

SC.ToggleButton = React.createClass({
  getInitialState: function(){
    return {
      'checked': this.props.checked,
    }
  },
  componentWillReceiveProps: function(nextprops) {
    if(nextprops.checked!=this.props.checked){
      this.setState({checked:nextprops.checked});
    }
  },
  componentDidMount: function(){
    var input = React.findDOMNode(this.refs.input).getElementsByTagName('div')[0];
    input.classList.add('togglebutton');
    input.classList.remove('checkbox');
  },
  handleChange: function(){
    this.setState({checked: this.refs.input.getValue()});
  },
  render: function() {
    var other = SC.makeOtherArray(['checked'],this.props);
    return (
      <RB.Input type='checkbox' ref='input' {...other} checked={this.state.checked} onChange={this.handleChange} />
    );
  }
});

{/*Use options={list objext} to set option*/}
SC.SelectInput = React.createClass({
  getInitialState: function(){
    return {
      value: '',
    }
  },
  getDefaultProps: function() {
    return {
      options: [],
      options_kv: {},
      emptyOption: false,
      emptyOptionKey: null,
      placeholder: '',
    };
  },
  componentDidMount: function(){
    this.setState({value:$(React.findDOMNode(this.refs.select)).val()});
    if(!isMobile.any){
      $(React.findDOMNode(this.refs.select)).dropdown({
        autoinit : React.findDOMNode(this.refs.select),
        callback : function(){
          this._updateSelect();
        }.bind(this),
      });
    }
    $(React.findDOMNode(this.refs.select)).bind('change', function(event){
      this.setState({value: event.currentTarget.value});
      if(this.props.onChange)this.props.onChange(event.currentTarget.value);
    }.bind(this));
  },
  getValue: function(){
    return this.state.value;
  },
  setValue: function(value){
    if(!value)value = '';
    $(React.findDOMNode(this.refs.select)).val(value);
    this.setState({value:$(React.findDOMNode(this.refs.select)).val()});
    if(!isMobile.any){
      this._updateSelect();
    }
  },
  _updateSelect: function(){
    var _value = $(React.findDOMNode(this.refs.select)).val();
    var dropdownjs = React.findDOMNode(this.refs.select).nextElementSibling;
    var selected = dropdownjs.getElementsByClassName('selected');
    var input = dropdownjs.getElementsByTagName('input')[0];
    for(var i=0;i<selected.length;i++){
      selected[i].className = '';
    }
    var options = dropdownjs.getElementsByTagName('li');
    for(var i=0;i<options.length;i++){
      if(options[i].getAttribute('value')===_value){
        options[i].className = 'selected';
        input.value = options[i].innerText;
      }
    }
  },
  render: function() {
    var options = [];
    if(this.props.emptyOption){options.push(<option key={-1} value=''>{this.props.placeholder}</option>);}
    for(var key in this.props.options){
      options.push(<option key={key} value={this.props.options[key]}>{this.props.options[key]}</option>);
    }
    for(var key in this.props.options_kv){
      options.push(<option key={key} value={this.props.options_kv[key]}>{key}</option>);
    }
    return (
      <div>
        <label>{this.props.label}</label>
        <input type='hidden' name={this.props.name} value={this.state.value} readOnly/>
        <select ref='select' placeholder={this.props.placeholder} className='form-control'>
          {options}
        </select>
      </div>
    );
  }
});

SC.Pagination = React.createClass({
  propTypes: {
    path: React.PropTypes.string,
    step: React.PropTypes.number,
    start: React.PropTypes.number,
    total: React.PropTypes.number,
    query: React.PropTypes.object,
    resetWindow: React.PropTypes.bool,
  },
  getDefaultProps: function() {
    return {
      path: '/',
      step: 10,
      start: 0,
      total: 0,
      query: {},
      resetWindow: false,
    };
  },
  pageURL: function(page){
    var start = (page-1)*this.props.step;
    var query = Object.create(this.props.query);
    query.start = start;
    return SC.makeURL(this.props.path,query);
  },
  handleClick: function(){
    if(this.props.resetWindow)SC.resetWindow();
  },
  _make_btn: function(name, href){
    if(href.length)return (<a key={name} className='btn btn-default sc-pagination-default-btn' href={href} onClick={this.handleClick}>{name}</a>);
    else return (<RB.Button className='sc-pagination-disable' key={name}>{name}</RB.Button>);
  },
  render: function() {
    var all = Math.ceil(this.props.total/this.props.step);
    if(all===0)items = 1;

    var now = Math.ceil(this.props.start/this.props.step)+1;
    var maxBtn = SC.getWindowSize(1, 7, 10);
    if(maxBtn>all)maxBtn = all;

    var offset;
    if(now-1<maxBtn/2)offset = 0;
    else if(all-now<maxBtn/2)offset = all-maxBtn;
    else offset = now - Math.ceil(maxBtn/2);

    var btns = [];
    for(var i=0;i<maxBtn;i++){
      var page = offset+i+1;
      if(page===now){
        btns.push(<RB.Button key={page} className='btn-primary'>{page}</RB.Button>);
      }else{
        btns.push(this._make_btn(page, this.pageURL(page)));
      }
    }
    return (
      <div>
        <div className='btn-group'>
          {this._make_btn('«', now===1?'':this.pageURL(1))}
          {this._make_btn('‹', now===1?'':this.pageURL(now-1))}
        </div>
        <div className='btn-group'>
          {btns}
        </div>
        <div className='btn-group'>
          {this._make_btn('›', now===all?'':this.pageURL(now+1))}
        </div>
      </div>
    );
  }
});

SC.MaterialInit = React.createClass({
  componentDidMount: function(){
    $.material.init();
  },
  render: function() {
    return (
      <div />
    );
  }
});

SC.FBCommentBox = React.createClass({
  getDefaultProps: function() {
    return {
      uri: window.location.origin,
      maxPost: 5,
    };
  },
  render: function() {
    return (
      <div className="fb-comments" data-href={window.location.origin+this.props.uri}
        data-numposts={this.props.maxPost} data-width='100%'>
      </div>
    );
  }
});

SC.FBLikeBtn = React.createClass({
  getDefaultProps: function() {
    return {
      uri: window.location.origin,
    };
  },
  render: function() {
    return (
      <div className="fb-like" data-href={window.location.origin+this.props.uri}
          data-layout="button_count" data-action="like" data-show-faces="true"
          data-share="true" style={{display:'inline-block'}}></div>
    );
  }
});
