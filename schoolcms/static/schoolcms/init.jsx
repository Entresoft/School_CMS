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
