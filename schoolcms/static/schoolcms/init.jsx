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
