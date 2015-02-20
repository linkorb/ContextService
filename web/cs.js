(function(w,d){
    
    // CSO = Context Service Object
    var CSO = {},
    init = function() {
        CSO = w.ContextService;
        if (CSO) {
            CSO.jsonpIndexCallback = jsonpIndexCallback;
            // CSO.jsonpContentCallback = jsonpContentCallback;
            CSO.contentResponse = [];
            attachKeyObserver();
            fetchIndex();
        }
    },
    fetchIndex = function(){
        if (CSO.account && CSO.contextid) {
            jsonp(CSO.baseUri+'api/v1/index/'+CSO.account+'/'+CSO.contextid+'?contenttypes='+CSO.contentTypes);
        }
    },
    renderIndexData = function() {
        var id = 'cs_index_container', o='', contentid,cssselector,lineContent;
        getIndexContainer();
        
        for (i in CSO.indexResponse.content) {
            cssselector = CSO.indexResponse.content[i].cssselector||'';
            contentid =CSO.indexResponse.content[i].contentid||'';

            // generate index HTML
            lineContent = '<a target="_blank" href="'+CSO.baseUri+'content/'+CSO.account+'/'+contentid+'">'+CSO.indexResponse.content[i].title+'</a>';
            o+='<li id="cs_index_'+contentid+'">'+lineContent+'</li>';
            
            // generate element content HTML
            getContentContainer().appendChild(
                createElementInBody('cs_data_'+contentid, 'cs-content-item', lineContent)
            );

            // observers
            observeElements(cssselector, contentid);
        }
        CSO.indexDataContainer.innerHTML = '<ul>'+o+'</ul>';
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
        /*
        var eles = d.querySelectorAll('#cs_data_container .cs-content-item.cs-active'),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].classList.remove('cs-active');
        }
        */
        getContentContainer().classList.remove('cs-active')
    },
    
    highlightContentInIndexData = function(event){
        if (!CSO.isActive) {
            return false;
        }
        var eles = getIndexContainer().querySelectorAll('li.cs-active'),i;
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
        d.addEventListener('keydown', toggleCSActive);
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
    },
    /*
    jsonpContentCallback = function(data){
        var c = getContentContainer(),ele;
        if (!c.querySelector('#cs_data_'+data.contentid)) {
            ele = createElementInBody('cs_data_'+data.contentid, 'cs-content-item', data.body);
            c.appendChild(ele);
        }
    },
    fetchElementContents = function(event) {
        event.target.dataset.csContentIds.split(',').forEach(fetchElementContent);
    },
    fetchElementContent = function(contentId, index) {
        if (!getContentContainer().querySelector('#cs_data_'+contentId)) {
            jsonp(CSO.baseUri+'api/v1/content/'+CSO.account+'/'+contentId);
        }
    },
    */
    
    // Utility functions

    log = function(msg){
        w.console.log(msg);
    },
    toggleCSActive = function(event) {
        var code=event.keyCode||event.which,i;
        if (event.shiftKey && code===191) {
            CSO.isActive = d.body.dataset.csActive = d.body.dataset.csActive == 'false';
        }
        hideElementContent();
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