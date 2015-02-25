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
            CSO.speechEffectEnabled=true;
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
            var id = 'cs_data_container', klas='cs-content-container cs-message';
            if (CSO.speechEffectEnabled) {
                klas+=' speech-enabled';
            }
            CSO.contentDataContainer = d.querySelector('#'+id) || createElementInBody(id, klas);
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
        var contentids = lookUpElementDataAttribute(event.target, 'csContentIds');
        if (contentids) {
            contentids.split(',').forEach(function(id){
                var e = d.querySelector('#cs_data_'+id);
                if (e) {
                    e.classList.add('cs-active');
                }
            });
        }
        positionContentContainer(event);
    },
    positionContentContainer = function(event){
        var c = getContentContainer(),rect = event.target.getBoundingClientRect(), crect = c.getBoundingClientRect();
        var body = d.body,docElem = d.documentElement,
        scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
        scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
        clientTop = docElem.clientTop || body.clientTop || 0,
        clientLeft = docElem.clientLeft || body.clientLeft || 0;

        c.style.left = (rect.left + scrollLeft - clientLeft + 50 + (rect.width/2))+'px';
        c.style.top = (rect.top + scrollTop - clientTop - crect.height - 15)+'px';
        // speech thingy
        if (CSO.speechEffectEnabled && crect.height > 0) {
            var offset = crect.height;
            offset -= parseInt(w.getComputedStyle(c).getPropertyValue('border-top-width'))||0;
            offset -= parseInt(w.getComputedStyle(c).getPropertyValue('border-bottom-width'))||0;
            addCSSRule('#cs_data_container::before', 'top:'+offset+'px !important;');
            addCSSRule('#cs_data_container::after', 'top:'+offset+'px !important;');
        }
        c.classList.add('cs-active');
    },
    hideElementContent = function(event){
        // hideElementContentItems();
        getContentContainer().classList.remove('cs-active');
        hideHighlightsInIndexData();
        clearCSSRules();
    },
    hideElementContentItems = function(){
        var eles = d.querySelectorAll('#cs_data_container .cs-content-item.cs-active'),i;
        for (i = 0; i < eles.length; i++) {
            eles[i].classList.remove('cs-active');
        }
    },
    hideHighlightsInIndexData = function(){
        var eles = d.querySelectorAll('#cs_index_container .cs-active'),i;
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
        var eles = getIndexContainer().querySelectorAll('.cs-active'),i,contentids = lookUpElementDataAttribute(event.target, 'csContentIds');;
        for (i = 0; i < eles.length; i++) {
            eles[i].classList.remove('cs-active');
        }

        if (contentids) {
            contentids.split(',').forEach(function(id){
                var e = d.querySelector('#cs_index_'+id);
                if (e) {
                    e.classList.add('cs-active');
                }
            });
        }
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
                // eles[i].addEventListener('mouseover', showElementContent, false);
                // eles[i].addEventListener('mouseover', highlightContentInIndexData, false);
                attachElementObservers(eles[i], 'mouseover');
            };
        }
    },
    attachElementObservers = function(element, eventName){
        attachElementObserver(element, eventName);
        // add observers to descendants
        var eles=element.querySelectorAll('*'),i;
        for (i = 0; i < eles.length; i++) {
            attachElementObserver(eles[i], eventName);
        }
    },
    attachElementObserver = function(element, eventName){
        element.addEventListener(eventName, showElementContent, false);
        element.addEventListener(eventName, highlightContentInIndexData, false);
    },
    attachBodyObserver = function(){
        d.body.addEventListener('click', hideElementContent, false);
    },
    keyDownListener = function(event) {
        var tagName=event.target.tagName.toLowerCase();
        if (tagName == 'input' || tagName == 'textarea' || event.target.contentEditable === 'true') {
            return;
        }
        var code=event.keyCode||event.which,i;
        if (event.shiftKey && code===191) {
            toggleCSActive();
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
    toggleCSActive = function() {
        CSO.isActive = d.body.dataset.csActive = d.body.dataset.csActive == 'false';
        hideElementContent();
        showDataContent();
        return false;
    },
    lookUpElementDataAttribute = function(element, attr){
        do {
            if (element.dataset[attr]) {
                return element.dataset[attr];
            }
        } while (element = element.parentNode)
        return null;
    },
    
    /*
    toggle = function(element){
        element.style.display=element.style.display=='none'?'':'none';
    },
    */
    addCSSRule = function(selector, rules, index) {
        var sheet = getDynamicStyleSheet().sheet;
        var index=index||(sheet.cssRules?sheet.cssRules.length:0);
        if (sheet.insertRule) {
            sheet.insertRule(selector + '{' + rules + '}', index);
        } else {
            sheet.addRule(selector, rules, index);
        }
    },
    clearCSSRules = function(){
        var sheet = getDynamicStyleSheet().sheet, rules = sheet.cssRules||[],i;
        for (i = 0; i < rules.length; i++) {
            sheet.deleteRule(i);
        };
    },
    getDynamicStyleSheet = function(){
        if (!CSO.dynamicCSS) {
            CSO.dynamicCSS = d.createElement('style');
            d.head.appendChild(CSO.dynamicCSS);
            CSO.id='cs_dynamic_css';
        }
        return CSO.dynamicCSS;
    },
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
