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