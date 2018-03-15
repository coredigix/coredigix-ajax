const AJAX_OPTIONS_SYMB	= Symbol();
const AJAX_PRIVATE_SYMB	= Symbol();


class AjaxCaller extends Promise{
	constructor(options){
		var private = {
			readyState	= 0
		};
		super((resolve, reject) => {
			private.resolve = resolve;
			private.reject	= reject;
		});

		this[AJAX_OPTIONS_SYMB]	= options;
		this[AJAX_PRIVATE_SYMB] = private;
		// apply options
		private.timeout = setTimeout(() => {
			try{
				private.timeout = null;
				// check options
				_ajaxCheckOptions(this, options);
				// process options
				_ajaxProcessOptions(this, options);
				// make native call
				if(typeof options.wait === 'number')
					private.timeout = setTimeout(() => {
						private.timeout = null;
						xhrCall(this, options);
					}, options.wait);
				else
					xhrCall(this, options);
			}catch(err){
				private.reject(err);
			}
		}, 0);
	}

	get readyState(){
		return this[AJAX_PRIVATE_SYMB].readyState;
	}

	// id
	id(id){
		if(arguments.length === 0)
			return this[AJAX_OPTIONS_SYMB].id;
		else {
			assert(this.readyState === 0, 'Could not change this when request is already in progress');
			assert(typeof id === 'string', 'Needs string as identifier');
			this[AJAX_OPTIONS_SYMB].id	= id;
			return this;
		}
	}

	// url
	get url(){ return this.readyState === 0 ? this.originalURL : this.xhr.responseURL; }
	get originalURL(){ return this[AJAX_OPTIONS_SYMB].url; }

	goToURL(url){
		assert(typeof url === 'string', 'Illegal argument');
		//TODO
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
	 * .removeHeader(headerName1, headerName2, ....)
	 */
	removeHeader(headerName){
		assert(this.readyState === 0, 'Request is already in progress');
		for(var i = 0, len = arguments.length; i < len; ++i)
			delete this.[AJAX_OPTIONS_SYMB].headers[strUtils.capitalize(arguments[i])];
	}

	/**
	 * reply request
	 */
	reply(){
		return new AjaxCaller(this[AJAX_OPTIONS_SYMB]);
	}

	abort(errMessage){
		var private	= this[AJAX_PRIVATE_SYMB];
		if(private.timeout !== null){
			clearTimeout(private.timeout);
			private.timeout = null;
		}

		// reject
		private.reject(errMessage || 'abort');
	}
}

/////////////////////////////
// getter/setter functions //
/////////////////////////////
[
	'timeout',
	'wait',
	'cache',
	'followMetaRedirects',
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
				return this[AJAX_OPTIONS_SYMB][param] || ajaxUtils.ajax[param](); // return current or default URL decoder
			else {
				this[AJAX_OPTIONS_SYMB][param]	= value;
				return this;
			}
		}
	});
});