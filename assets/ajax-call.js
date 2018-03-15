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
class XHR{
	constructor(type, options, otherOptions){
		this.promise	= new Promise((resolve, reject) => {
			try {
				var tmpOptions;
				//prepare options
					//validate otpions
						assert(options != undefined, () => 'need arguments');
					//prepare URL
						if(typeof options === 'string'){
							tmpOptions	= options;
							options		= {};
						}
						else if(options instanceof URL || options instanceof HTMLAnchorElement){
							tmpOptions	= options.href;
							options		= {};
						}
						else if(objUtils.isPlainObj(options)){
							tmpOptions	= options.url;
							if(typeof tmpOptions !== 'string')
								tmpOptions	= tmpOptions.href;
						}
						else
							throw new Error('illegal arguments options: ', options);
						//add url 
							tmpOptions	= toAbsURL(tmpOptions);
							options.url	= new URL(tmpOptions);
				// options.url	= new URL(options.url);
					//prepare headers
						if(options.headers){
							tmpOptions		= options.headers;
							options.headers	= {};
							for(var i in tmpOptions)
								options.headers[strUtils.capitalize(i)]	= tmpOptions[i];
							//charset
								if(options.headers['Content-Type'])
									_optionsSplitConentTypeAndCharset(options, options.headers['Content-Type']);
						}
						else options.headers	= {};
					//prepare dataType
						if(options.dataType)
							_optionsSplitConentTypeAndCharset(options, options.dataType);
					//add other options if exists
						if(otherOptions)
							otherOptions(options);
					//prepare data if post
						if(type === 'POST'){
							tmpOptions		= options.data;
							var dataType	= options.dataType,
							tmpVar;
							if(dataType)//convert datatype to mimetype
								dataType	= _toMimeType(dataType);
							else//guess data type from data
								dataType	= _guessDataType(tmpOptions);
							// apply data type
								options.headers['Content-Type']	= dataType + '; charset=' + (options.dataCharset || 'UTF-8');
							// convert data to specified data type
								if(options.serializer) // user customised serializer
									tmpOptions	= options.serializer.call(this, tmpOptions);
								else if(typeof tmpOptions == 'string'){}
								else if(dataType){
									tmpVar	= _getSerializer(dataType);
									if(tmpVar)
										tmpOptions	= tmpVar(tmpOptions);
									else{
										console.warn('POST>> data not converted');
									}
								}	
							options.data	= tmpOptions;

						}
				//add type
					options.type	= type;
				//save options
					this._options	= options;
				//falgs
					this.flags		= {};
				//send request
					this._tmout 	= setTimeout(() => {
						this.tmout	= null;
						sendXHR.call(this, resolve, reject);
					}, 1000) ;
			} catch(e) {
				console.error(e);
				reject(e);
			}
		});
	}

    cache(value){
    	this._options.cache = value; 
    	return this;
    }
    timeout(timeout){
    	this._options.timeout	= timeout; 
    	return this;
   	}
   	abort(){
   		this.flags.abort	= true;
   		if(this._tmout){
   			clearTimeout(this._tmout);
   			this.tmout	= null;
   		}
   		if(this.xhr){
   			this.xhr.abort();	
   		}
   		this.promise.resolve.apply(this.promise, null);
   		return this;
   	}
   	param(a, b){
   		var url				= this._options.url,
   			searchParams	= url.searchParams,
   			result 			= this,
   			ele;

   		//.param(name, value), .param('name')
   			if(typeof a === 'string'){
   				if(b) _addParams(a, b);
   				else{
   					result	= searchParams.getAll(a);
   					if(result.length >= 1)
						result	= result[0];
   				}
   			}
   		//.param()
   			else if(!a){
   				result	= {};
   				searchParams.forEach((value, key) => {
					ele	= result[key];
					if(ele){
						if(Array.isArray(ele)) ele.push(value);
						else result[key]	= [ele, value];
					}else{
						result[key]	= value;
					}
   				});
   			}
   		//.param({name	: value})
   			else if(objUtils.isPlainObj(a)){
   				url.search	= ''; // remove all entries
				for(var key in a)
					_addParams(key, a[key]);
   			}console.log('url ', url)
   		//else
   			else
   				throw new Error('illegal arguments: ', a, b);
   		//end
   			return result;

   		// add params
			function _addParams(a, b){
				var i, c;
				if(Array.isArray(b)){
					for(i = 0, c = b.length; i < c; ++i)
						searchParams.set(a, b[i]);
				}
				else
					searchParams.set(a, b);
			}
   	}
   	data(arg){
		var result	= this;
		//.data(data)
			if(arg)
				this._options.data	= arg;
		//.data()
			else result	= this._options.data;
		//return value
			return result;
	}
    then (){
		return this.promise.then.apply(this.promise, arguments);
    }

   	//PRIVATE FUNCTION
   		// convert data to mimetype
			_toMimeType(value){
				return MIMETYPE_MAP[value.toLowerCase()] || value;
			}
		//guess datatype to use 
			_guessDataType(data){
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
					dataType	= 'multipart';
				else if(data instanceof HTMLFormElement)
					dataType	= 'multipart';
				else if(objUtils.isPlainObj(data))
					dataType	= 'json';
				else{ console.warn('unkown data format: ', data); }

				return dataType && _toMimeType(dataType);
			}
		//get serializer
			_getSerializer(dataType){
				return DATA_CONVERTERS[dataType];
			}
}
/**
 * make ajax call
 * @param type	: GET, POST, DELETE, HEAD
 * @param otherOptions	: function to add other options
 * @return new XHR promise
 */
function ajaxCall (type, otherOptions) {
	return (options => {
		return new XHR(type, options, otherOptions);
	});
}