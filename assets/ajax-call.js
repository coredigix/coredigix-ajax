class XHR extends Promise{
	constructor(type, options, otherOptions){
		super((resolve, reject) => {
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
						// if(type === 'POST'){
						// 	tmpOptions = options.data;

						// }
				//add type
					options.type	= type;
				//save options
					this._options	= options;
				//send request
					sendXHR.call(this, resolve, reject);
			} catch(e) {
				console.error(e);
				reject(e);
			}
		});
	}


	// split content type and charset
		_optionsSplitConentTypeAndCharset(options, contentType){
			contentType			= contentType.match(/^([^;]+)(?:;\s*charset\s*=(.*)$)?/i);
			options.dataType	= contentType[1].trim().toLowerCase();
			options.dataCharset	= contentType[2].trim();
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