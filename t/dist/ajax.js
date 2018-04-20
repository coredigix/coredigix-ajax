/*
convert URL to it's absolute form
*/
/*
Ajax utilities
*/
/*

Requester

*/
/*

other params

*/
/*
create ajax main methods
*/
var AJAX_OPTIONS, AJAX_OPTIONS_SYMB, REQUESTER_PRIVATE, _absURLElment, _addAjaxParam, _ajaxCheckOptions, _ajaxRequester, _mainMethodFactory, api, ele, i, len, mList, toAbsURL;

_absURLElment = document.createElement('a');

toAbsURL = function(url) {
  _absURLElment.setAttribute('href', url);
  return _absURLElment.href;
};

AJAX_OPTIONS_SYMB = Symbol();

REQUESTER_PRIVATE = Symbol();

_ajaxRequester = class _ajaxRequester extends Promise {
  constructor(url, type) {
    var options, p;
    p = {};
    // promise
    super((resolve, reject) => {
      p.resolve = resolve;
      p.reject = reject;
    });
    this[REQUESTER_PRIVATE] = p;
    // options
    options = this[AJAX_OPTIONS_SYMB] = {
      url: url,
      type: type
    };
    // send request
    p.timeout = setTimeout(() => {
      var err;
      try {
        p.timeout = null;
        // check options
        return _ajaxCheckOptions(options);
      } catch (error) {
        err = error;
        return p.reject(err);
      }
    }, 0);
  }

  // id
  id(id) {
    if (arguments.length === 0) {
      return this[AJAX_OPTIONS_SYMB].id;
    } else if (arguments.length === 1 && typeof id === 'string') {
      return this[AJAX_OPTIONS_SYMB].id = id;
    }
  }

};

Object.defineProperties(_ajaxRequester.prototype, {
  // current URL
  url: {
    value: function() {
      var ref;
      return ((ref = this.xhr) != null ? ref.responseURL : void 0) || this.originalURL;
    }
  },
  // original URL

  //originalURL

  // add url param

  // param({ key: value })
  param: {
    value: function(param) {
      var base, key, params, value;
      assert(typeof param === 'object' && param !== null);
      if ((base = this[AJAX_OPTIONS_SYMB]).param == null) {
        base.param = {};
      }
      params = this[AJAX_OPTIONS_SYMB].param;
      for (key in params) {
        value = params[key];
        params[key] = value;
      }
      return this;
    }
  },
  /*

  header

  @example

  * header({key: value})

   */
  header: {
    value: function(param) {
      var base, key, params, value;
      assert(typeof param === 'object' && param !== null);
      if ((base = this[AJAX_OPTIONS_SYMB]).param == null) {
        base.param = {};
      }
      params = this[AJAX_OPTIONS_SYMB].param;
      for (key in params) {
        value = params[key];
        params[key] = value;
      }
      return this;
    }
  },
  /*

  goToURL

  reply

  */

  // abort
  abort: {
    value: function(errMessage) {
      var p, ref;
      p = this[AJAX_PRIVATE_SYMB];
      if (p.timeout != null) {
        clearTimeout(p.timeout);
        p.timeout = null;
      }
      if ((ref = this.xhr) != null) {
        ref.abort();
      }
      p.reject(errMessage || 'abort');
      return this;
    }
  }
});

_addAjaxParam = function(param) {
  return function(value) {
    this[AJAX_OPTIONS_SYMB][param] = value;
    return this;
  };
};

mList = [
  'timeout',
  'wait',
  'cache',
  'followMetaRedirects',
  'accepts',
  // POST Data
  'data',
  'dataType',
  'dataCharset',
  'serializer',
  // response
  'parser',
  'responseType',
  'beforeSend'
];

for (i = 0, len = mList.length; i < len; i++) {
  ele = mList[i];
  _addAjaxParam(ele);
}

_ajaxCheckOptions = function(options) {
  var item, j, len1, results;
  results = [];
  for (j = 0, len1 = AJAX_OPTIONS.length; j < len1; j++) {
    item = AJAX_OPTIONS[j];
    if (options.hasOwnProperty(item.param)) {
      results.push(item.assert(options[item.param]));
    } else if (item.required === true) {
      throw new Error('Required Attribute ' + item.param);
    } else if (item.hasOwnProperty('default')) {
      results.push(options[item.param] = item.default());
    } else {
      results.push(void 0);
    }
  }
  return results;
};

