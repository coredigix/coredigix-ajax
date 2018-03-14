/**
 * using xhr to send data
 * @param  {[type]} resolve [description]
 * @param  {[type]} reject  [description]
 * @return {[type]}         [description]
 */
function sendXHR (resolve, reject) {
	var options = this._options,
		headers;
	//if disable cache
		if(options.cache === false)
			options.url.searchParams.set('_', Date.now());
	//make xhr
		var xhr 	= new XMLHttpRequest();
		this.xhr	= xhr;
	//open
		xhr.open(options.type, options.url.href, true);
	//add headers
		headers	= options.headers;
		for(var i in headers)
		xhr.setRequestHeader(i, headers[i]);
	//send
		xhr.send(options.data || null); 
	resolve();
}