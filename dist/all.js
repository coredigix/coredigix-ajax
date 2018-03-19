var _ajaxCorePrivate	= {
	timeout	: 60000
};

// ajax Queu
var ajaxQueu	= {};

const _ajaxCore = {
	// timeout
	timeout		: _ajaxCoreFx('timeout', 	t => assert(typeof t === 'number' && t >= 0, 'Illegal argument: ' + t) ),
	UrlDecoder	: _ajaxCoreFx('UrlDecoder', s => assert(typeof s === 'function', 'Illegal argument: ' + s) ),
	serializer	: _ajaxCoreFx('serializer', s => assert(typeof s === 'function', 'Illegal argument: ' + s) ),
	parser		: _ajaxCoreFx('parser', s => assert(typeof s === 'function', 'Illegal argument: ' + s) ),
};

function _ajaxCoreFx(param, check){
	return (value => {
		if(value === undefined)
			return _ajaxCorePrivate[param];
		else {
			check(value);
			_ajaxCorePrivate[param]	= value;
			return _ajaxCore;
		}
	});
}
const ajaxUtils	= {
	get			: _makeAjax('GET', null), 
	post		: _makeAjax('POST', null),
	put			: _makeAjax('PUT', null),
	head		: _makeAjax('HEAD', null),
	delete		: _makeAjax('DELETE', null), 

	getJSON		: _makeAjax('GET', options => {	options.contentType = 'json'; }),
	getXML		: _makeAjax('GET', options => {	options.contentType = 'xml'; }),

	getOnce		: _makeAjax('GET', options => {	options.once = true; }),
	getJsonOnce	: _makeAjax('GET', options => {	options.once = true; options.contentType = 'json'; }),
	getXmlOnce	: _makeAjax('GET', options => {	options.once = true; options.contentType = 'xml'; }),

	ajax		: _ajaxCore
};

function _makeAjax(_type, _op){
	return function(options){
		var userHeaders = null;

		if(arguments.length !== 1 || !options)
			throw new Error('Illegal arguments');
		// URL
		var url	= options.url || options;
		if(!url)
			throw new Error('Needs URL');
		else if(typeof url === 'string'){}
		else if(url instanceof URL || url instanceof HTMLAnchorElement)
			url	= url.href;
		else
			throw new Error('Incorrect URL');
		// options
		if(!objUtils.isPlainObj(options))
			options	= {};
		//add headers
		if(options.headers)
			userHeaders = options.headers;
		options.headers	= {};
		// exec other options
		options.type	= _type;
		if(_op !== null)
			_op(options);
		// decode URL
		var decoder = options.urlDecoder || ajaxUtils.ajax.urlDecoder;
		if(typeof decoder === 'function')
			url	= decoder(url);
		// add URL
		options.url	= new URL(url);

		// caller
		var ajaxC	= new AjaxCaller(options);
		if(userHeaders !== null)
			ajaxC.header(userHeaders);
		return ajaxC;
	}
}
function ajaxCallerRequest(xhr, options){
	var private	= xhr[AJAX_PRIVATE_SYMB];
	return private.waitP.then(() => {
			// check options
			_ajaxCheckOptions(xhr, options);
			// process options
			_ajaxProcessOptions(xhr, options);
			// prepare request
			var nativeXHR = xhr.xhr = _prepareXHR(xhr, options);
			// on before send
			if(options.beforeSend)
				options.beforeSend(xhr);
			// delay before sending the ajax
			private.waitP	= typeof options.wait === 'number' ? delay(options.wait) : null;
			return private.waitP;
		})
		.then(() => _xhrSend(nativeXHR, options.data || null))
		// parsing
		.then(() => {
			// get server dataType and charset
				var dataType = nativeXHR.getResponseHeader('content-type');
				if(dataType){
					dataType	= dataType.split(';');
					private.responseType	= dataType[0];
					private.responseCharset	= dataType[1];
					dataType	= dataType[0];
				}
			return options.parser(xhr.nativeResponse, xhr[AJAX_OPTIONS_SYMB].responseType || dataType);
		})
		.then(data => {
			private.response	= data;
			var status	= nativeXHR.status;
			if(status < 200 || status >=300)
				throw 'Error';
			return data;
		});
}
const AJAX_OPTIONS_SYMB	= Symbol();
const AJAX_PRIVATE_SYMB	= Symbol();


