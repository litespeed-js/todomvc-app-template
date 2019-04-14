
let container=function(){let stock=[];let cachePrefix='none';let memory={};let setCachePrefix=function(prefix){cachePrefix=prefix;return this;};let getCachePrefix=function(){return cachePrefix;};let set=function(name,object,singleton,cache){if(typeof name!=='string'){throw new Error('var name must be of type string');}
    if(typeof singleton!=='boolean'){throw new Error('var singleton "'+singleton+'" of service "'+name+'" must be of type boolean');}
    if(cache){window.localStorage.setItem(getCachePrefix()+'.'+name,JSON.stringify(object));}
    stock[name]={name:name,object:object,singleton:singleton,instance:null};return this;};let get=function(name){let service=(undefined!==stock[name])?stock[name]:null;if(null===service){if(memory[getCachePrefix()+'.'+name]){return memory[getCachePrefix()+'.'+name];}
    let cached=window.localStorage.getItem(getCachePrefix()+'.'+name);if(cached){cached=JSON.parse(cached);memory[getCachePrefix()+'.'+name]=cached;return cached;}
    return null;}
    if(service.instance===null){let instance=(typeof service.object==='function')?this.resolve(service.object):service.object;if(name!=='window'&&name!=='document'&&name!=='element'&&typeof instance==='object'&&instance!==null){instance=new Proxy(instance,{name:service.name,get:function(obj,prop){if(prop==="__name"){return this.name;}
            if(typeof obj[prop]==='object'&&obj[prop]!==null){let handler=Object.assign({},this);handler.name=handler.name+'.'+prop;return new Proxy(obj[prop],handler)}
            else{return obj[prop];}},set:function(obj,prop,value,receiver){obj[prop]=value;let path=receiver.__name+'.'+prop;console.log('updated',path+'.changed',value);document.dispatchEvent(new CustomEvent(path+'.changed'));return true;},});}
        if(service.singleton){service.instance=instance;}
        return instance;}
    return service.instance;};let resolve=function(target){if(!target){return function(){};}
    let self=this;let FN_ARGS=/^function\s*[^\(]*\(\s*([^\)]*)\)/m;let text=target.toString()||'';let args=text.match(FN_ARGS)[1].split(',');return target.apply(target,args.map(function(value){return self.get(value.trim());}));};let path=function(path,value,as,prefix){as=(as)?as:container.get('$as');prefix=(prefix)?prefix:container.get('$prefix');path=path.replace(as,prefix).split('.');let object=this.get(path.shift());while(path.length>1){if(undefined==object){return null;}
    object=object[path.shift()];}
    if(undefined!=value){return object[path.shift()]=value;}
    if(undefined==object){return null;}
    let shift=path.shift();if(undefined==shift){return object;}
    return object[shift];};let container={set:set,get:get,resolve:resolve,path:path,bind:function(element,path,callback,as,prefix){as=(as)?as:container.get('$as');prefix=(prefix)?prefix:container.get('$prefix');document.addEventListener(path.replace(as,prefix)+'.changed',function(){console.log('update callback triggered');callback();});},setCachePrefix:setCachePrefix,getCachePrefix:getCachePrefix};set('container',container,true);return container;}();container.set('http',function(document){let globalParams=[],globalHeaders=[];let addParam=function(url,param,value){param=encodeURIComponent(param);let a=document.createElement('a');param+=(value?"="+encodeURIComponent(value):"");a.href=url;a.search+=(a.search?"&":"")+param;return a.href;};let request=function(method,url,headers,payload,progress){let i;if(-1===['GET','POST','PUT','DELETE','TRACE','HEAD','OPTIONS','CONNECT','PATCH'].indexOf(method)){throw new Error('var method must contain a valid HTTP method name');}
    if(typeof url!=='string'){throw new Error('var url must be of type string');}
    if(typeof headers!=='object'){throw new Error('var headers must be of type object');}
    if(typeof url!=='string'){throw new Error('var url must be of type string');}
    for(i=0;i<globalParams.length;i++){url=addParam(url,globalParams[i].key,globalParams[i].value);}
    return new Promise(function(resolve,reject){let xmlhttp=new XMLHttpRequest();xmlhttp.open(method,url,true);xmlhttp.setRequestHeader('Ajax','1');for(i=0;i<globalHeaders.length;i++){xmlhttp.setRequestHeader(globalHeaders[i].key,globalHeaders[i].value);}
        for(let key in headers){if(headers.hasOwnProperty(key)){xmlhttp.setRequestHeader(key,headers[key]);}}
        xmlhttp.onload=function(){if(4===xmlhttp.readyState&&200===xmlhttp.status){resolve(xmlhttp.response);}
        else{document.dispatchEvent(new CustomEvent('http-'+method.toLowerCase()+'-'+xmlhttp.status));reject(new Error(xmlhttp.statusText));}};if(progress){xmlhttp.addEventListener('progress',progress);xmlhttp.upload.addEventListener('progress',progress,false);}
        xmlhttp.onerror=function(){reject(new Error("Network Error"));};xmlhttp.send(payload);})};return{'get':function(url){return request('GET',url,{},'')},'post':function(url,headers,payload){return request('POST',url,headers,payload)},'put':function(url,headers,payload){return request('PUT',url,headers,payload)},'patch':function(url,headers,payload){return request('PATCH',url,headers,payload)},'delete':function(url){return request('DELETE',url,{},'')},'addGlobalParam':function(key,value){globalParams.push({key:key,value:value});},'addGlobalHeader':function(key,value){globalHeaders.push({key:key,value:value});}}},true);container.set('cookie',function(document){function get(name){let value="; "+document.cookie,parts=value.split("; "+name+"=");if(parts.length===2){return parts.pop().split(";").shift();}
    return null;}
    function set(name,value,days){let date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));let expires=(0<days)?'expires='+date.toUTCString():'expires=0';document.cookie=name+"="+value+";"+expires+";path=/";return this;}
    return{'get':get,'set':set}},true);Object.path=function(object,path,value){path=path.split('.');while(path.length>1){if(undefined===object){return null;}
    object=object[path.shift()];}
    if(undefined!==value){return object[path.shift()]=value;}
    if(undefined===object){return null;}
    return object[path.shift()];};if(!Array.prototype.includes){Array.prototype.includes=function(searchElement){'use strict';if(this==null){throw new TypeError('Array.prototype.includes called on null or undefined');}
    var O=Object(this);var len=parseInt(O.length,10)||0;if(len===0){return false;}
    var n=parseInt(arguments[1],10)||0;var k;if(n>=0){k=n;}else{k=len+n;if(k<0){k=0;}}
    var currentElement;while(k<len){currentElement=O[k];if(searchElement===currentElement||(searchElement!==searchElement&&currentElement!==currentElement)){return true;}
        k++;}
    return false;};}
