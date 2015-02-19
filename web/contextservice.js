(function(w,d){
    var csObject = {},
    log = function(msg){
        w.console.log(msg);
    },
    jsonp = function(url, callback) {
        var head = d.head, s = d.createElement('script');
        s.src=url;
        head.appendChild(s);
        head.removeChild(s);
    },
    jsonpCallback = function(data) {
        csObject.response = data;
        popupResponse();
    },
    popupResponse = function() {
        var b = d.createElement('div');
        b.className = 'cs-message';
        b.innerHTML = csObject.response.content;
        d.body.appendChild(b);
    },

    init = function() {
        csObject = w.ContextService;
        if (!csObject) {
            return false;
        }
        csObject.jsonpCallback = jsonpCallback;
        listen();
        fetchPage();
    },
    listen = function(){
        var eles = d.querySelectorAll('[data-csid]');
        for (var i = 0; i < eles.length; i++) {
            eles[i].addEventListener('click', load);
        };
    },
    load = function(event) {
        var id = event.target.dataset.csid.replace(/\./g, '___');
        // log(id);
    },
    fetchPage = function(){
        if (csObject.account && csObject.contextid) {
            jsonp(csObject.baseUri+'api/v1/fetchindex/'+csObject.account+'/'+csObject.contextid);
        }
    };
    w.addEventListener('load', init, false);
})(window, document);