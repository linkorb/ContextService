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
      // d.getElementById('response').textContent = JSON.stringify(data);
      var b = d.createElement('div');
      b.className = 'cs-message';
      b.innerHTML = data.content;
      d.body.appendChild(b);
      log(data);
    },

    init = function() {
        csObject = w.ContextService;
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
        log(id);
    },
    fetchPage = function(){
        var i=0, url = csObject.baseUri+'fetchpage/'+csObject.account;
        for (i = 0; i < csObject.l.length; i++) {
            url+='/'+csObject.l[i];
        }
        jsonp(url);
    };
    w.addEventListener('load', init, false);
})(window, document);