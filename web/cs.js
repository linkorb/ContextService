(function(w,d){
    
    // CSO = Context Service Object
    var CSO = {},
    init = function() {
        CSO = w.ContextService;
        if (CSO) {
            CSO.jsonpIndexCallback = jsonpIndexCallback;
            CSO.jsonpContentCallback = jsonpContentCallback;
            CSO.contentTypes={};
            (CSO.contentTypesString||'').split(',').forEach(function(v){
                CSO.contentTypes[v]=v;
            });
            CSO.contentTypes['']='';
            attachKeyObserver();
            attachButtonObserver();
            attachBodyObserver();
            fetchIndex();
        }
    },
    fetchIndex = function(){
        if (CSO.account && CSO.contextid) {
            jsonp(CSO.baseUri+'api/v1/index/'+CSO.account+'/'+CSO.contextid+'?contenttypes='+CSO.contentTypesString);
        }
    },
    renderIndexData = function() {
        var id = 'cs_index_container', o='',i, contentid,cssselector,lineContent,types={},type;
        getIndexContainer();
        
        for (i in CSO.indexResponse.content) {
            cssselector = CSO.indexResponse.content[i].cssselector||'';
            contentid =CSO.indexResponse.content[i].contentid||'';
            type = CSO.indexResponse.content[i].type||'';

            if (contentid) {
                // generate index HTML
                if (CSO.mode=='inline') {
                    lineContent = '<a data-cs-content-ids="'+contentid+'">'+CSO.indexResponse.content[i].title+'</a>';
                } else {
                    lineContent = '<a target="_blank" href="'+CSO.baseUri+'content/'+CSO.account+'/'+contentid+'">'+CSO.indexResponse.content[i].title+'</a>';
                }
                
                // o+='<li id="cs_index_'+contentid+'" data-cs-type="'+type+'">'+lineContent+'</li>';
                if (CSO.contentTypes[type]) {
                    if (!types[type])
                        types[type] = [];
                    types[type].push('<dd id="cs_index_'+contentid+'" data-cs-type="'+type+'">'+lineContent+'</dd>');
                }
                
                // generate element content HTML
                getContentContainer().appendChild(
                    createElementInBody('cs_data_'+contentid, 'cs-content-item', lineContent)
                );

                // observers
                observeElements(cssselector, contentid);
            }
        }
        for (i in types){
            o+='<dl><dt>'+i+'</dt>';
            types[i].forEach(function(v,k){
                o+=v;
            });
            o+='</dl>';
        }
        CSO.indexDataContainer.innerHTML = '<div>'+o+'</div>';
    },
    getContentContainer = function() {
        if (!CSO.contentDataContainer){
            var id = 'cs_data_container';
            CSO.contentDataContainer = d.querySelector('#'+id) || createElementInBody(id, 'cs-content-container cs-message');
        }
        return CSO.contentDataContainer;
    },
    getIndexContainer = function() {
        if (!CSO.indexDataContainer){
            var id = 'cs_index_container';
            CSO.indexDataContainer = d.querySelector('#'+id) || createElementInBody(id, 'cs-index-container cs-message');
        }
        return CSO.indexDataContainer;
    },
    
    showElementContent = function(event){
        if (!CSO.isActive) {
            return false;
        }
        hideElementContentItems();
        event.target.dataset.csContentIds.split(',').forEach(function(id){
            var e = d.querySelector('#cs_data_'+id);
            if (e) {
                e.classList.add('cs-active');
            }
        });
        var c = getContentContainer();
        c.classList.add('cs-active');
        var rect = event.target.getBoundingClientRect(), crect = c.getBoundingClientRect();
        c.style.left = rect.left+'px';
        c.style.top = (rect.top - crect.height - 10)+'px';
    },
    hideElementContent = function(event){
        // hideElementContentItems();
        getContentContainer().classList.remove('cs-active');
    },
    hideElementContentItems = function(){
        var eles = d.querySelectorAll('#cs_data_container .cs-content-item.cs-active'),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].classList.remove('cs-active');
        }
    },
    showDataContent = function(contentid){
        var eles = d.querySelectorAll('.cs-data-content-item'),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].classList.remove('cs-active');
        }
        if (contentid) {
            d.querySelector('#cs_data_content_'+contentid).classList.add('cs-active');
        }
        // hide the element popups
        hideElementContent();
    },
    
    highlightContentInIndexData = function(event){
        if (!CSO.isActive) {
            return false;
        }
        var eles = getIndexContainer().querySelectorAll('.cs-active'),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].classList.remove('cs-active');
        }
        event.target.dataset.csContentIds.split(',').forEach(function(id){
            var e = d.querySelector('#cs_index_'+id);
            if (e) {
                e.classList.add('cs-active');
            }
        });
    },
    

    // Observers
    attachKeyObserver = function(){
        // give initial csActive status
        d.body.dataset.csActive = 'false';
        CSO.isActive = false;
        d.addEventListener('keydown', keyDownListener);
    },
    attachButtonObserver = function(){
        var eles = d.querySelectorAll('[data-cs-togglebutton="true"]'),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].addEventListener('click', toggleCSActive, false);
        }
    },
    attachInlineModeLinks = function(){
        var eles = d.querySelectorAll('#cs_data_container a, #cs_index_container a'),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].addEventListener('click', fetchElementContents, false);
        }
    },
    observeElements = function(CssSelector, contentid){
        if (CssSelector && contentid) {
            var eles = d.querySelectorAll(CssSelector),i;
            for (i = 0; i < eles.length; i++) {
                eles[i].dataset.csContentIds = (eles[i].dataset.csContentIds?(eles[i].dataset.csContentIds+','):'')+contentid;
                eles[i].dataset.csHighlight = true;
                eles[i].addEventListener('mouseover', showElementContent, false);
                // eles[i].addEventListener('mouseout', hideElementContent, false);
                eles[i].addEventListener('mouseover', highlightContentInIndexData, false);
            };
        }
    },
    attachBodyObserver = function(){
        d.body.addEventListener('click', hideElementContent, false);
    },
    
    // Connectivity functions

    jsonp = function(url, callback) {
        var head = d.head, s = d.createElement('script');
        s.src=url;
        head.appendChild(s);
        head.removeChild(s);
    },
    jsonpIndexCallback = function(data) {
        CSO.indexResponse = data;
        renderIndexData();
        attachInlineModeLinks();
    },
    
    jsonpContentCallback = function(data){
        // var c = getContentContainer(),ele;
        var c = d.querySelector('#cs_index_'+data.contentid),ele;
        if (!c.querySelector('#cs_data_content_'+data.contentid)) {
            ele = createElementInBody('cs_data_content_'+data.contentid, 'cs-data-content-item', data.body);
            c.appendChild(ele);
        }
        showDataContent(data.contentid);
    },
    fetchElementContents = function(event) {
        event.target.dataset.csContentIds.split(',').forEach(fetchElementContent);
    },
    fetchElementContent = function(contentId, index) {
        var content = d.querySelector('#cs_data_content_'+contentId);
        if (content) {
            showDataContent(contentId);
        } else {
            jsonp(CSO.baseUri+'api/v1/content/'+CSO.account+'/'+contentId);
        }
    },

    
    // Utility functions

    log = function(msg){
        w.console.log(msg);
    },
    keyDownListener = function(event) {
        var tagName=event.target.tagName.toLowerCase();
        if (tagName == 'input' || tagName == 'textarea') {
            return;
        }
        var code=event.keyCode||event.which,i;
        if (event.shiftKey && code===191) {
            toggleCSActive();
        }
    },
    
    toggleCSActive = function() {
        CSO.isActive = d.body.dataset.csActive = d.body.dataset.csActive == 'false';
        hideElementContent();
        showDataContent();
        return false;
    },
    
    /*
    toggle = function(element){
        element.style.display=element.style.display=='none'?'':'none';
    },
    */
    createElementInBody = function(id, className, content){
        var c = d.createElement('div');
        if (id)
            c.id=id;
        if (className)
            c.className=className;
        if (content)
            c.innerHTML = content;
        d.body.appendChild(c);
        return c;
    };

    // init once window loaded
    w.addEventListener('load', init, false);

    // get CSS
    var style = d.createElement('link');
    style.rel='stylesheet';
    style.href=w.ContextService.baseUri+'cs.css';
    d.head.appendChild(style);

})(window, document);