class AjaxCaller extends Promise{
	constructor(options){
		var prvt = {
			// redirect : false // redirect flag
			redirectStack: []
		};
		var resolve, reject;
		super((res, rej) => {
			resolve = res;
			reject	= rej;
		});

		this[AJAX_OPTIONS_SYMB]	= options;
		this[AJAX_PRIVATE_SYMB] = prvt;
		// apply options
		prvt.waitP	= delay(0);
		var p = (async () => {
			do {
				try {
					prvt.redirect	= false;
					prvt.redirectStack.push(options.url);
					await ajaxCallerRequest(xhr, options);
				} catch(err) {
					if(prvt.redirect !== true)
						throw err;
				}
			} while(prvt.redirect === true);
			this[AJAX_PRIVATE_SYMB].done = true;
		});
		// if lazy mode
		resolve(p);
	}

	get readyState(){
		return this.xhr === undefined ? 0 : this.xhr.readyState;
	}
	get response(){
		return this[AJAX_PRIVATE_SYMB].response;
	}
	get nativeResponse(){
		return this.xhr && this.xhr.responseText;
	}
	get statusText(){
		return this.xhr && this.xhr.statusText;
	}
	/**
	 * get status
	 * .status()	// get status
	 * .status{}	// add event when status
	 */
	status(value){
		var result = this;
		//.status()
		if(arguments.length  === 0)
			result	= this.xhr && this.xhr.status;
		//.status({})
		else if (objUtils.isPlainObj(value)) {
			this.on('done', event => {
				var status		= this.xhr.status;
				var strStatus	= status + '';
				// simple status
				[
					strStatus, // 200
					strStatus.substr(0,2) + 'x', // 20x
					strStatus.charAt(0) + 'xx', // 2xx
					'xxx',
				].forEach(st => {
					if(value.hasOwnProperty(st))
						value[st](this.error, this);
				});
				// interval status
				for(var i in value){
					if(i.indexOf('-') !== -1){
						var intervl	= i.split('-');
						if(status >= intervl[0] && status <= intervl[1])
							value[i](this.error, this);
					}
				}
			});
		}
		return result;
	}

	responseType(responseType){
		if(arguments.length === 1)
			this[AJAX_OPTIONS_SYMB].responseType	= responseType;
		else throw new Error('Illegal arguments');
		return this;
	}

	get contentType(){
		return this[AJAX_PRIVATE_SYMB].responseType;
	}
	get contentCharset(){
		return this[AJAX_PRIVATE_SYMB].responseCharset;
	}
	// id
	id(id){
		if(arguments.length === 0)
			return this[AJAX_OPTIONS_SYMB].id;
		else {
			assert(this[AJAX_OPTIONS_SYMB].id === undefined, 'id already set');
			assert(typeof id === 'string', 'id must be string');
			this[AJAX_OPTIONS_SYMB].id	= id;
			return this;
		}
	}

	// url
	get url(){ return this.readyState === 0 ? this.originalURL : this.xhr.responseURL; }
	set url(href){
		assert(this[AJAX_PRIVATE_SYMB].done !== true, 'Request done.');
		this[AJAX_OPTIONS_SYMB].url	= new URL(href);
	}
	get originalURL(){ return this[AJAX_OPTIONS_SYMB].url; }

	goToURL(url){
		assert(typeof url === 'string', 'Illegal argument');
		this.url	= url;
		this[AJAX_PRIVATE_SYMB].redirect = true; // request redirect to this URL
		this.abort('redirect');
	}

