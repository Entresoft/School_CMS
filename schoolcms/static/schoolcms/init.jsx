/** @jsx React.DOM */

const RB = ReactBootstrap;
const RMR = ReactMiniRouter;
var Alert = RB.Alert;
var SC = {}

SC.makeURL = function(path,query){
    var q = [];
    for(var key in query){
        q.push(encodeURIComponent(key)+'='+encodeURIComponent(query[key]));
    }
    return path+'?'+(q.join('&'));
}

SC.makeOtherArray = function(out, list){
    var other = {};
    for(var key in list){
      if(out.indexOf(key) === -1){
        other[key]=list[key];
      }
    }
    return other;
}

SC.LoginPageMixin = {
  getInitialState: function() {
    console.log('get Ready state!!');
    return {
      ready: false,
    };
  },
  componentDidMount: function(){
    console.log('IF login');
    if(!this.props.current_user){
      RMR.navigate(SC.makeURL('/login',{redirect:1,next:window.location.pathname+window.location.search}));
      return false;
    }
    this.pageInit(function(){
      this.setState({ready: true});
    }.bind(this));
  },
};
