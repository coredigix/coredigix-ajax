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
							tmpOptions = options.data;
							
						}
				//add type
					options.type	= type;
				//save options
					this._options	= options;
				//send request
					setTimeout(() => {sendXHR.call(this, resolve, reject);}, 1000) ;
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
   		if(this.xhr){
   			this.xhr.abort();	
   		}
   		this.promise.resolve.apply(this.promise, null);
   		return this;
   	}
    then (){
		return this.promise.then.apply(this.promise, arguments)
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