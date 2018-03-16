const AJAX_OPTIONS_SYMB	= Symbol();
const AJAX_PRIVATE_SYMB	= Symbol();


class AjaxCaller extends Promise{
	constructor(options){
		var private = {
			// redirect : false // redirect flag
			redirectStack: [];
		};
		var resolve, reject;
		super((res, rej) => {
			resolve = res;
			reject	= rej;
		});

		this[AJAX_OPTIONS_SYMB]	= options;
		this[AJAX_PRIVATE_SYMB] = private;
		// apply options
		private.waitP	= delay(0);
		var p = (async () => {
			do {
				try {
					private.redirect	= false;
					private.redirectStack.push(options.url);
					await ajaxCallerRequest(xhr, options);
				} catch(err) {
					if(private.redirect !== true)
						throw err;
				}
			} while(private.redirect === true);
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
	set clearParams(){
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
			delete this.[AJAX_OPTIONS_SYMB].headers[strUtils.capitalize(arguments[i])];
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
		var private	= this[AJAX_PRIVATE_SYMB];
		if(typeof value	=== 'function')
			this.on('abort', value);
		else {
			if(private.waitP){
				private.waitP.reject({code: 'abort', message : value});
				private.waitP = null;
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