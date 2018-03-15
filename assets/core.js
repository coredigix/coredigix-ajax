var _ajaxCorePrivate	= {
	timeout	: 60000
};

const _ajaxCore = {
	// timeout
	timeout		: _ajaxCoreFx('timeout', 	t => assert(typeof t === 'number' && t >= 0, 'Illegal argument: ' + t) ),
	UrlDecoder	: _ajaxCoreFx('UrlDecoder', s => assert(typeof s === 'function', 'Illegal argument: ' + s) ),
	serializer	: _ajaxCoreFx('serializer', s => assert(typeof s === 'function', 'Illegal argument: ' + s) ),
	parser		: _ajaxCoreFx('parser', s => assert(typeof s === 'function', 'Illegal argument: ' + s) ),
};

function _ajaxCoreFx(param, check){
	return (value => {
		if(value === undefined)
			return _ajaxCorePrivate[param];
		else {
			check(value);
			_ajaxCorePrivate[param]	= value;
			return _ajaxCore;
		}
	});
}