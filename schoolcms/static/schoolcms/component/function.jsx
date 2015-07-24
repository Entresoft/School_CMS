/** @jsx React.DOM */

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

SC.getWindowSize = function(xs, md, lg){
  var x = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
  if(x<768)return xs;
  if(x<1200)return md;
  return lg;
}

SC.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

SC.Redirect = function(url){
  history.replaceState({}, '', url);
  window.dispatchEvent(window.sc_createEvent('popstate'));
}

SC.resetWindow = function(){
  if(isMobile.any){
    window.scrollTo(0,0);
  }else{
    $("html, body").animate({ scrollTop: 0 }, "slow");
  }
}

SC.is_group = function(group_name, user, groups){
  return (user&&user.admin||groups.indexOf(group_name)>=0);
}