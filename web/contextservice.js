(function(w,d){
    // CSO = Context Service Object
    var CSO = {},
    init = function() {
        CSO = w.ContextService;
        if (CSO) {
            CSO.jsonpIndexCallback = jsonpIndexCallback;
            CSO.jsonpContentCallback = jsonpContentCallback;
            CSO.contentResponse = [];
            listen();
            fetchIndex();
            attachKeyObserver();
        }
    },
    log = function(msg){
        w.console.log(msg);
    },
    jsonp = function(url, callback) {
        var head = d.head, s = d.createElement('script');
        s.src=url;
        head.appendChild(s);
        head.removeChild(s);
    },
    fetchIndex = function(){
        if (CSO.account && CSO.contextid) {
            jsonp(CSO.baseUri+'api/v1/index/'+CSO.account+'/'+CSO.contextid);
        }
    },
    
    jsonpIndexCallback = function(data) {
        CSO.indexResponse = data;
        prepareIndexData();
    },
    jsonpContentCallback = function(data){
        log(data.contentid);
        CSO.contentResponse[data.contentid] = data;
        // CSO.contentResponse.push(data);
        // prepareContentData();
    },
    prepareIndexData = function() {
        var id = 'cs_index_container', o='';
        CSO.indexDataContainer = d.querySelector('#'+id) || createElementInBody(id, 'cs-message', true);

        for (i in CSO.indexResponse.content) {
            // generate index HTML
            o+='<li id="cs_index_item_'+(CSO.indexResponse.content[i].contentid||'')+'"><a target="_blank" href="'+CSO.baseUri+'content/'+CSO.account+'/'+(CSO.indexResponse.content[i].contentid||'')+'">'+CSO.indexResponse.content[i].title+'</a></li>';
            // observers
            listen(CSO.indexResponse.content[i].cssselector||null, CSO.indexResponse.content[i].contentid||null);
        }
        CSO.indexDataContainer.innerHTML = '<ul>'+o+'</ul>';
    },
    prepareContentData = function(){
        log(CSO.contentResponse);
    },

    createElementInBody = function(id, className, hidden){
        var c = d.createElement('div');
        if (id)
            c.id=id;
        if (className)
            c.className=className;
        if (hidden)
            c.style.display='none';
        d.body.appendChild(c);
        return c;
    },

    listen = function(CssSelector, contentid){
        if (!CssSelector)
            return;
        var eles = d.querySelectorAll(CssSelector),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].addEventListener('click', load, false);
            eles[i].dataset.csContentId = contentid;
            eles[i].dataset.csHighlight = true;
        };
    },
    attachKeyObserver = function(){
        d.addEventListener('keyup', function(event){
            var code=event.keyCode||event.which,i;
            // if (event.altKey && code==16) {
            if (code==16) {
                toggle(d.querySelector('#cs_index_container'));
                d.body.dataset.csActive = true;
            } else {
                d.body.dataset.csActive = false;
            }
        });
    },
    toggle = function(element){
        element.style.display=element.style.display=='none'?'':'none';
    },
    load = function(event) {
        var contentid = event.target.dataset.csContentId;//.replace(/\./g, '___');
        jsonp(CSO.baseUri+'api/v1/content/'+CSO.account+'/'+contentid);
    };
    w.addEventListener('load', init, false);
    var style = d.createElement('link');
    style.rel='stylesheet';
    style.href=w.ContextService.baseUri+'contextservice.css';
    d.head.appendChild(style);
})(window, document);