container.set('view',function(http,container){let stock={};let execute=function(view,node,container){container.set('element',node,true);container.resolve(view.controller);if(true!==view.repeat){node.removeAttribute(view.selector);}};let parse=function(node,skip){if(node.attributes&&skip!==true){let attrs=[];let attrsLen=node.attributes.length;for(let x=0;x<attrsLen;x++){attrs.push(node.attributes[x].nodeName);}
    if(attrs&&attrsLen){if(1!==node.nodeType){return;}
        for(let x=0;x<attrsLen;x++){if(node.$lsSkip===true){break;}
            let pointer=(!/Edge/.test(navigator.userAgent))?x:(attrsLen-1)-x;let length=attrsLen;let attr=attrs[pointer];if(!stock[attr]){continue;}
            let comp=stock[attr];if(typeof comp.template==="function"){comp.template=container.resolve(comp.template);}
            if(!comp.template){(function(comp,node,container){execute(comp,node,container);})(comp,node,container);if(length!==attrsLen){x--;}
                continue;}
            node.classList.remove('load-end');node.classList.add('load-start');node.$lsSkip=true;http.get(comp.template).then(function(node,comp){return function(data){node.$lsSkip=false;node.innerHTML=data;node.classList.remove('load-start');node.classList.add('load-end');(function(comp,node,container){execute(comp,node,container);})(comp,node,container);parse(node,true);}}(node,comp),function(error){throw new Error('Failed to load comp template: '+error.message);});}}}
    if(true===node.$lsSkip){return;}
    let list=(node)?node.childNodes:[];if(node.$lsSkip===true){list=[];}
    for(let i=0;i<list.length;i++){let child=list[i];parse(child);}};return{stock:stock,add:function(object){if(typeof object!=='object'){throw new Error('object must be of type object');}
        let defaults={'selector':'','controller':function(){},'template':'','repeat':false,'protected':false};for(let prop in defaults){if(!defaults.hasOwnProperty(prop)){continue;}
            if(prop in object){continue;}
            object[prop]=defaults[prop];}
        if(!object.selector){throw new Error('View component is missing a selector attribute');}
        stock[object.selector]=object;return this;},render:function(element){parse(element);element.dispatchEvent(new window.Event('rendered',{bubbles:false}));}}},true);container.set('state',function(window){let states=[];let current=null;let previous=null;let getPrevious=function(){return previous;};let setPrevious=function(value){previous=value;return this;};let getCurrent=function(){return current;};let setCurrent=function(value){current=value;return this;};let setParam=function(key,value){state.params[key]=value;return this;};let getParam=function(key,def){if(key in state.params){return state.params[key];}
    return def;};let getParams=function(){return state.params;};let getURL=function(){return window.location.href;};let reset=function(){state.params=getJsonFromUrl(window.location.search);};let add=function(path,view){if(typeof path!=='string'){throw new Error('path must be of type string');}
    if(typeof view!=='object'){throw new Error('view must be of type object');}
    states[states.length++]={path:path,view:view};return this;};let match=function(location){let url=location.pathname;states.sort(function(a,b){return b.path.length-a.path.length;});states.sort(function(a,b){let n=b.path.split('/').length-a.path.split('/').length;if(n!==0){return n;}
    return b.path.length-a.path.length;});for(let i=0;i<states.length;i++){let value=states[i],match=new RegExp("^"+value.path.replace(/:[^\s/]+/g,'([\\w-]+)')+"$");let found=url.match(match);if(found){previous=current;current=value;return value;}}
    return null};let change=function(URL,replace){if(!replace){window.history.pushState({},'',URL);}
else{window.history.replaceState({},'',URL);}
    window.dispatchEvent(new PopStateEvent('popstate',{}));return this;};let reload=function(){return change(window.location.href);};let getJsonFromUrl=function(URL){let query;if(URL){let pos=location.href.indexOf('?');if(pos===-1)return[];query=location.href.substr(pos+1);}else{query=location.search.substr(1);}
    let result={};query.split('&').forEach(function(part){if(!part){return;}
        part=part.split('+').join(' ');let eq=part.indexOf('=');let key=eq>-1?part.substr(0,eq):part;let val=eq>-1?decodeURIComponent(part.substr(eq+1)):'';let from=key.indexOf('[');if(from===-1){result[decodeURIComponent(key)]=val;}
        else{let to=key.indexOf(']');let index=decodeURIComponent(key.substring(from+1,to));key=decodeURIComponent(key.substring(0,from));if(!result[key]){result[key]=[];}
            if(!index){result[key].push(val);}
            else{result[key][index]=val;}}});return result;};let state={setParam:setParam,getParam:getParam,getParams:getParams,getURL:getURL,add:add,change:change,reload:reload,reset:reset,match:match,getCurrent:getCurrent,setCurrent:setCurrent,getPrevious:getPrevious,setPrevious:setPrevious,params:getJsonFromUrl(window.location.search)};return state;},true);container.set('expression',function(container,filter,$as,$prefix){let reg=/(\{{.*?\}})/gi;let paths=[];return{parse:function(string,def,as,prefix){def=def||'';paths=[];return string.replace(reg,function(match)
    {let reference=match.substring(2,match.length-2).replace('[\'','.').replace('\']','').trim();reference=reference.split('|');let path=(reference[0]||'');let result=container.path(path,undefined,as,prefix);if(!paths.includes(path)){paths.push(path);}
        result=(null===result||undefined===result)?def:result;result=(typeof result==='object')?JSON.stringify(result):result;if(reference.length>=2){for(let i=1;i<reference.length;i++){result=filter.apply(result,reference[i],{});}}
        return result;});},getPaths:function(){return paths;},}},true);container.set('filter',function(){let filters={};let add=function(name,callback){filters[name]=callback;return this;};let apply=function(value,name){return filters[name](value);};add('uppercase',function(value){return value.toUpperCase();});add('lowercase',function(value){return value.toLowerCase();});return{add:add,apply:apply}},true);container.get('filter').add('escape',function(value){if(typeof value!=='string'){return value;}
    return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/\'/g,'&#39;').replace(/\//g,'&#x2F;');});container.set('window',window,true).set('document',window.document,true).set('element',window.document,true);let app=function(version){return{run:function(window){try{container.get('http').addGlobalParam('version',version);this.view.render(window.document);}
    catch(error){var handler=container.resolve(this.error);handler(error);}},error:function(){return function(error){console.error('error',error.message,error.stack,error.toString());}},container:container,view:container.get('view')}};container.get('view').add({selector:'data-ls-init',controller:function(element,window,document,view,state){let firstFromServer=(element.getAttribute('data-first-from-server')==='true');let scope={selector:'data-ls-scope',template:false,repeat:true,controller:function(){},state:true},init=function(route){window.scrollTo(0,0);if(window.document.body.scrollTo){window.document.body.scrollTo(0,0);}
        state.reset();scope.protected=(undefined!==route.view.protected)?route.view.protected:false;if(scope.protected&&(null===state.getPrevious())){throw new Error('CSRF protection');}
        scope.template=(undefined!==route.view.template)?route.view.template:null;scope.controller=(undefined!==route.view.controller)?route.view.controller:function(){};scope.state=(undefined!==route.view.state)?route.view.state:true;document.dispatchEvent(new CustomEvent('state-change'));if(firstFromServer&&null===state.getPrevious()){scope.template='';}
        else if(null!==state.getPrevious()){scope.nested=false;view.render(element);}
        document.dispatchEvent(new CustomEvent('state-changed'));},findParent=function(tagName,el){if((el.nodeName||el.tagName).toLowerCase()===tagName.toLowerCase()){return el;}
        while(el=el.parentNode){if((el.nodeName||el.tagName).toLowerCase()===tagName.toLowerCase()){return el;}}
        return null;};view.add(scope);document.addEventListener('click',function(event){let target=findParent('a',event.target);if(!target){return false;}
        if(!target.href){return false;}
        if((event.metaKey)){return false;}
        if((target.hasAttribute('target'))&&('_blank'===target.getAttribute('target'))){return false;}
        if(target.hostname!==window.location.hostname){return false;}
        let route=state.match(target);if(null===route){return false;}
        event.preventDefault();if(window.location===target.href){return false;}
        route.view.state=(undefined===route.view.state)?true:route.view.state;if(true===route.view.state){if(state.getPrevious()&&state.getPrevious().view&&(state.getPrevious().view.scope!==route.view.scope)){window.location.href=target.href;return false;}
            window.history.pushState({},'Unknown',target.href);}
        init(route);return true;});window.addEventListener('popstate',function(){let route=state.match(window.location);if(state.getPrevious()&&state.getPrevious().view&&(state.getPrevious().view.scope!==route.view.scope)){window.location.reload();return false;}
        init(route);});init(state.match(window.location));}});container.get('view').add({selector:'data-ls-attrs',controller:function(element,expression,$as,$prefix){let attrs=element.dataset['lsAttrs'].trim().split(',');let paths=[];let check=function(){for(let i=0;i<attrs.length;i++){let attr=attrs[i].split('=');let key=(attr[0])?expression.parse(attr[0],null,$as,$prefix):null;paths=paths.concat(expression.getPaths());let value=(attr[1])?expression.parse(attr[1],null,$as,$prefix):null;paths=paths.concat(expression.getPaths());if(!key){return null;}
        element.setAttribute(key,value);}};check();for(let i=0;i<paths.length;i++){container.bind(element,paths[i],check);}}});container.get('view').add({selector:'data-ls-bind',controller:function(element,expression,container,$prefix,$as){let echo=function(value,bind=true){if(element.tagName==='INPUT'||element.tagName==='SELECT'||element.tagName==='BUTTON'||element.tagName==='TEXTAREA'){let type=element.getAttribute('type');if('radio'===type){if(value.toString()===element.value){element.setAttribute('checked','checked');}
    else{element.removeAttribute('checked');}}
        if('checkbox'===type){if(typeof value==='boolean'){if(value===true){element.setAttribute('checked','checked');element.value=true;}
        else{element.removeAttribute('checked');element.value=false;}
            if(bind){element.addEventListener('change',function(){container.path(path,element.checked,$as,$prefix);});}}
            return;}
        if(element.value!==value){element.value=value;}
        if(bind){element.addEventListener('input',sync);}}
    else{if(element.innerText!==value){element.innerHTML=value;}}};let sync=(function(as,prefix){return function(){container.path(path,element.value,as,prefix);}})($as,$prefix);let path=element.dataset['lsBind'];let result=container.path(path);container.bind(element,path,function(){echo(container.path(path,undefined,$as,$prefix),false);});echo(result,true);}});container.get('view').add({selector:'data-ls-if',controller:function(element,expression,$as,$prefix){let result='';let syntax=element.dataset['lsIf']||'';let debug=element.dataset['debug']||false;let paths=[];let check=function(){if(debug){console.info('debug-ls-if',expression.parse(syntax,'undefined',$as,$prefix));}
        try{result=!!(eval(expression.parse(syntax,'undefined',$as,$prefix).replace(/(\r\n|\n|\r)/gm,' ')));}
        catch(error){throw new Error('Failed to evaluate expression "'+syntax+'": '+error);}
        paths=expression.getPaths();if(!result){element.style.visibility='hidden';element.style.display='none';}
        else{element.style.removeProperty('display');element.style.removeProperty('visibility');}};check();for(let i=0;i<paths.length;i++){container.bind(element,paths[i],check);}}});container.get('view').add({selector:'data-ls-loop',template:false,repeat:false,nested:false,controller:function(element,view,container,window){let expr=element.dataset['lsLoop'];let echo=function(){let array=container.path(expr);array=(!array)?[]:array;while(element.hasChildNodes()){element.removeChild(element.lastChild);}
        if(array instanceof Array&&typeof array!=='object'){throw new Error('Reference value must be array or object. '+(typeof array)+' given');}
        let children=[];element.$lsSkip=true;element.style.visibility=(0===array.length)?'hidden':'visible';for(let prop in array){if(!array.hasOwnProperty(prop)){continue;}
            children[prop]=children[prop]||element.backup.cloneNode(true);element.appendChild(children[prop]);(function(index){let context=expr+'.'+index;container.set(element.dataset['lsAs'],container.path(context),true);container.set('$index',index,true);container.set('$prefix',context,true);container.set('$as',element.dataset['lsAs'],true);view.render(children[prop]);})(prop);}
        container.set('$index',null,true);container.set('$prefix','',true);container.set('$as','',true);};element.template=(element.template)?element.template:(element.children.length===1)?element.children[0].innerHTML:'';if(!element.backup){element.backup=(element.children.length===1)?element.children[0]:window.document.createElement('li');}
        echo();document.addEventListener(expr+'.changed',echo);document.addEventListener(expr+'.length.changed',echo);}});container.get('view').add({selector:'data-ls-template',template:false,repeat:true,controller:function(element,view,http,expression,document){let template=expression.parse(element.dataset['lsTemplate']);let type=element.dataset['type']||'url';element.innerHTML='';let parse=function(data,element){element.innerHTML=data;view.render(element);element.dispatchEvent(new CustomEvent('template-loaded',{bubbles:true,cancelable:false}));};if('script'===type){let inlineTemplate=document.getElementById(template);if(inlineTemplate&&inlineTemplate.innerHTML){parse(inlineTemplate.innerHTML,element);}
    else{element.innerHTML='<span style="color: red">Missing template "'+template+'"</span>';}
        return;}
        http.get(template).then(function(element){return function(data){parse(data,element);}}(element),function(){throw new Error('Failed loading template');});}});

