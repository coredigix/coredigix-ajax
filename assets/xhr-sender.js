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
	//timeout
		if(options.timeout){
			$$.assertArg(isFinite(options.timeout) && options.timeout >= 0, 'incorrect timeout');
			xhr.timeout	= options.timeout;
		}
	//make xhr
		var xhr 	= new XMLHttpRequest();
		this.xhr	= xhr;
	//on ready state change
		xhr.onreadystatechange = (event => {
			//Done
				if(xhr.readyState == 4){
					if(xhr.status >= 200 && xhr.status <= 299)
						resolve(xhr.responseText);
					else // error
						reject(xhr);
				}
		});
	//open
		xhr.open(options.type, options.url.href, true);
	//add headers
		headers	= options.headers;
		for(var i in headers)
			xhr.setRequestHeader(i, headers[i]);
	//send
		xhr.send(options.data || null);
}