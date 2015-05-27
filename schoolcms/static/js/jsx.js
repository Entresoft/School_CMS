const RB=ReactBootstrap;const RMR=ReactMiniRouter;var Alert=RB.Alert;var SC={}
SC.makeURL=function(path,query){var q=[];for(var key in query){q.push(encodeURIComponent(key)+'='+encodeURIComponent(query[key]));}
return path+'?'+(q.join('&'));}
SC.GroupPage=React.createClass({displayName:'GroupPage',render:function(){var group_tag=this.props.groups.map(function(group){return(React.createElement(RB.Label,{key:group.id,bsStyle:"primary"},group.name));});return(React.createElement(RB.Grid,null,React.createElement(RB.Row,null,React.createElement(RB.Col,null,React.createElement(RB.Well,null,React.createElement("h3",null,"群組"),React.createElement("hr",null),group_tag)))));}});SC.LoginForm=React.createClass({displayName:'LoginForm',mixins:[React.addons.LinkedStateMixin],getInitialState:function(){return{_xsrf:'',account:'',alert:null,ready:false,};},componentWillMount:function(){var url='/api'+window.location.pathname+window.location.search;this.props.onLogin(function(user){if(user){RMR.navigate(this.props.next);}else{this.props.ajax(url,'GET',null,function(json){this.setState({_xsrf:json._xsrf,alert:json.alert,ready:true});}.bind(this));}}.bind(this));},handleLogin:function(){if(!this.state.ready)return;var url='/api'+window.location.pathname;var form=new FormData(React.findDOMNode(this.refs.form));this.props.ajax(url,'POST',form,function(json){if(json.login){this.props.onLogin(function(){RMR.navigate(this.props.next);}.bind(this));}else{this.setState({alert:json.alert});}}.bind(this));},errorMsg:function(){if(this.state.alert){return(React.createElement(RB.Alert,{dismiss:true,bsStyle:"danger"},React.createElement("strong",null,"登入失敗!")," ",this.state.alert));}},render:function(){return(React.createElement(SC.Form,{ref:"form",onSubmit:this.handleLogin},this.errorMsg(),React.createElement(RB.Input,{type:"hidden",name:"_xsrf",value:this.state._xsrf}),React.createElement(RB.Input,{type:"hidden",name:"next",value:this.props.next}),React.createElement(RB.Input,{type:"text",name:"account",valueLink:this.linkState('account'),placeholder:"帳號"}),React.createElement(RB.Input,{type:"password",name:"passwd",placeholder:"密碼"}),React.createElement("hr",null),React.createElement("div",{className:"btn-group btn-group-justified"},React.createElement("a",{className:"btn btn-danger btn-flat",onClick:function(){window.history.go(this.props.redirect?-2:-1);}.bind(this)},"返回"),React.createElement("a",{className:"btn btn-primary",onClick:this.handleLogin,disabled:!this.state.ready},"登入"))));},});SC.LoginPage=React.createClass({displayName:'LoginPage',componentWillMount:function(){var url='/api'+window.location.pathname+window.location.search;this.props.ajax(url,'GET',null,function(json){this.setState({_xsrf:json._xsrf,alert:json.alert});}.bind(this));},render:function(){return(React.createElement(RB.Grid,null,React.createElement(RB.Col,{xs:12,md:6,mdOffset:3},React.createElement(RB.Well,null,React.createElement("h1",null,"登入"),React.createElement("hr",null),React.createElement(SC.LoginForm,React.__spread({},this.props))))));}});SC.LogoutPage=React.createClass({displayName:'LogoutPage',componentWillMount:function(){var url='/api'+window.location.pathname;this.props.ajax(url,'GET',null,function(json){this.props.onLogout();RMR.navigate('/');}.bind(this));},render:function(){return(React.createElement("div",null));}});SC.AnnIndexPage=React.createClass({displayName:'AnnIndexPage',getInitialState:function(){return{anns:[],totle:0,};},ajax:function(){var url='/api'+window.location.pathname+window.location.search;this.props.ajax(url,'GET',null,function(json){this.setState({anns:json.anns,totle:json.totle});}.bind(this));},componentWillMount:function(){this.ajax();},componentWillReceiveProps:function(nextprops){if(this.props.search!=nextprops.search||this.props.start!=nextprops.start){this.ajax();}},handleSearch:function(search){var url=SC.makeURL(window.location.pathname,{'start':this.props.start,'search':search,});RMR.navigate(url);},render:function(){var annItems=this.state.anns.map(function(ann){return(React.createElement("tr",{key:ann.id},React.createElement("td",null,React.createElement("a",{href:'/announce/'+ann.id},ann.title)),React.createElement("td",null,ann.created)));});return(React.createElement("div",null,React.createElement(RB.Grid,null,React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:12,md:6},React.createElement("h1",null,"Announcement"),React.createElement("a",{href:"/announce/edit"},"New Announcement!"),React.createElement(SC.SearchAnnForm,{search:this.props.search,onSearch:this.handleSearch}))),React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:12,md:12},React.createElement(RB.Well,null,React.createElement(RB.Table,{striped:true,bordered:true,hover:true},React.createElement("thead",null,React.createElement("tr",null,React.createElement("th",null,"標題"),React.createElement("th",null,"公告時間"))),React.createElement("tbody",null,annItems))),React.createElement(SC.Pager,{start:this.props.start,totle:this.state.totle}))))));}});SC.SearchAnnForm=React.createClass({displayName:'SearchAnnForm',mixins:[React.addons.LinkedStateMixin],getInitialState:function(){return{search:this.props.search,};},componentWillReceiveProps:function(nextprops){if(nextprops.search!=this.props.search){this.setState({search:nextprops.search});}},handleSearch:function(){this.props.onSearch(this.state.search);},render:function(){var search_button=(React.createElement(RB.Button,{bsStyle:"primary",className:"btn-flat",onClick:this.handleSearch},"搜尋"));return(React.createElement(SC.Form,{onSubmit:this.handleSearch},React.createElement(RB.Input,{rel:"search",type:"text",name:"search",valueLink:this.linkState('search'),placeholder:"搜尋公告",buttonAfter:search_button})));}})
SC.Pager=React.createClass({displayName:'Pager',pageUrl:function(start){return'/announce?start='+start;},render:function(){var max=function(a,b){return a>b?a:b;};var min=function(a,b){return a<b?a:b;};return(React.createElement(RB.Pager,null,React.createElement(RB.PageItem,{previous:true,href:this.pageUrl(max(0,this.props.start-10)),disabled:this.props.start<=0},"← Previous Page"),React.createElement(RB.PageItem,{next:true,href:this.pageUrl(this.props.start+10),disabled:this.props.start+10>=this.props.totle},"Next Page →")));}});SC.AnnouncePage=React.createClass({displayName:'AnnouncePage',getInitialState:function(){return{title:'',content:'',created:'',updated:'',atts:[],id:'',};},componentWillMount:function(){var url='/api'+window.location.pathname;this.props.ajax(url,'GET',null,function(json){this.setState(json);}.bind(this));},render:function(){return(React.createElement(RB.Grid,null,React.createElement(RB.PageHeader,null,this.state.title,React.createElement("small",null," by 設備組‧組長")),React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:12,md:12},React.createElement(RB.Well,null,React.createElement("span",{dangerouslySetInnerHTML:{__html:marked(this.state.content,{sanitize:true,breaks:true})}})))),React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:12,md:6},React.createElement(RB.Well,null,React.createElement("h4",null,"附件"),React.createElement("hr",null),React.createElement(SC.AttachmentPanel,{atts:this.state.atts}))),React.createElement(RB.Col,{xs:12,md:6},React.createElement(RB.Well,null,React.createElement("h4",null,"時間"),React.createElement("hr",null),React.createElement("p",null,"發布於：",this.state.created),React.createElement("p",null,"最後更新：",this.state.updated)))),React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:12,md:2},React.createElement("a",{className:"btn btn-warning btn-xs btn-block",href:'/announce/edit/'+this.state.id},"編輯")),React.createElement(RB.Col,{xs:12,md:2},React.createElement("a",{className:"btn btn-primary btn-xs btn-block",href:"/announce/"},"返回")))));}});{}
SC.AttachmentPanel=React.createClass({displayName:'AttachmentPanel',_icon:['aac','ai','aiff','asp','avi','bmp','c','cpp','css','dat','dmg','doc','docx','dot','dotx','dwg','dxf','eps','exe','flv','gif','h','html','ics','iso','java','jpg','key','m4v','mid','mov','mp3','mp4','mpg','odp','ods','odt','otp','ots','ott','pdf','php','png','pps','ppt','pptx','psd','py','qt','rar','rb','rtf','sql','tga','tgz','tiff','txt','wav','xls','xlsx','xml','yml','zip'],_ms_office:['docx','doc','dot','dotx','xlsx','xlsb','xls','xlsm','pptx','ppsx','ppt','pps','pptm','potm','ppam','potx','ppsm'],openlink:function(att){if(this._ms_office.indexOf(att.filetype)>=0){return React.createElement("a",{target:"_blank",href:'https://view.officeapps.live.com/op/view.aspx?src='+encodeURIComponent(window.location.host+'/file/'+att.path)},"開啟")}else if(att.filetype!=='file'){return React.createElement("a",{target:"_blank",href:'/file/'+att.path},"開啟")}},render:function(){var attItems=this.props.atts.map(function(att){if(this._icon.indexOf(att.filetype)<0){att.filetype='file';}
return(React.createElement("div",{key:att.key,className:"media"},React.createElement("div",{className:"media-left"},React.createElement("img",{src:'/static/icon/'+att.filetype+'.png',alt:att.filetype})),React.createElement("div",{className:"media-body"},React.createElement("div",{className:"media-heading"},att.filename),React.createElement("div",null,this.openlink(att),React.createElement("a",{href:'/file/'+att.path+'?download=1'},"下載")))));}.bind(this));if(this.props.atts.length){return React.createElement("div",null,attItems);}else{return React.createElement("p",null,"沒有附件");}},});SC.App=React.createClass({displayName:'App',mixins:[RMR.RouterMixin],routes:{'/':'indexHandler','/login':'loginHandler','/logout':'logoutHandler','/admin/adduser':'adduserHandler','/announce':'annIndexHandler','/announce/edit':'editAnnHandler','/announce/edit/:ann_id':'editAnnHandler','/announce/:ann_id':'announceHandler','/group':'groupHandler','/grouplist':'groupListHandler',},ajax:function(url,method,data,callback){console.log('AJAX TO URL:'+url);var xhr=new XMLHttpRequest();xhr.open(method,url,true);this.setState({loading:0});xhr.onreadystatechange=function(){if(xhr.readyState==4){console.log('AJAX END');if(xhr.status){this.setState({status:xhr.status});}
setTimeout(function(){this.setState({loading:-1});}.bind(this),1000);if(xhr.status==200){callback(JSON.parse(xhr.response));}}}.bind(this);xhr.onprogress=function(e){if(e.lengthComputable){console.log('AJAX:'+e.loaded*100/e.total+'%');this.setState({loading:e.loaded*100/e.total});}}.bind(this);xhr.onerror=function(){this.setState({status:500});};xhr.send(data);},getInitialState:function(){return{loading:-1,status:200,current_user:null,};},componentWillMount:function(){this.getCurrentUser();},componentDidMount:function(){$.material.init();},componentWillUpdate:function(){if(this.state.url!=window.location.pathname+window.location.search){this.setState({url:window.location.pathname+window.location.search});}},getCurrentUser:function(callback){this.ajax('/api','GET',null,function(json){this.setState({current_user:json.current_user});if(callback){callback(json.current_user);}}.bind(this));},render:function(){var getPage=function(){if(this.state.status==200){return this.renderCurrentRoute();}else{return React.createElement("h1",null,"Geez, ",this.state.status);}}.bind(this);var progressBar=function(){if(this.state.loading>=0){return(React.createElement(RB.ProgressBar,{now:this.state.loading,className:"progress-bar-material-green-700",style:{position:'fixed',top:'0px',height:'4px',width:'100%',zIndex:100,}}));}}.bind(this);return(React.createElement("div",null,progressBar(),React.createElement(SC.NavbarInstance,{current_user:this.state.current_user,url:this.state.url}),getPage()));},indexHandler:function(){return React.createElement("a",{href:"/announce"},"Announce");},loginHandler:function(params){if(!params.next){params.next='/';}
if(this.state.current_user!=null){return React.createElement(SC.Redirect,{url:params.next})}
return React.createElement(SC.LoginPage,{ajax:this.ajax,next:params.next,redirect:params.redirect,onLogin:this.getCurrentUser});},logoutHandler:function(){return React.createElement(SC.LogoutPage,{ajax:this.ajax,onLogout:function(){this.setState({current_user:null})}.bind(this)});},adduserHandler:function(){return React.createElement(SC.LoginPage,null);},annIndexHandler:function(params){var toInt=function(i){return parseInt(i)?parseInt(i):0;}
params.start=toInt(params.start);return React.createElement(SC.AnnIndexPage,{ajax:this.ajax,start:params.start,search:params.search});},announceHandler:function(){return React.createElement(SC.AnnouncePage,{ajax:this.ajax});},editAnnHandler:function(ann_id,params){if(this.state.current_user==null){return React.createElement(SC.Redirect,{url:SC.makeURL('/login',{redirect:1,next:window.location.pathname})})}
return React.createElement(SC.EditAnnPage,{ajax:this.ajax});},groupHandler:function(){return React.createElement(SC.LoginPage,null);},groupListHandler:function(){return React.createElement(SC.LoginPage,null);},notFound:function(path){return React.createElement("div",{className:"not-found"},"Page Not Found: ",path);}});SC.Redirect=React.createClass({displayName:'Redirect',componentWillMount:function(){RMR.navigate(this.props.url);},render:function(){return(React.createElement("div",null));}});SC.EditAnnPage=React.createClass({displayName:'EditAnnPage',mixins:[React.addons.LinkedStateMixin],getInitialState:function(){return{title:'',content:'',tmpatts:[],atts:[],ann_id:'',_xsrf:'',submitLock:0,ready:false,};},componentWillMount:function(){var url='/api'+window.location.pathname;this.props.ajax(url,'GET',null,function(json){json.submitLock=false;json.ready=true;this.setState(json);}.bind(this));},handlePost:function(){if(this.state.submitLock)return false;this.setState({submitLock:true});var url='/api'+window.location.pathname;var data=new FormData(React.findDOMNode(this.refs.form));this.props.ajax(url,'POST',data,function(json){if(json.posted){RMR.navigate('/announce/'+json.ann_id);}else{this.setState(json);}}.bind(this));},alert:function(msg){this.setState({alert:msg});},lock:function(lock){this.setState({submitLock:this.state.submitLock+lock});},uploadAtt:function(att){var tmpatts=this.state.tmpatts;tmpatts.push(att);this.setState({tmpatts:tmpatts});},render:function(){var getAlert=function(){if(this.state.alert){return(React.createElement(Alert,{bsStyle:"danger",onDismiss:function(){this.setState({alert:null});}.bind(this)},React.createElement("h4",null,"錯誤！"),React.createElement("p",null,this.state.alert)));}}.bind(this);return(React.createElement(RB.Grid,null,React.createElement(RB.PageHeader,null,"編輯公告"),React.createElement(SC.Form,{ref:"form"},React.createElement(RB.Row,null,React.createElement(RB.Col,{md:12},getAlert())),React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:12,md:6},React.createElement(RB.Well,null,React.createElement(RB.Input,{type:"hidden",name:"_xsrf",value:this.state._xsrf}),React.createElement(RB.Input,{type:"text",name:"title",valueLink:this.linkState('title'),label:"公告標題",placeholder:"輸入公告標題",disabled:!this.state.ready}),React.createElement(SC.ResizeTextArea,{name:"content",valueLink:this.linkState('content'),label:"公告內容",placeholder:"輸入公告內容",disabled:!this.state.ready})),React.createElement(RB.Well,null,React.createElement("h4",null,"編輯附件"),React.createElement("hr",null),React.createElement(SC.AttPanel,{atts:this.state.atts,_xsrf:this.state._xsrf,uploaded:true,onChange:function(atts){this.setState({atts:atts})}.bind(this)}),React.createElement(SC.AttPanel,{atts:this.state.tmpatts,_xsrf:this.state._xsrf,onChange:function(atts){this.setState({tmpatts:atts})}.bind(this)}),React.createElement(SC.UploadAttBox,{_xsrf:this.state._xsrf,onUpload:this.uploadAtt,disabled:!this.state.ready,alert:this.alert,lock:this.lock}))),React.createElement(RB.Col,{xs:12,md:6},React.createElement(RB.Well,null,React.createElement("h4",null,"預覽內容"),React.createElement("hr",null),React.createElement("span",{dangerouslySetInnerHTML:{__html:marked(this.state.content,{sanitize:true,breaks:true})}})))),React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:12,md:2},React.createElement(RB.Button,{bsStyle:"success",bsSize:"xsmall",block:true,disabled:this.state.submitLock>0||this.state.title.length===0,onClick:this.handlePost},"確定")),React.createElement(RB.Col,{xs:12,md:2},React.createElement("a",{className:"btn btn-primary btn-xs btn-block",href:'/announce/'+this.state.ann_id},"返回"))))));}});SC.AttPanel=React.createClass({displayName:'AttPanel',handleDelete:function(att){atts=this.props.atts;atts.splice(atts.indexOf(att),1);this.props.onChange(atts);},render:function(){var atts=this.props.atts.map(function(att){return React.createElement(SC.AttComponent,{key:att.key,att:att,_xsrf:this.props._xsrf,onDelete:this.handleDelete,uploaded:this.props.uploaded})}.bind(this));return(React.createElement("div",null,atts));}});SC.AttComponent=React.createClass({displayName:'AttComponent',deleteAtt:function(){if(!confirm('你確定要刪除 '+this.props.att.filename+' 嗎?'))return;var xhr=new XMLHttpRequest();var form=new FormData();form.append('_xsrf',this.props._xsrf);var path=this.props.uploaded?'/file/':'/fileupload/';path+=this.props.att.key;xhr.open('DELETE',path,true);xhr.onreadystatechange=function(){if(xhr.readyState==4&&xhr.status==200){console.log(xhr.response);this.props.onDelete(this.props.att);}}.bind(this);xhr.send(form);},render:function(){var uploadinput=function(){if(!this.props.uploaded){return React.createElement("input",{type:"hidden",name:"attachment",value:this.props.att.key})}}.bind(this);return(React.createElement(RB.Panel,{key:this.props.key},uploadinput(),React.createElement(RB.Row,null,React.createElement(RB.Col,{xs:9,md:9},React.createElement("i",{className:"mdi-action-description"}),React.createElement("span",{className:"hideOverflow"},this.props.att.filename.substring(0,50))),React.createElement(RB.Col,{xs:3,md:3},React.createElement(RB.Button,{onClick:this.deleteAtt,bsStyle:"danger"},"刪除")))));}});SC.UploadAttBox=React.createClass({displayName:'UploadAttBox',getInitialState:function(){return{filelist:{},};},componentWillMount:function(){this.xhr={};},handleChange:function(evt){var file=evt.target.files[0];if(file.size>100000000){this.props.alert('檔案過大，檔案大小上限為100MB');return;}
this.props.lock(1);var form=new FormData();var uuid=new Date().getTime();this.xhr[uuid]=new XMLHttpRequest();var filelist=this.state.filelist;filelist[uuid]={percent:0.0,filename:file.name,};this.setState({filelist:filelist,file:'',});form.append('file',file);form.append('_xsrf',this.props._xsrf);this.xhr[uuid].open('POST','/fileupload',true);this.xhr[uuid].onreadystatechange=function(){if(this.xhr[uuid].readyState==4){if(this.xhr[uuid].status==200){var attfile=JSON.parse(this.xhr[uuid].response);this.props.onUpload({'filename':attfile.file_name,'key':attfile.key,});}else if(this.xhr[uuid].status){this.props.alert('發生錯誤，請重新整理網頁');}}}.bind(this);this.xhr[uuid].onerror=function(e){this.props.alert('發生錯誤，請重新整理網頁');}.bind(this);this.xhr[uuid].upload.onprogress=function(e){if(e.lengthComputable){var filelist=this.state.filelist;filelist[uuid].percent=e.loaded*100/e.total;this.setState({filelist:filelist});}}.bind(this);this.xhr[uuid].onloadend=function(){var filelist=this.state.filelist;delete filelist[uuid];this.setState({filelist:filelist,});this.props.lock(-1);}.bind(this);this.xhr[uuid].send(form);},progressBar:function(uuid){return(React.createElement(RB.Panel,{key:uuid},React.createElement(RB.Row,null,React.createElement(RB.Col,{md:9},React.createElement("i",{className:"mdi-action-description"}),this.state.filelist[uuid].filename.substr(0,50),React.createElement(RB.ProgressBar,{active:true,now:this.state.filelist[uuid].percent,label:"%(percent)s%"})),React.createElement(RB.Col,{md:3},React.createElement(RB.Button,{bsStyle:"danger",onClick:function(){this.xhr[uuid].abort();}.bind(this)},"取消")))))},render:function(){var uploading=[];for(var i in this.state.filelist){uploading.push(this.progressBar(i));}
var uploadButtonStyle={overflow:'hidden',position:'relative',width:'100%',};var uploadInputStyle={position:'absolute',width:'100%',height:'100%',top:0,opacity:0,};var uploadButton=(React.createElement(RB.Button,{disabled:this.props.disabled,style:uploadButtonStyle,className:"btn-material-grey-300 mdi-content-add"},React.createElement("input",{style:uploadInputStyle,type:"file",onChange:this.handleChange,disabled:this.props.disabled,value:''})));return(React.createElement("div",null,uploading,uploadButton));}});SC.NavbarInstance=React.createClass({displayName:'NavbarInstance',userSign:function(){if(this.props.current_user){return(React.createElement(RB.DropdownButton,{eventKey:1,title:this.props.current_user.name},React.createElement(RB.MenuItem,{eventKey:"1"},"Action"),React.createElement(RB.MenuItem,{eventKey:"2"},"Another action"),React.createElement(RB.MenuItem,{eventKey:"3"},"Something else here"),React.createElement(RB.MenuItem,{divider:true}),React.createElement(RB.MenuItem,{eventKey:"4",href:"/logout"},"Logout")))}else if(window.location.pathname.substr(0,6)!='/login'){return(React.createElement(RB.NavItem,{eventKey:1,href:'/login?next='+encodeURIComponent(this.props.url)},"Login"));}},render:function(){return(React.createElement(RB.Navbar,{brand:React.createElement("a",{href:"/"},"School Cms"),inverse:true,toggleNavKey:0,className:"navbar-material-brown"},React.createElement(RB.Nav,{right:true,eventKey:0}," ",this.userSign())));},});SC.ResizeTextArea=React.createClass({displayName:'ResizeTextArea',getInitialState:function(){return{'value':this.props.value,}},textareaResize:function(){var textarea=React.findDOMNode(this.refs.textarea).getElementsByTagName('textarea')[0];textarea.style.height='0px'
textarea.style.height=textarea.scrollHeight+20+'px';if(this.props.onChange){this.props.onChange();}else if(this.props.valueLink){this.props.valueLink.requestChange(this.refs.textarea.getValue());}},getValue:function(){return this.refs.textarea.getValue();},render:function(){var out=['valueLink','onChange','type','ref'];var other={};for(var key in this.props){if(out.indexOf(key)===-1){other[key]=this.props[key];}}
other.className=(other.className?other.className:'')+'resizetextarea';return(React.createElement(RB.Input,React.__spread({},other,{type:"textarea",ref:"textarea",onChange:this.textareaResize,value:this.props.valueLink?this.props.valueLink.value:this.state.value})));}});SC.Form=React.createClass({displayName:'Form',handleSubmit:function(e){e.preventDefault();e.stopPropagation();this.props.onSubmit();},render:function(){var out=['onSubmit'];var other={};for(var key in this.props){if(out.indexOf(key)===-1){other[key]=this.props[key];}}
return(React.createElement("form",React.__spread({},other,{onSubmit:this.handleSubmit}),this.props.children));}});