	/**
	 * .param()				// get all params
	 * .param('name')		// get param
	 * .param({key:value, key2: [values]})	// set params
	 */
	param(value){
		var url			= this[AJAX_OPTIONS_SYMB].url,
		searchParams	= url.searchParams,
		result;

		if(arguments.length === 0){
			result	= {};
			searchParams.forEach((vlue, key) => {
				var ele	= result[key];
				if(ele !== undefined){
					if(Array.isArray(ele)) ele.push(vlue);
					else result[key]	= [ele, vlue];
				}
				else result[key]	= vlue;
			});
		}
		else if(typeof value === 'string'){
			result	= searchParams.getAll(value);
			if(result.length <= 1)
				result	= result[0]; // returns first element or undefined
		}
		else {
			for(key in value){
				var item = value[key];
				if(Array.isArray(item))
					item.forEach(ele => {
						searchParams.append(key, ele);
					});
				else
					searchParams.append(key, item);
			}
		}
	}
	clearParams(){
		this[AJAX_OPTIONS_SYMB].url.search	= ''; // remove all entries
	}
	/**
	 * .header() 			//get all headers
	 * .header(name)		//get header
	 * .header({key: value})//set header
	 */
	header(value){
		var headers	= this[AJAX_OPTIONS_SYMB].headers,
		result	= this;
		//header()
		if(arguments.length === 0) result = headers;
		//header(name)
		else if(typeof value === 'string')
			result	= headers[strUtils.capitalize(value)];
		//header({key	: value})
		else {
			assert(this.readyState === 0, 'Request is already in progress');
			for(var key in value)
				headers[strUtils.capitalize(key)]	= value[key];
		}
		return result;
	}
	/**
	 * .responseHeader()	// get all headers
	 * .responseHeader(headerName)	// get header
	 */
	responseHeader(value){
		var result;
		//.responseHeader()
		if(arguments.length === 0){
			result	= this.xhr && this.xhr.getAllResponseHeaders();
			//parse headers
				if(typeof result === 'string'){
					var tmpRslt = result,
						indx;
					result		= {};
					tmpRslt.split(/[\r\n]+/).forEach(ele => {
						if(ele){
							indx	= ele.indexOf(':'); 
							result[ele.substr(0, indx)]	= ele.substr(indx + 1).trim();
						}
					});
				}
		}
		//.responseHeader(headerName)
		else if(typeof value === 'string')
			result	= this.xhr && this.xhr.getResponseHeader(strUtils.capitalize(value));
		//.responseHeader(FX)
		else if(typeof value === 'function')
			this.on('headersReceived', value);
		else throw new Error('Illegal arguments');
		//return result
		return result;
	}
	/**
	 * .removeHeader(headerName1, headerName2, ....)
	 */
	removeHeader(headerName){
		assert(this.readyState === 0, 'Request is already in progress');
		for(var i = 0, len = arguments.length; i < len; ++i)
			delete this[AJAX_OPTIONS_SYMB].headers[strUtils.capitalize(arguments[i])];
	}

	/**
	 * replay request
	 */
	replay(cb){
		if(typeof cb === 'function')
			return this.on('replay', cb);
		else{
			this.trigger('replay', {xhr: this});
			return new AjaxCaller(this[AJAX_OPTIONS_SYMB]);
		}
	}

	abort(value){
		var prvt	= this[AJAX_PRIVATE_SYMB];
		if(typeof value	=== 'function')
			this.on('abort', value);
		else {
			if(prvt.waitP){
				prvt.waitP.reject({code: 'abort', message : value});
				prvt.waitP = null;
			}
			if(this.xhr)
				this.xhr.abort();
		}
		return this;
	}

	// followMetaRedirects
	followMetaRedirects(value){
		if(arguments.length === 0)
			return this[AJAX_OPTIONS_SYMB].followMetaRedirects; // return current or default URL decoder
		else if(typeof value === 'boolean')
			this[AJAX_OPTIONS_SYMB][param]	= value;
		else if(typeof value === 'function')
			this.on('metaRedirect', value);
		else throw new Error('Illegal argument');
		return this;
	}

	// progress
	uploadProgress(cb){
		if(typeof cb === 'function')
			this.on('uploadProgress', cb);
		else return this[AJAX_PRIVATE_SYMB].uploadProgress;
	}
	downloadProgress(cb){
		if(typeof cb === 'function')
			this.on('downloadProgress', cb);
		else return this[AJAX_PRIVATE_SYMB].downloadProgress;
	}

	get error(){
		//TODO
	}

	get redirectStack(){
		return this[AJAX_PRIVATE_SYMB].redirectStack;
	}
}

