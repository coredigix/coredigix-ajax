/**
 * pourvoir grouper les appel ajax
 * se rappler de tous les appel ajax, voir par groupe
 */

(function(){
	// Consts
		const MIMETYPE_MAP = {
			json		: 'application/json',
			xml			: 'application/xml',
			urlEncoded	: 'application/x-www-form-urlencoded',
			text		: 'text/plain',
			string		: 'text/plain',
			multipart	: ''
		};
		// convert data
		const DATA_CONVERTERS = {
			'application/json'					: $$.toJSON,
			'application/xml'					: $$.toXML,
			'application/x-www-form-urlencoded'	: $$.toURLEncoded,
			'multipart/form-data'				: $$.toFormData
		};

		// default redirect rules
		const META_REDIRECT_RULES	= [
			{
				pattern	: /\/html$/i,
				rule	: function(response){
					if(typeof response == 'string'){
						var url	= response.match(/<meta\s+http-equiv\s*=\s*["']refresh["']\s+content\s*=\s*["']0\s*;\s*URL\s*=\s*["']?(https?:\/\/[^"'>]*)["']/i);
						if(url)
							return url[1];
					}
				}
			}
		];
	// interface
		$$.plugin(true,{
			// pricipal calls
				get			: _makeAjax('GET'),
				post		: _makeAjax('POST'),
				delete		: _makeAjax('DELETE'),
				head		: _makeAjax('HEAD'),
			// specified calls
				getJSON		: _makeAjax('GET', options => {options.contentType = 'json'}),
				getXML		: _makeAjax('GET', options => {options.contentType = 'xml'}),
			// GET once
			// get url only once, and store parsed response in the cache
				getOnce		: _makeAjax('GET', options => {options.once = true}),
				getJSONOnce	: _makeAjax('GET', options => {options.once = true; options.contentType = 'json'}),
				getXMLOnce	: _makeAjax('GET', options => {options.once = true; options.contentType = 'xml'})
		});
	// ajax wrapper
		function _makeAjax(type, otherOp){
			return (options => {
				return new _XHR(type, options, otherOp);
			});
		}
	// xhr Object
		function _XHR(type, options, otherOp){
			try{
				// prepare options
					options	= _prepareOptions(options);
				// type
					options.type	= type;
				// other operations
					if(otherOp)
						otherOp(options);
				// save options
					this._options	= options;
				// redirects trace
					this._redirectTrace	= [options.url.href]; // store redirect URLs to avoid cyclic calls
				// progress data
					this._uploaded	= 0;
					this._upTotal	= 0;
					this._loaded	= 0;
					this._total		= 0;
				// start XHR
					_startXHR.call(this);
			}catch(e){
				reject.call(this, e);
			}
		};
	// start loading
		function _startXHR(){
			// flags
				this._flags		= {};

			this._startTimeout	= setTimeout(() => {
				this._startTimeout	= null;
				try{
					_xhrSend.call(this, resolve.bind(this), reject.bind(this));
				}catch(e){
					reject.call(this, e);
				}
			}, 0);
		}
	// prepare options
		function _prepareOptions(options){
			$$.assert(options != undefined, () => new $$.err.missedArgument('need arguments'));

			var tmpVar, i;
			// URL
				if(typeof options == 'string'){
					tmpVar	= options;
					options	= {};
				} else if(options instanceof URL || options instanceof HTMLAnchorElement){
					tmpVar	= args.href;
					options	= {};
				} else if($$.isPlainObj(options)){
					tmpVar	= options.url;
					if(typeof tmpVar != 'string') // URL or HTMLAnchorElement
						tmpVar	= tmpVar.href;
				} else {
					throw new $$.illegalArgument('incorrect argument: ', options);
				}
				// finalise url
					tmpVar 		= $$.toAbsURL(tmpVar);
					options.url	= new URL(tmpVar);
			// request headers
			// capitalize all header kies
				if(options.headers){
					tmpVar	= options.headers;
					options.headers	= {};
					for(i in tmpVar)
						options.headers[$$.capitalize(i)]	= tmpVar[i];
					// charset
						if(options.headers['Content-Type'])
							_optionsSplitConentTypeAndCharset(options, options.headers['Content-Type']);
				}
				else
					options.headers	= {};
			// dataType
				if(options.dataType)
					_optionsSplitConentTypeAndCharset(options, options.dataType);
			// end
				return options;
		}
	// split content type and charset
		function _optionsSplitConentTypeAndCharset(options, contentType){
			contentType			= contentType.match(/^([^;]+)(?:;\s*charset\s*=(.*)$)?/i);
			options.dataType	= contentType[1].trim().toLowerCase();
			options.dataCharset	= contentType[2].trim();
		}
	// reject & resolve
		function resolve(err, data){
			// TEHN
			if(this._options.then){
				try{
					this._options.then.call(this, err, data || this._response, this);
				}catch(e){
					$$.fatalError('AJAX', 'Uncaught Error inside THEN callBack', e);
				}
			}
			// catch
				if(err)
					this.trigger('error', {error : err});
			// load
				else if(data)
					this.trigger('load', {data: data});
			// end
				this.trigger('end');
		}
		function reject(err){
			resolve.call(this, err || new Error('Rejected'));
		}
	// finalize request preparation end send
		function _xhrSend(resolve, reject){
			var options	= this._options;
			var i, tmpVar;
			// decoder URL
				if(options.urlDecoder){
					tmpVar	= options.urlDecoder(options.url.href);
					$$.assert(isValidURL(tmpVar), 'incorrect url after convert: ' + tmpVar);
					options.url.href	= tmpVar;
				}
			// disable cache
				if(options.cache === false)
					options.url.searchParams.set('_', Date.now());

			// make XHR
				var xhr		= new XMLHttpRequest();
				this.xhr	= xhr;
			// add Event listeners
				_addXhrEventListeners.call(this);
			// timeout
				if(options.timeout){
					$$.assertArg(isFinite(options.timeout) && options.timeout >= 0, 'incorrect timeout');
					xhr.timeout	= options.timeout;
				}
			// prepare post
				if(options.type == 'POST')
					_preparePost.call(this);
			
			// on ready state change
				xhr.onreadystatechange = (event => {
					this._readyState	= xhr.readyState;
					//TODO trigger onreadyStateChange
					//headers received or redirect
						if(xhr.readyState == 2){
							if(this._responseHeaderFx) //TODO change this to be event trigger
								this._responseHeaderFx.call(this, this);
						}
					//Done
						else if(xhr.readyState == 4){
							// if abort, do not anyting
							if(this._flags.abort){}
							else{
								// parse result
									_deserialize.call(this);

								// if follow metaredirects
									if(this.followMetaRedirects() && _followMetaRedirectURL.call(this)){}
									else if(xhr.status >= 200 && xhr.status <=299){
										resolve();
									}
									else{ // error
										reject();
									}
							}
						}
				});

			xhr.open(options.type, options.url.href, true);
			// add headers
				tmpVar	= options.headers;
				for(i in tmpVar)
					xhr.setRequestHeader(i, tmpVar[i]);
			xhr.send(options.data || null);
		}
	// convert data to mimetype
		function _toMimeType(value){
			return MIMETYPE_MAP[value.toLowerCase()] || value;
		}
	// prepare post request
		function _preparePost(options){
			var options	= this._options,
				dataType= options.dataType,
				data	= options.data,
				tmpVar;
			// find form if the given data is a selector
				if(typeof data == 'string'){
					try{
						data	= $$.find(data);
					}catch(e){} // not a selector
				}
			// if data is a Brighter object, give the native form
				if(data instanceof $$){
					data	= data.firstTag(ele => ele instanceof HTMLFormElement)[0];
					if(!data)	throw $$.err.illegalArgument('selected element is not a form');
				}
			// content type
				if(dataType) // convert datatype to mimetype
					datatype	= _toMimeType(dataType);
				else// Guess the data type
					datatype	= _guessDataType.call(this, data);
				// apply data type
					options.headers['Content-Type']	= dataType + '; charset=' + (options.dataCharset || 'UTF-8');
			// convert data to specified data type
				if(options.serializer) // user customised serializer
					data	= options.serializer.call(this, data);
				else if(typeof data == 'string'){}
				else if(dataType){
					tmpVar	= _getSerializer(dataType);
					if(tmpVar)
						data	= tmpVar(data);
					else{
						$$.warn('POST', 'data not converted');
					}
				}
				options.data	= data;
		}
	// add event listeners
		const xhrEvents	= ['progress'];
		function _addXhrEventListeners(){
			var xhr	= this.xhr;
			var ev;
			// download progress
				xhr.addEventListener('progress', event => {
					this._loaded	= event.loaded;
					this._total		= event.total;
					this.trigger(event);
				}, false );
			// upload progress
				xhr.addEventListener('upload-progress', event => {
					this._uploaded	= event.loaded;
					this._upTotal	= event.total;
					this.trigger('upload-progress', event);
				}, false );
		}
	/**
	 * Guess the data type to use as request data content-type
	 * @return {string} content-type
	 */
	function _guessDataType(data){
		var dataType;
		if(typeof data == 'string'){
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
					datatype = 'text';
		}
		else if(data instanceof FormData)
			dataType = 'multipart';
		else if(data instanceof HTMLFormElement)
			dataType= 'multipart';
		else if($$.isPlainObj(options.data))
			dataType= 'json';
		else{
			// type de donnee inconnu
			// laisse XMLHttpRequest fait le traitement.
			$$.warn('POST', 'unknown data format ' + data && data.constructor && data.constructor.name);
		}
		return dataType && _toMimeType(dataType);
	}
	/**
	 * get the serializer bused on data type (post)
	 * @return {function} serializer
	 */
	function _getSerializer(dataType){
		return DATA_CONVERTERS[dataType];
	}
	/**
	 * deserialize data
	 */
	 function _deserialize(){
	 	// verifier que deserialisable
	 	this._response	= this.xhr.responseText;
	 }
	 /**
	  * follow meta redirect
	  * @return {boolean} true if there is a URL to follow
	  */
	function _followMetaRedirectURL(){
		// get URL
			var response	= this._response;
			var contentType	= this.contentType;
			var i, c, url;
			if(response){
				for(i = 0, c = META_REDIRECT_RULES.length; i < c; ++i){
					if(META_REDIRECT_RULES[i].pattern.test(contentType)){
						url	= META_REDIRECT_RULES[i].rule(response);
						if(url)
							break;
					}
				}
			}
		// follow URL
			if(url){
				// avoid cyclic calls
					if(this._redirectTrace.indexOf(url) != -1)
						throw new $$.err.illegalState('Cyclic redirects.');
				// go to next url
					this.gotoURL(url);
				return true;
			}
			else{
				return false;
			}
	}

	////////////////
	// add events //
	////////////////
	$$.addEventManager(_XHR.prototype);

	/////////////////
	// ADD METHODS //
	/////////////////
	(function(src){
		for(var i in src)
			Object.defineProperty(_XHR.prototype, i, {
				value	: src[i]
			});
	})({
		/**
		 * give an id or group to this request, so we could manage it with $$.ajax.find('') function
		 */
			id		: function(identifier){
				//TODO
			},
		// URL redirect
			gotoURL		: function(url){

				this._redirectTrace.push(url);
				this._options.url	= new URL($$.toAbsURL(url));

				_startXHR.call(this); // call this URL

				return this;
			},
		// URL decoder
			urlDecoder	: function(decoder){
				if(decoder){
					$$.assertFunction(decoder);// assert that this is a function
					this._options.urlDecoder	= decoder;
				}else{
					return this._options.urlDecoder;
				}
				return this;
			},
		// lazy request
			lazyRequest : function(urlPattern, timeout, QueuTimeout, abortWhenQueuTimeout){
				//TODO
				return this;
			},
		// cache
			cache		: function(state){
				if(state === undefined)
					return this._options.cache;
				else{
					$$.assertArg(typeof state == 'boolean', 'the cache argument must be a boolean!');
					this._options.cache	= state;
					return this;
				}
			},
		// timeout
			timeout		: function(tmeout){
				var result	= this;
				// callBack
					if(typeof tmeout == 'function'){
						//TODO add event
					}
				// timeout
					else if(typeof tmeout == 'number')
						this._options.timeout	= tmeout;
					else if(!tmeout)
						result	= this._options.timeout;
				// else
					else
						throw new $$.err.illegalArgument('incorrect timeout');
				return result;
			},
		// followMetaRedirects
			followMetaRedirects	: function(arg){
				if(!arg)
					return this._options.followMetaRedirects || false;
				else if(typeof arg == 'boolean')
					this._options.followMetaRedirects	= arg;
				else if(typeof arg == 'function'){
					//TODO add event
				}
				else throw new $$.err.illegalArgument('Needs boolean or function');
				return this;
			},
		/**
		 * abort()				// abort connection		
		 * abort(xhr => {})		// add an onAbort event listener
		 */
			abort		: function(arg){
				// abort process
					if(!arg){
							this._flags.abort	= true;
						// not starting yeat
							if(this._startTimeout){
								clearTimeout(this._startTimeout);
								this._startTimeout	= null;
								//TODO trigger abort event
							}
						// XHR en cours
							if(this.xhr){
								this.xhr.abort();
							}
						//send abort event
							this.trigger('abort');
							reject.call(this, 'abort');//
					}
				// add abort event
					else{
						this.on('abort', arg);
					}
			},
		/**
		 * 
		 * retry()				// retry connection
		 * retry(xhr => {})		// add retry event listener
		 */
			retry		: function(arg){
				//TODO
				return this;
			},
		/**
		 * .param()					// get all GET params
		 * .param('name')			// get param value
		 * .param('name', value)	// set URL param
		 * .param('name', [value])	// set URL multiple params
		 * .param({name:value})		// set those params
		 */
			param		: function(a, b){
				var url				= this._options.url,
					searchParams	= url.searchParams,
					result			= this,
					key,
					ele;
				// .param('name'), .param('name', value), .param('name', [value])
					if(typeof a == 'string'){
						if(b)	_addParams(a, b);
						else{
							result	= searchParams.getAll(a);
							if(result.length <= 1)
								result	= result[0];
						}
					}
				// .param()
					else if(!a){
						result	= {};
						searchParams.forEach((vlue, key) => {
							ele	= result[key];
							if(ele){
								if(Array.isArray(ele)) ele.push(vlue);
								else result[key]	= [ele, vlue];
							}else{
								result[key]	= vlue;
							}
						});
					}
				// .param({name:value})
					else if($$.isPlainObj(a)){
						url.search	= ''; // remove all entries
						for(key in a)
							_addParams(key, a[key]);
					}
				// else
					else
						throw new $$.err.illegalArgument('first argument: ', a);
				// end
					return result;
				// add params
					function _addParams(){
						var i, c;
						if(Array.isArray(b)){
							for(i = 0, c = b.length; i < c; ++i)
								searchParams.set(a, b[i]);
						}
						else
							searchParams.set(a, b);
					}
			},
		/**
		 * .data(obj || formData || HTMLForm || text || form-selector)
		 */
			data		: function(arg){
				var result	= this;
				if(arg)
					this._options.data	= arg;
				else result	= this._options.data;
				return result;
			},
			// get/set request contentType
				dataType		: function(type){
					if(type){ _optionsSplitConentTypeAndCharset(this._options, type); return this; }
					else{ return this.options.dataType; }
				},
			// get/set request charset
				dataCharset			: function(charset){
					if(charset){ this.dataCharset	= charset; return this; }
					else return this.dataCharset;
				},
			// accepts('json', ...)	// set accepted mimetypes
				accepts			: function(){
					//TODO
				},
		/**
		 * .header() 				// get all request header
		 * .header('name')			// get a request header
		 * .header('key', 'value')	// set request some header
		 * .header({key:value}) 	// override all headers
		 */
				header	: function(a, b){
					var result	= this;
					var headers	= this._options.headers;
					// get headers
						if(!a)
							result	= headers;
						else if(typeof a == 'string' && !b)
							result	= headers[$$.capitalize(a)];
					// set headers
						else{
							this.assertNew(); // assert request not yeat in progress
							((addHeader) => {
								if(typeof a == 'string')
									addHeader(a, b);
								else{
									for(var i in a)
										addHeader(i, a[i]);
								}
							})
							// fx to add each header
							((key, value) => {
								key	= $$.capitalize(key);
								if(key	== 'Content-Type')
									_optionsSplitConentTypeAndCharset(this._options, value);
								else
									headers[key]	= value;
							});
						}

					return result;
				},
			/**
			 * .removeHeader('header name', 'header2', '...')// remove header
			 */
				removeHeader	: function(){
					this.assertNew(); // assert request not yeat in progress
					for(var i=0, c = arguments.length; i < c; ++i)
						delete this.headers[arguments[i]];
				},
			// get/set Accepted 
			// accepts()	// get accepted mimetypes
		/**
		 * .readyState()			// get ready state [0, 1, 2, 3, 4]
		 * .readyState(fx)			// add this fx as callBack when the state change
		 */
			readyState	: function(callBack){
				var result	= this;
				if(!callBack)
					result	= this._readyState;
				else{
					$$.assertFunction(callBack);// assert that this is a function
					//TODO add event
				}
				return result;
			},

		// progress
			//.progress() // progress 0 to 1
			//.progress((percent, totalBytes, downloadedBytes)=>{})// set or get, valbale aussi on top object
			//.progress($$progressBar)// adjust progressbar auto
			uploadProgress	: function(listener){
				if(listener)
					this.on('upload-progress', listener);
				else
					return this._upTotal && !isNaN(this._uploaded) &&  (this._uploaded / this._total);
			},
			downloadProgress: function(){
				if(listener)
					this.on('progress', listener);
				else
					return this._total && !isNaN(this._loaded) && (this._loaded / this.total);
			},

		// serializers
			//serialize request data
			//serializer()			// get serializer
			//serializer(data=>{})	// set serializer
			serializer		: function(converter){
				this.assertNew();
				var result	= this;
				var options	= this._options;
				if(converter)
					options.serializer	= converter;
				else{
					result	= options.serializer;	// user specified serializer
					if(!result){ // get default serializer
						result	= options.dataType || options.data && _guessDataType(options.data);
						if(result)
							result	= _getSerializer(result);
					}
				}
				return result;
			},
			// deserialize response data
			// deserialize((xhr, data) => data)
			// deserialize({
			// 		mimeType	: (data => data)
			// })
			deserializer	: function(converter){
				//TODO
				return this;
			},
		// operations
			//beforeSend() get
			//beforeSend(xhr =>{})
				beforeSend	: function(){},
		// assert new Request (readystate == XMLHttpRequest.UNSENT)
			assertNew	: function(){
				$$.assert(!this.xhr || this.xhr.readyState == 0, () => new $$.err.illegalState('Request is in progress'));
			},

		// get response
			/**
			 * responseHeader()				// get all response headers
			 * responseHeader('headerName')	// get this response header
			 * responseHeader(xhr => {})	// add this callBack when status is 3 (headers received)
			 */
			responseHeader	: function(a){
				var result	= this;
				var reg;
				var i;
				if(!a){
					result	= this.xhr && this.xhr.getAllResponseHeaders();
					//parse headers
					if(typeof result == 'string'){
						reg	= result;
						result	= {};
						reg.split(/[\r\n]+/).forEach( e => {
							if(e){
								i	= e.indexOf(':');
								result[e.substr(0, i)]	= e.substr(i + 1).trim();
							}
						});
					}
				}
				else if(typeof a == 'string')
					result	= this.xhr && this.xhr.getResponseHeader($$.capitalize(a));
				else if(typeof a == 'function')
					this._responseHeaderFx	= a; //TODO change this to be an event listener
				else throw new $$.err.illegalArgument('argument must be string or function');
				return result;
			},
			/**
			 * force response content-type to this value
			 */
			responseType	: function(type){
				$$.assertArg(typeof type == 'string', 'Arg must be string');

				this._options.responseType	= type; //TODO
				return this;
			},
		/**
		 * then
		 * @returns {Promise} like "then" of promises
		 */
			// then(response => {})
			// then((response, error, xhr) => {})
			// then({
			// 		'200' : fx,
			// 		'30x'	: fx,
			// 		'400'	: fx
			// 		'350-400': fx
			// })
		 	then		: function(callBack){
	 			$$.assertFunction(callBack);// assert that this is a function
	 			this._options.then	= callBack;
	 			return this;
		 	},
		 /**
		  * catch any kind of error, even inside then callBack
		  */
		 	catch		: function(callBack){
		 		this.on('error', callBack);
	 			return this;
		 	},
		 /**
		  * life cycle
		  * end() // true or false, if the process is finished
		  * end(xhr => {})	// callBack when the process is finished
		  */
			end			: function(callBack){
				if(callBack){
					$$.assertFunction(callBack);
					this.bind('end', callBack);
				}
				return this;
			}
	});

	/////
	// define Getters
	/////
		(function(obj){
			for(var i in obj){
				Object.defineProperty(_XHR.prototype, i, {
					get	: obj[i]
				});
			}
		})
		({
			url			: function(){ return this.xhr && this.xhr.responseURL || this._options.url.href; },
			originalURL	: function(){ return this._options.url.href; },
			originalData: function(){ return this.xhr && this.xhr.responseText; },

			// redirects
				redirectTrace	: function(){ return this._redirectTrace; },

			// response
			originalResponse	: function(){ return this.xhr && this.xhr.responseText; },
			response			: function(){ return this._reponse; },
			contentType			: function(){
				$$.assert(this.readyState() >= 2 , 'Headers not yeat received');
				var result	= this.xhr.getResponseHeader('Content-Type');
				if(result)
					result	= result.split(';')[0].trim();
				return result || '';
			},
			responseCharset		: function(){
				$$.assert(this.readyState() >= 2 , 'Headers not yeat received');
				var result	= this.xhr.getResponseHeader('Content-Type');
				if(result){
					result	= result.match(/charset\s*=(.+)/i);
					if(result)
						result	= result[1].trim();
				}
				return result;
			},

			status		: function(){ return this.xhr && this.xhr.status; },
			statusText	: function(){ return this.xhr && this.xhr.statusText; }
		});



	
		
	// parse result

	// $$.get({
	// 	type		: 'GET',
	// 	url			: '',
	// 	urlDecoder	: fx,
	// 	lazyRequest	: {
	// 		pattern : '/-d/' or [/-/, ...],
	// 		pause	: 0, // waiting time after last connection
	// 		timeout : 0, // queu waiting timeout
	// 		abortWhenTimeout: true | false // if true, abort the call, else make it, default to true
	// 	},

	// 	headers	: {}, // request headers

	// 	cache		: true|false,
	// 	timeout		: 0,

	// 	followMetaRedirects : true|false, // default to true
	// 	data		: '',
	// 	dataType	: '',
	// 	dataCharset	: '',

	// 	then		: fx, // when finish
	// 	status : {},

	// 	request	: {
	// 		headers
	// 	}
	// })

})();