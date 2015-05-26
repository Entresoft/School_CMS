/** @jsx React.DOM */

SC.ResizeTextArea = React.createClass({
  getInitialState: function(){
    return {
      'value': this.props.value,
    }
  },
  textareaResize: function(){
    var textarea = React.findDOMNode(this.refs.textarea).getElementsByTagName('textarea')[0];
    textarea.style.height = '0px'
    textarea.style.height = textarea.scrollHeight+20 + 'px';
    if(this.props.onChange){
      this.props.onChange();
    }else if(this.props.valueLink){
      this.props.valueLink.requestChange(this.refs.textarea.getValue());
    }
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
    other.className = (other.className?other.className:'')+'resizetextarea';
    return (
      <RB.Input {...other} type='textarea' ref='textarea' onChange={this.textareaResize} value={this.state.value} />
    );
  }
});