/////////////////////////////
// getter/setter functions //
/////////////////////////////
[
	'timeout',
	'wait',
	'cache',
	'accepts',
	//POST Data
	'data',
	'dataType',
	'dataCharset',
	'serializer',
	// response
	'parser',
	'responseType',
	'beforeSend'
].forEach(function(param){
	Object.defineProperty(AjaxCaller.prototype, param, {
		value	: function(value){
			if(arguments.length === 0)
				return this[AJAX_OPTIONS_SYMB].hasOwnProperty(param) ? this[AJAX_OPTIONS_SYMB][param] : ajaxUtils.ajax[param](); // return current or default URL decoder
			else {
				this[AJAX_OPTIONS_SYMB][param]	= value;
				return this;
			}
		}
	});
});


/**
 * Events
 * 			- headersReceived
 * 			- readyStateChange
 * 			- 
 * 			- downloadProgress
 * 			- uploadProgress
 *
 * 			- error
 * 			- load  // when native request ends
 *
 * 			- metaRedirect
 * 			- replay
 *
 * 			- done	// when request api done
 */
/**
 * check all ajax options
 */
function _ajaxCheckOptions(xhr, options){
	AJAX_OPTIONS.forEach(item => {
		if(options.hasOwnProperty(item.param))
			item.assert(options[item.param], options);
		else if(item.required === true)
			throw new Error('Needs option ' + item.param);
		else if(item.hasOwnProperty('default'))
			options[item.param]	= item.default(options);
	});
}

const AJAX_OPTIONS = [
	{
		param	: 'url',
		assert	: url => assert(url instanceof URL, 'url must be of type URL'),
		required: true
	},{
		param	: 'id',
		assert	: id => assert(typeof id === 'string', 'id must be of type string')
	},{
		param	: 'timeout',
		assert	: timeout => assert(typeof timeout === 'number' && timeout >= 0, 'timeout must be of type number and greater or equals than 0'),
		default	: () => ajaxUtils.ajax.timeout()
	},{
		param	: 'wait',
		assert	: wait	=> assert(typeof wait === 'number' && wait >= 0, 'wait must be of type number and greater or equals than 0'),
		default : () => 0
	},{
		param	: 'cache',
		assert	: cache	=> assert(typeof cache === 'boolean', 'cache must be of type boolean'),
		default	: () => true
	},{
		param	: 'dataType',
		assert	: dataType => assert(typeof dataType === 'string', 'dataType must be of type string'),
		default	: (options) => {
			if(options.data !== undefined)
				return _guessDataType(options.data);
		}
	},{
		param	: 'data',
		assert	: (data, options) => assert(options.type === 'POST' || options.type === 'PUT', 'Sending data requires POST or PUT request')
	},{
		param	: 'dataCharset',
		assert	: dataCharset => assert(typeof dataCharset === 'string', 'dataCharset must be of type string')
	},{
		param	: 'serializer',
		assert	: serializer => assert(typeof serializer === 'function', 'serializer must be a function'),
		default	: () => ajaxUtils.ajax.serializer()
	},{
		param	: 'parser',
		assert	: parser => assert(typeof parser === 'function', 'parser must be a function'),
		default	: () => ajaxUtils.ajax.parser()
	},{
		param	: 'responseType',
		assert	: parser => assert(typeof responseType === 'string', 'responseType must be of type string')
	},{
		param	: 'beforeSend',
		assert	: beforeSend => assert(typeof beforeSend === 'function', 'beforeSend must be a function')
	},{
		param	: 'accepts',
		assert	: accepts => {
			assert(
				typeof accepts === 'string'
				|| (
					Array.isArray(accepts)
					&& accepts.every(e => typeof e === 'string')
				)
				, 'illegal argument'
			);
		}
	}
];
function _guessDataType(data){
	var dataType;
	if(typeof data === 'string'){
		// url encoded
			if(/^[^&]+=[^&]*(?:&[^&]+=[^&]*)*$/.test(data))
				dataType = 'urlEncoded';
		//JSON
			else if(
				( () => { try{ JSON.parse(data); return true; }catch(e){ return false } })()
			)
				dataType = 'json';
		// text
			else
				dataType = 'text';
	}
	else if(data instanceof FormData)
		dataType	= 'multipart';
	else if(data instanceof HTMLFormElement)
		dataType	= 'multipart';
	else if(objUtils.isPlainObj(data))
		dataType	= 'json';
	else{
		
	}
	return dataType && MIMETYPE_MAP[dataType];
}
const MIMETYPE_MAP = {
	json		: 'application/json',
	xml			: 'application/xml',
	urlEncoded	: 'application/x-www-form-urlencoded',
	text		: 'text/plain',
	string		: 'text/plain',
	multipart	: ''
};
function _ajaxProcessOptions(xhr, options){
	AJAX_PROCESS_OPTIONS.forEach(option => {
		if(options.hasOwnProperty(option.param))
			option.process(xhr, options);
	});
}

