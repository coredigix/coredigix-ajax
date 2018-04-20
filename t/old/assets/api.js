const ajaxUtils	= {
	get			: _makeAjax('GET', null), 
	post		: _makeAjax('POST', null),
	put			: _makeAjax('PUT', null),
	head		: _makeAjax('HEAD', null),
	delete		: _makeAjax('DELETE', null), 

	getJSON		: _makeAjax('GET', options => {	options.contentType = 'json'; }),
	getXML		: _makeAjax('GET', options => {	options.contentType = 'xml'; }),

	getOnce		: _makeAjax('GET', options => {	options.once = true; }),
	getJsonOnce	: _makeAjax('GET', options => {	options.once = true; options.contentType = 'json'; }),
	getXmlOnce	: _makeAjax('GET', options => {	options.once = true; options.contentType = 'xml'; }),

	ajax		: _ajaxCore
};

function _makeAjax(_type, _op){
	return function(options){
		var userHeaders = null;

		if(arguments.length !== 1 || !options)
			throw new Error('Illegal arguments');
		// URL
		var url	= options.url || options;
		if(!url)
			throw new Error('Needs URL');
		else if(typeof url === 'string'){}
		else if(url instanceof URL || url instanceof HTMLAnchorElement)
			url	= url.href;
		else
			throw new Error('Incorrect URL');
		// options
		if(!objUtils.isPlainObj(options))
			options	= {};
		//add headers
		if(options.headers)
			userHeaders = options.headers;
		options.headers	= {};
		// exec other options
		options.type	= _type;
		if(_op !== null)
			_op(options);
		// decode URL
		var decoder = options.urlDecoder || ajaxUtils.ajax.urlDecoder;
		if(typeof decoder === 'function')
			url	= decoder(url);
		// add URL
		options.url	= new URL(url);

		// caller
		var ajaxC	= new AjaxCaller(options);
		if(userHeaders !== null)
			ajaxC.header(userHeaders);
		return ajaxC;
	}
}