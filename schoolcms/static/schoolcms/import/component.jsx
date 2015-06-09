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
    var out = ['valueLink', 'onChange', 'type', 'ref'];
    var other = {};
    for(var key in this.props){
      if(out.indexOf(key) === -1){
        other[key]=this.props[key];
      }
    }
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
    var out = ['onSubmit'];
    var other = {};
    for(var key in this.props){
      if(out.indexOf(key) === -1){
        other[key]=this.props[key];
      }
    }
    return (
      <form {...other} onSubmit={this.handleSubmit}>{this.props.children}</form>
    );
  }
});


SC.A = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
  },
  handleClick: function(e){
    e.preventDefault();
    RMR.navigate(this.props.href);
    console.log('nave to '+this.props.href);
  },
  render: function() {
    var out = ['onClick', 'href'];
    var other = {};
    for(var key in this.props){
      if(out.indexOf(key) === -1){
        other[key]=this.props[key];
      }
    }
    return (
      <a {...other} href={this.props.href} onClick={this.handleClick}>{this.props.children}</a>
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
