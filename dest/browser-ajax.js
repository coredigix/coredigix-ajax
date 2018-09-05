/*
navigator plugin
*/
(function() {
  /*
  create request sercuits
  */
  /* resolve URL */
  /*
  request adapter
  @param {XMLHTTPRequest} options.xhr custom xhr to use with the request

  @param {int} options.timeout request timeout
  @param {string} options.type request type
  @param {URL} url URL
  @param {string} options.cache true|false

  @param {string} options.responseType type of the response (arraybuffer)

  @param {function} options.upload cb on upload progress
  @param {function} options.download cb on download progress
  @param {function} options.load cb on load
  @param {function} options.error cb on errror
  @param {function} options.headersReceived cb on headers received

  @param {map} options.headers request headers map

  @param {mixed} options.data data to send
  */
  /*
  generate random string
  */
  /*
  single request sender
  @param {XMLHTTPRequest} options.xhr custom xhr to use with the request

  @param {int} options.timeout request timeout
  @param {string} options.type request type

  @param {URL} options.url URL
  @param {map} options.params GET params
  @param {string} options.cache true|false

  @param {function} options.upload cb on upload progress
  @param {function} options.download cb on download progress
  @param {function} options.headersReceived cb on headers received

  @param {map} headers request headers map
  */
  var MAX_META_REDIRECTS, MIME_TYPE_MAP, _absURL, _ancore, _req, _requestQueu, _request_queu, _resolveURL, _sendRequest, assert, randomString, request, requestResponse, strUpSnakeCase;
  // convert an URL to abs
  _ancore = document.createElement('a');
  _absURL = function(url) {
    _ancore.setAttribute('href', url);
    return _ancore.href;
  };
  
  // assert
  assert = function(pattern, errMsg) {
    if (!pattern) {
      if (typeof errMsg === 'string') {
        throw new Error(errMsg);
      } else {
        throw errMsg;
      }
    }
  };
  _sendRequest = function(url, options) {
    var k, nativeXhr, prm, ref, response, urlParams, v;
    // xhr
    nativeXhr = options.xhr || new XMLHttpRequest();
    if (options.timeout != null) {
      nativeXhr.timeout = options.timeout;
    }
    
    // create response object
    response = new requestResponse(nativeXhr);
    response.originalURL = url;
    if (options.responseType != null) {
      
      //response type
      nativeXhr.responseType = options.responseType;
    }
    if (options.upload != null) {
      
      // upload / download listener
      nativeXhr.upload.addEventListener('progress', options.upload, false);
    }
    if (options.download != null) {
      nativeXhr.addEventListener('progress', options.download, false);
    }
    
    // headers received
    if (options.headersReceived != null) {
      nativeXhr.addEventListener('headersReceived', (event) => {
        return options.headersReceived(response);
      });
    }
    
    // load and error
    if (options.load != null) {
      nativeXhr.addEventListener('load', (event) => {
        return options.load(response);
      }, false);
    }
    if (options.error != null) {
      nativeXhr.addEventListener('error', (event) => {
        return options.error(response);
      }, false);
    }
    if (options.error != null) {
      nativeXhr.addEventListener('abort', (event) => {
        options.aborted = true;
        return options.error(response);
      }, false);
    }
    
    // cache
    if (options.cache === false) {
      urlParams = url.searchParams;
      while (true) {
        prm = '_' + randomString();
        if (!urlParams.has(prm)) {
          urlParams.append(prm, 1);
          break;
        }
      }
    }
    // send request
    nativeXhr.open(options.type, url.href, true);
    
    // add headers
    if (options.headers) {
      ref = options.headers;
      for (k in ref) {
        v = ref[k];
        nativeXhr.setRequestHeader(k, v);
      }
    }
    // send data
    nativeXhr.send(options.data || null);
    
    // return
    return response;
  };
  /*
  response
  */
  requestResponse = class requestResponse {
    constructor(xhr1) {
      this.xhr = xhr1;
    }

    /* abort current request */
    abort(abortMsg1) {
      this.abortMsg = abortMsg1;
      this.error = 'aborted';
      if (this.abortMsg != null) {
        this.error += ': ' + this.abortMsg;
      }
      return this.xhr.abort();
    }

  };
  Object.defineProperties(requestResponse.prototype, {
    status: {
      get: function() {
        return this.xhr.status;
      }
    },
    statusText: {
      get: function() {
        return this.xhr.statusText;
      }
    },
    readyState: {
      get: function() {
        return this.xhr.readyState;
      }
    },
    /* URL */
    url: {
      get: function() {
        return this.xhr.responseURL || this.originalURL;
      }
    },
    /* if the request is ok */
    ok: {
      get: function() {
        var ref;
        return (200 <= (ref = this.xhr.status) && ref <= 299);
      }
    },
    // content type
    type: {
      get: function() {
        var dataType;
        dataType = this.xhr.getResponseHeader('content-type');
        if (dataType) {
          dataType = dataType.split(';');
          return dataType[0].toLowerCase();
        }
      }
    },
    /* get all headers */
    headers: {
      get: function() {
        return this.xhr.getAllResponseHeaders();
      }
    },
    /* get header */
    header: {
      value: function(name) {
        return this.xhr.getResponseHeader(name);
      }
    },
    /* get the response as text */
    text: {
      get: function() {
        return this.xhr.responseText;
      }
    },
    /* get and parse the response */
    json: {
      value: function(name) {
        var e;
        try {
          return JSON.parse(this.xhr.responseText);
        } catch (error) {
          e = error;
          this.error = e;
          throw this;
        }
      }
    },
    /* binary response */
    response: {
      get: function() {
        return this.xhr.response;
      }
    },
    /* parse HTML and get MetaRedirectURL */
    getMetaRedirectURL: {
      value: function(name) {
        var metaRegex, ref, ref1, response, tag;
        if ((ref = this.type) != null ? ref.indexOf('html' !== -1) : void 0) {
          response = this.xhr.responseText;
          if (response) {
            metaRegex = /<meta.+?>/gi;
            while (tag = metaRegex.exec(response)) {
              if (/\bhttp-equiv\s*=\s*"?refresh\b/i.test(tag[0])) {
                return (ref1 = tag[0].match(/url=([^\s"']+)"?/i)) != null ? ref1[1] : void 0;
              }
            }
          }
        }
      }
    }
  });
  MAX_META_REDIRECTS = 5; // max meta tag redirects to follow
  MIME_TYPE_MAP = {
    json: 'application/json',
    xml: 'application/xml',
    urlencoded: 'application/x-www-form-urlencoded',
    text: 'text/plain'
  };
  /*
  convert string to snapcase
  */
  // strSnakeCase= (str)->
  // 	str.trim()
  // 		.split /[^\w]+|(?=[A-Z])/
  // 		.map (w) => w.toLowerCase()
  // 		.join '-'
  strUpSnakeCase = function(str) {
    return str.trim().split(/[^\w]+|(?=[A-Z])/).map((w) => {
      return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase();
    }).join('-');
  };
  randomString = function() {
    return Math.random().toString(32).substr(2);
  };
  _resolveURL = function(options) {
    var k, ref, url, v;
    url = options.url;
    if (typeof url === 'string') {
      url = new URL(_absURL(url));
    }
    // add get params
    if (options.params != null) {
      ref = options.params;
      for (k in ref) {
        v = ref[k];
        url.searchParams.append(k, v);
      }
    }
    return url;
  };
  _requestQueu = new Set(); // store all requests
  request = function(options) {
    var p, response;
    response = null;
    p = new Promise((resolve, reject) => {
      var accept, contentType, headers, k, ref, url;
      assert((options != null ? options.url : void 0) != null, 'Request>> URL expected');
      options.type = ((ref = options.type) != null ? ref.toUpperCase() : void 0) || 'GET';
      // url
      url = _resolveURL(options);
      // fix headers
      headers = {};
      if (options.headers) {
// convert kies to lowercase and snapcase
        for (k in options.headers) {
          headers[strUpSnakeCase(k)] = options.headers[k];
        }
        // add conenttype
        contentType = headers['Content-Type'];
        if (contentType != null) {
          contentType = contentType.toLowerCase();
          if (MIME_TYPE_MAP[contentType] != null) {
            headers['Content-Type'] = MIME_TYPE_MAP[contentType];
          }
        }
        // accept
        if (headers.Accept != null) {
          accept = headers.Accept;
          if (Array.isArray(accept)) {
            headers.Accept = accept.map((el) => {
              return MIME_TYPE_MAP[el.toLowerCase()] || el;
            });
          } else if (typeof accept === 'string') {
            accept = accept.toLowerCase();
            if (MIME_TYPE_MAP[accept]) {
              headers.Accept = MIME_TYPE_MAP[accept];
            }
          }
        }
      }
      options.headers = headers;
      
      // onLoad, onError
      options.load = resolve;
      options.error = reject;
      
      // tags: convert to array
      if (options.tags != null) {
        if (!Array.isArray(options.tags)) {
          options.tags = [options.tags];
        }
      }
      
      // use xhr
      response = _sendRequest(url, options);
      // return response
      return response;
    });
    // add other attributes
    p.abort = function(errMsg) {
      return response.abort(errMsg);
    };
    // store inside queu
    _requestQueu.add(p);
    p.finally(() => {
      return _requestQueu.delete(p);
    });
    // return promise
    return p;
  };
  
  // queu manager
  request.abortAll = function(abortMsg) {
    var i, len, req, results;
    results = [];
    for (i = 0, len = _requestQueu.length; i < len; i++) {
      req = _requestQueu[i];
      results.push(req.abort(abortMsg));
    }
    return results;
  };
  request.abort = function(tag, abortMsg) {
    var i, len, lst, req, results;
    lst = request.find(tag);
    results = [];
    for (i = 0, len = lst.length; i < len; i++) {
      req = lst[i];
      results.push(req.abort(abortMsg));
    }
    return results;
  };
  // find requests with tag or all tags
  request.find = function(tag) {
    var i, j, len, len1, lst, req;
    lst = [];
    // one tag
    if (Array.isArray(tag)) {
      for (i = 0, len = _requestQueu.length; i < len; i++) {
        req = _requestQueu[i];
        if (req.tags.indexOf(tag) !== -1) {
          lst.push(req);
        }
      }
    } else {
// all tags
      for (j = 0, len1 = _requestQueu.length; j < len1; j++) {
        req = _requestQueu[j];
        if (tag.every((tg) => {
          return req.tags.indexOf(tg) !== -1;
        })) {
          lst.push(req);
        }
      }
    }
    return lst;
  };
  _req = function(type) {
    return function(options) {
      if (!(arguments.length === 1 && (options != null))) {
        throw new Error(type + '>> Illegal arguments');
      }
      if (typeof options === 'string' || options instanceof URL) {
        options = {
          url: options
        };
      }
      options.type = type;
      return request(options);
    };
  };
  /*
  GET
  @example
  * get('https://example.com/page1')
  * get({
  * 	url: '...'
  * 	other options
  * })
   */
  request.get = _req('GET');
  request.head = _req('HEAD');
  request.post = _req('POST');
  request.patch = _req('PATCH');
  request.put = _req('PUT');
  request.delete = _req('DELETE');
  /* JSON */
  request.getJson = function(options) {
    var xh2, xhr;
    xhr = request.get(options);
    xh2 = xhr.then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
    // add abort function
    xh2.abort = function(errMsg) {
      return xhr.abort(errMsg);
    };
    return xh2;
  };
  /* Once */
  _request_queu = {}; // store requests
  request.getOnce = function(options) {
    var href, url;
    if (typeof options === 'string' || options instanceof URL) {
      options = {
        url: options
      };
    }
    // resolve final URL
    url = _resolveURL(options);
    delete options.params;
    options.url = url;
    href = url.href;
    // result
    return _request_queu[href] || (_request_queu[href] = request.get(options));
  };
  request.getJsonOnce = function(options) {
    var xh2, xhr;
    xhr = request.getOnce(options);
    xh2 = xhr.then(function(response) {
      return response.json();
    });
    // add abort function
    xh2.abort = function(errMsg) {
      return xhr.abort(errMsg);
    };
    return xh2;
  };
  
  // post json
  request.postJson = function(options) {
    if (options.headers == null) {
      options.headers = {};
    }
    options.headers['content-type'] = 'json';
    if (options.data && typeof options.data !== 'string') {
      options.data = JSON.stringify(options.data);
    }
    return request.post(options);
  };
  /*
  GET response, follow html meta tag redirects
  */
  request.getMetaFollow = function(options) {
    var p;
    p = new Promise((resolve, reject) => {
      var redirectsCount, req;
      // do request
      redirectsCount = 0;
      req = () => {
        var currentReq;
        return currentReq = request.get(options).then((response) => {
          var url;
          url = response.getMetaRedirectURL();
          if (url) {
            ++redirectsCount;
            if (redirectsCount >= MAX_META_REDIRECTS) {
              throw new Error('metatag redirect exceeds ' + redirectsCount);
            }
            if (typeof options === 'string' || options instanceof URL) {
              options = url;
            } else {
              options.url = url;
              delete options.params;
            }
            return req(); // new request to this url
          } else {
            return resolve(response);
          }
        }).catch(reject);
      };
      return req(); // start request
    });
    // abort wrapper
    p.abort = function(errMsg) {
      return currentReq.abort(errMsg);
    };
    // return
    return p;
  };
  return window.request = request;
})();
