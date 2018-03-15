/**
 * make native xhr call
 */

function xhrCall(xhr, options) {
	//disable cache
	if(options.cache === false)
		options.url.searchParams.append('_', Date.now());
	//create XHR
	var nativeXhr	= new XMLHttpRequest();
	xhr.xhr	= nativeXhr;

	//if timeout
	if(options.timeout)
		xhr.timeout	= options.timeout;

	//open request
	xhr.open(options.type, options.url.href, true);
	// add headers
		// tmpOp	= options.headers;
		// for(i in tmpOp)
		// 	xhr.setRequestHeader(i, tmpOp[i]);
	xhr.send(options.data || null);
}