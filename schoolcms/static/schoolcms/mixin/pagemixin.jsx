/** @jsx React.DOM */

SC.PageMixin = {
  getInitialState: function() {
    return {
      ready: false
    };
  },
  componentDidMount: function(){
    console.log('Page Mixin Init');
    if(this.props.redirect){
      SC.Redirect(SC.makeURL('/login',{next:window.location.pathname+window.location.search}));
    }else{
      this.pageInit(function(){
        this.setState({ready: true});
      }.bind(this));
    }
  }
};