AJAX_OPTIONS = [
  {
    param: 'url',
    assert: (url) => {
      return assert(url instanceof URL,
  'expected URL instance');
    },
    required: true
  },
  {
    param: 'id',
    assert: (id) => {
      return assert(typeof id === 'string',
  'id expected string');
    }
  },
  {
    param: 'timeout',
    assert: (timeout) => {
      return assert(typeof timeout === 'number' && timeout >= 0,
  'incorrect timeout');
    },
    default: () => {
      return api.timeout;
    }
  },
  {
    param: 'wait',
    assert: (wait) => {
      return assert(typeof wait === 'number' && wait >= 0,
  'incorrect wait');
    },
    default: () => {
      return 0;
    }
  },
  {
    param: 'cache',
    assert: (cache) => {
      return assert(typeof cache === 'boolean',
  'cache expected boolean');
    },
    default: () => {
      return api.cache;
    }
  },
  {
    param: 'dataType',
    assert: (dataType) => {
      return assert(typeof dataType === 'string',
  'dataType expected string');
    }
  },
  {
    param: 'dataCharset',
    assert: (dataCharset) => {
      return assert(typeof dataCharset === 'string',
  'dataCharset expected string');
    }
  },
  {
    param: 'serializer',
    assert: serializer(() => {
      return assert(typeof serializer === 'function',
  'serializer expected function');
    }),
    default: () => {
      return api.serializer;
    }
  },
  {
    param: 'parser',
    assert: (parser) => {
      return assert(typeof parser === 'function',
  'parser expected function');
    },
    default: () => {
      return api.parser;
    }
  },
  {
    param: 'responseType',
    assert: (parser) => {
      return assert(typeof responseType === 'string',
  'responseType expected type string');
    }
  },
  {
    param: 'beforeSend',
    assert: (beforeSend) => {
      return assert(typeof beforeSend === 'function',
  'beforeSend expected function');
    }
  },
  {
    param: 'accepts',
    assert: (accepts) => {
      return assert(typeof accepts === 'string' || Array.isArray(accepts) && accepts.every((e) => {
        return typeof e === 'string';
      }),
  'accepts expected String or String list');
    }
  }
];

_mainMethodFactory = function(type, pOptions) {
  return function(options, data) {
    var ajaxC, j, k, key, len1, len2, ref, url, value;
    assert((ref = arguments.length) === 1 || ref === 2, 'Illegal arguments');
    // URL
    url = options.url || options.href || options;
    if (typeof url === 'string') {
      url = new URL(toAbsURL(url));
    } else if (!(options instanceof URL)) {
      throw new Error('Incorrect URL');
    }
    // caller
    ajaxC = new _ajaxRequester(url, type);
    // exec other options
    if (pOptions != null) {
      for (key = j = 0, len1 = pOptions.length; j < len1; key = ++j) {
        value = pOptions[key];
        ajaxC[key](value);
      }
    }
    if (typeof options === 'object' && options !== null) {
      for (key = k = 0, len2 = options.length; k < len2; key = ++k) {
        value = options[key];
        if (ajaxC.hasOwnProperty(key)) {
          ajaxC[key](value);
        } else {
          throw new Error('Unknown option: ' + key);
        }
      }
    }
    // return
    return ajaxC;
  };
};

api = {
  // main methodes
  get: _mainMethodFactory('GET'),
  post: _mainMethodFactory('POST'),
  put: _mainMethodFactory('PUT'),
  head: _mainMethodFactory('HEAD'),
  'delete': _mainMethodFactory('DELETE'),
  // other methodes
  getJson: _mainMethodFactory('GET', {
    contentType: 'json'
  }),
  getXml: _mainMethodFactory('GET', {
    contentType: 'xml'
  }),
  // once
  getOnce: _mainMethodFactory('GET', {
    once: true
  }),
  getJsonOnce: _mainMethodFactory('GET', {
    contentType: 'json',
    once: true
  }),
  getXmlOnce: _mainMethodFactory('GET', {
    once: true,
    contentType: 'xml'
  }),
  // preferences
  timeout: 0, //default timeout
  cache: true // use navigator cache if enabled
};

// serializer
// parser
