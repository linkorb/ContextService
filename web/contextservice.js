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
        var b = d.createElement('div'),i;
        b.className = 'cs-message';
        for (i in csObject.response.content) {
            b.innerHTML+= '<div>'+csObject.response.content[i].title+'</div>';
        }
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
            eles[i].addEventListener('click', load, false);
        };
    },
    load = function(event) {
        var id = event.target.dataset.csid.replace(/\./g, '___');
        // log(id);
    },
    fetchPage = function(){
        if (csObject.account && csObject.contextid) {
            jsonp(csObject.baseUri+'api/v1/index/'+csObject.account+'/'+csObject.contextid);
        }
    };
    w.addEventListener('load', init, false);
})(window, document);