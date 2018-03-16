function ajaxCallerRequest(xhr, options){
	var private	= xhr[AJAX_PRIVATE_SYMB];
	return private.waitP.then(() => {
			// check options
			_ajaxCheckOptions(xhr, options);
			// process options
			_ajaxProcessOptions(xhr, options);
			// prepare request
			var nativeXHR = xhr.xhr = _prepareXHR(xhr, options);
			// on before send
			if(options.beforeSend)
				options.beforeSend(xhr);
			// delay before sending the ajax
			private.waitP	= typeof options.wait === 'number' ? delay(options.wait) : null;
			return private.waitP;
		})
		.then(() => _xhrSend(nativeXHR, options.data || null))
		// parsing
		.then(() => {
			// get server dataType and charset
				var dataType = nativeXHR.getResponseHeader('content-type');
				if(dataType){
					dataType	= dataType.split(';');
					private.responseType	= dataType[0];
					private.responseCharset	= dataType[1];
					dataType	= dataType[0];
				}
			return options.parser(xhr.nativeResponse, xhr[AJAX_OPTIONS_SYMB].responseType || dataType);
		})
		.then(data => {
			private.response	= data;
			var status	= nativeXHR.status;
			if(status < 200 || status >=300)
				throw 'Error';
			return data;
		});
}