(function (window) {
    "use strict";

    const ENTER_KEY = 13;

    window.Demo = app('v1.0.0'); // Init app and set cache buster value

    let state = window.Demo.container.get('state');

    state
        .add('/todomvc-app-template/', {
            //template: '/todomvc-app-template/index.html',
            controller: function (tasks) {
                tasks.showAll();
            }
        })
        .add('/todomvc-app-template/completed', {
            //template: '/todomvc-app-template/index.html',
            controller: function (tasks) {
                tasks.showCompleted();
            }
        })
        .add('/todomvc-app-template/active', {
            //template: '/todomvc-app-template/index.html',
            controller: function (tasks) {
                tasks.showActive();
            }
        })
    ;

    window.Demo.container
        .set('tasks', function () {
            return {
                title: 'Task Title',
                list: [],
                add: function (task) {
                    task.id = this.list.length;
                    this.list.push(task);
                },
                remove: function (key) {
                    let scope = this;
                    this.list.forEach(function(task, index) {
                        if(task.id === key) {
                            return scope.list.splice(index, 1);
                        }
                    });
                },
                completeAll: function () {
                    this.list.forEach(function(task) {
                        task.completed = true;
                    });
                },
                showAll: function () {
                    this.list.forEach(function(task) {
                        task.show = true;
                    });
                },
                showCompleted: function () {
                    this.list.forEach(function(task) {
                        task.show = (task.completed === true);
                    });
                },
                showActive: function () {
                    this.list.forEach(function(task) {
                        task.show = (task.completed === false);
                    });
                },
                clearCompleted: function () {
                    let scope = this;
                    let list = this.list;

                    for(let i = 0; i < list.length; i++) {
                        let task = list[i];

                        if(task.completed === true) {
                            scope.remove(task.id);
                            --i;
                        }
                    }
                }
            }
        }, true)
    ;

    window.Demo.container.get('filter')
        .add('completed', function (value) {
            if(value) {
                return 'completed';
            }

            return '';
        })
        .add('items', function (value) {
            switch (value) {
                case 0:
                case value > 1:
                    return 'items';
                case 1:
                    return 'item'
            }

            return '';
        })
    ;

    window.Demo.container.get('view')
        .add({
            selector: 'data-tasks-add',
            controller: function(element, tasks) {
                element.addEventListener('submit', function () {
                    event.preventDefault();

                    tasks.add({
                        completed: false,
                        show: true,
                        title: element.task.value
                    });

                    element.reset();
                });
            }
        })
        .add({
            selector: 'data-tasks-remove',
            controller: function(element, tasks, expression) {
                let id = parseInt(expression.parse(element.dataset['tasksRemove']));

                element.addEventListener('click', function () {
                    tasks.remove(id);
                });
            }
        })
        .add({
            selector: 'data-tasks-complete',
            controller: function(element, tasks) {
                element.addEventListener('click', function () {
                    tasks.completeAll();
                });
            }
        })
        .add({
            selector: 'data-tasks-clear-completed',
            controller: function(element, tasks) {
                element.addEventListener('click', function () {
                    tasks.clearCompleted();
                });
            }
        })
        .add({
            selector: 'data-tasks-edit',
            controller: function(element, tasks, expression) {
                let id = parseInt(expression.parse(element.dataset['tasksEdit']));

                element.addEventListener('dblclick', function () {
                    if(element.classList.contains('editing')) {
                        element.classList.remove('editing');
                    }
                    else {
                        element.classList.add('editing');
                        let input = element.getElementsByClassName('edit')[0];

                        input.focus();

                        input.addEventListener('blur', function () {
                            element.classList.remove('editing');
                        });

                        input.addEventListener('input', function (e) {
                            let key = e.which || e.keyCode;
                            if (key === ENTER_KEY) {
                                element.classList.remove('editing');
                            }

                            if(input.value === '') {
                                tasks.remove(id);
                                element.classList.remove('editing');
                            }
                        });
                    }
                });
            }
        })
    ;

    window.Demo.run(window);

}(window));