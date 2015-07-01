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
  handleClick: function(e){
    e.preventDefault();
    setTimeout(function(){ RMR.navigate(this.props.href); }.bind(this), 1);
    console.log('nave to '+this.props.href);
  },
  render: function() {
    var other = SC.makeOtherArray(['onClick', 'href'],this.props);
    return (
      <a {...other} href='#' onClick={this.handleClick}>{this.props.children}</a>
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
    this.setState({checked: this.ref.getValue()});
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
      value: this.props.defaultValue?this.props.defaultValue:'',
    }
  },
  componentDidMount: function(){
    $(React.findDOMNode(this.refs.select)).dropdown({
        autoinit : React.findDOMNode(this.refs.select),
        callback : function(){
          this._updateSelect(this.state.value);
        }.bind(this),
      });
    $(React.findDOMNode(this.refs.select)).bind('change', function(event){
      this.setState({value: event.currentTarget.value});
      if(this.props.onChange)this.props.onChange(event.currentTarget.value);
    }.bind(this));
  },
  getValue: function(){
    return this.state.value;
  },
  setValue: function(value){
    this.setState({value: value});
    this._updateSelect(value);
  },
  _updateSelect: function(_value){
    var dropdownjs = React.findDOMNode(this.refs.select).nextElementSibling;
    var selected = dropdownjs.getElementsByClassName('selected');
    for(var i=0;i<selected.length;i++){
      selected[i].className = '';
    }
    var options = dropdownjs.getElementsByTagName('li');
    for(var i=0;i<options.length;i++){
      if(options[i].getAttribute('value')===_value){
        options[i].className = 'selected';
      }
    }
    var input = dropdownjs.getElementsByTagName('input')[0];
    input.value = _value;
  },
  render: function() {
    var options = [];
    if(this.props.emptyOption){
      options.push(
        <option key={-1} value={''}></option>
      );
    }
    for(var key in this.props.options){
      options.push(
        <option key={key} value={this.props.options[key]}>{this.props.options[key]}</option>
      );
    }
    return (
      <div>
        <label>{this.props.label}</label>
        <input type='hidden' name={this.props.name} value={this.state.value}/>
        <select ref='select' placeholder={this.props.placeholder} className='form-control selectinput'>
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
  pageURL: function(start){
    var query = Object.create(this.props.query);
    query.start = start;
    return SC.makeURL(this.props.path,query);
  },
  handleSelect: function(event, selectedEvent){
    var page = selectedEvent.eventKey;
    var now = Math.ceil(this.props.start/this.props.step)+1;
    var all = Math.ceil(this.props.total/this.props.step);
    if(page>0&&page<=all&&page!==now){
      setTimeout(function(){ RMR.navigate(this.pageURL((page-1)*this.props.step)); }.bind(this), 1);
      if(this.props.resetWindow)$("html, body").animate({ scrollTop: 0 }, "slow");
    }
  },
  render: function() {
    var items = Math.ceil(this.props.total/this.props.step);
    if(items===0)items=1;
    var now = Math.ceil(this.props.start/this.props.step)+1;
    var maxBtn = SC.getWindowSize(5, 8, 10);
    return (
       <RB.Pagination prev next first last ellipsis={false}
          items={items}
          maxButtons={items>maxBtn?maxBtn:items}
          activePage={now}
          onSelect={this.handleSelect}
          className='shadow-z-2' />
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