const AJAX_PROCESS_OPTIONS	= [
	{
		param	: 'data',
		precess	: (xhr, options) => {
			if(typeof options.data === 'string'){}
			else {
				assert(options.hasOwnProperty('serializer'), 'Required serializer');
				options.data = options.serializer(options.data);
			}
		}
	},{
		param	: 'accepts',
		process	: (xhr, options) => {
			var accepts	= options.accepts;
			if(Array.isArray(accepts))
				options.accepts = accepts.map(ele => MIMETYPE_MAP[ele] || ele).join(',');
			else
				options.accepts = MIMETYPE_MAP[accepts] || accepts;
		}
	}
];
// convert data
const DATA_SERIALIZERS = {
	'application/json'					: $$.toJSON,
	'application/xml'					: $$.toXML,
	'application/x-www-form-urlencoded'	: $$.toURLEncoded,
	'multipart/form-data'				: $$.toFormData
};

_ajaxCorePrivate.serializer	= function(data, dataType){
	if(!data)
		throw new Error('Need data');
	if(!dataType)
		dataType = _guessDataType(data);
	if(dataType && DATA_SERIALIZERS.hasOwnProperty(dataType))
		return DATA_SERIALIZERS[dataType](data);
	else return data;
};


/**
 * make native xhr call
 */
// prepare xhr
function _prepareXHR(xhr, options){
	//disable cache
	var url	= options.url;
	if(options.cache === false){
		url = new URL(url.href);
		var p;
		do{
			p = '_' + Math.random().toString(32).substr(2);
		} while(url.searchParams.has(p));
		url.searchParams.append(p, 1);
	}
	// 
	var nativeXhr	= new XMLHttpRequest();
	if(options.timeout)
		nativeXhr.timeout	= options.timeout;
	// on upload pregress
	nativeXhr.upload.addEventListener('progress', event => {
		var evnt	= {
			xhr				: xhr,
			percent			: event.loaded ? event.total * 100 / event.loaded : undefined,
			totalBytes		: event.total,
			uploadedBytes	: event.loaded
		};
		xhr[AJAX_PRIVATE_SYMB].uploadProgress	= evnt;
		xhr.trigger('uploadProgress', evnt);
	}, false);
	nativeXhr.addEventListener('progress', event => {
		var evnt	= {
			xhr				: xhr,
			percent			: event.lengthComputable ? event.total * 100 / event.loaded : undefined,
			totalBytes		: event.total,
			uploadedBytes	: event.loaded
		};
		xhr[AJAX_PRIVATE_SYMB].downloadProgress	= evnt;
		xhr.trigger('downloadProgress', evnt);
	}, false);
	// error & done
	nativeXhr.addEventListener('load', event => {
		xhr.trigger('load', {xhr:xhr});
	}, false);
	nativeXhr.addEventListener('error', event => {
		xhr.trigger('error', {xhr:xhr, error: event});
	}, false);
	// open request
	nativeXhr.open(options.type, url.href, true);

	// add request headers
	for(var i in options.headers)
		nativeXhr.setRequestHeader(i, options.headers[i]);
	if(options.dataType)
		nativeXhr.setRequestHeader('Content-Type', options.dataType + '; charset=' + (options.dataCharset || 'UTF-8'));
	return nativeXhr;
}

function _xhrSend(nativeXhr, data){
	return new Promise((resolve, reject) => {
		// ready state change
		nativeXhr.onreadystatechange	= (event => {
			try{
				// trigger readyState event
				xhr.trigger('readyState', {xhr : xhr});
				// headers received
				if(nativeXHR.readyState === 2)
					xhr.trigger('headersReceived', {xhr: xhr});
			} catch(err) {
				xhr.trigger('error', {xhr: xhr, error: err});
			}
			if(nativeXhr.readyState === 4)
				resolve();
		});
		nativeXhr.send(data);
	});
}