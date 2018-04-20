_ajaxCheckOptions = (options) ->
	for item in AJAX_OPTIONS
		if options.hasOwnProperty item.param
			item.assert options[item.param]
		else if item.required is true
			throw new Error 'Required Attribute ' + item.param
		else if item.hasOwnProperty 'default'
			options[item.param]	= item.default()


AJAX_OPTIONS = [
		param	: 'url'
		assert	: (url) => assert url instanceof URL, 'expected URL instance'
		required: true
	,
		param	: 'id'
		assert	: (id) => assert typeof id is 'string', 'id expected string'
	,
		param	: 'timeout'
		assert	: (timeout) => assert typeof timeout is 'number' and timeout >= 0, 'incorrect timeout'
		default	: () => api.timeout
	,
		param	: 'wait'
		assert	: (wait)	=> assert typeof wait is 'number' and wait >= 0, 'incorrect wait'
		default : () => 0
	,
		param	: 'cache'
		assert	: (cache)	=> assert typeof cache is 'boolean', 'cache expected boolean'
		default	: () => api.cache
	,
		param	: 'dataType'
		assert	: (dataType) => assert typeof dataType is 'string', 'dataType expected string'
		default	: (options) => 
			if options.data?
				_guessDataType options.data
	,
		param	: 'data'
		assert	: (data, options) => assert options.type in ['POST', 'PUT'], 'Sending data requires POST or PUT request'
	,
		param	: 'dataCharset'
		assert	: (dataCharset) => assert typeof dataCharset is 'string', 'dataCharset expected string'
	,
		param	: 'serializer'
		assert	: serializer => assert(typeof serializer is 'function', 'serializer expected function')
		default	: () => api.serializer
	,
		param	: 'parser'
		assert	: (parser) => assert typeof parser is 'function', 'parser expected function'
		default	: () => api.parser
	,
		param	: 'responseType'
		assert	: (parser) => assert typeof responseType is 'string', 'responseType expected type string'
	,
		param	: 'beforeSend'
		assert	: (beforeSend) => assert typeof beforeSend is 'function', 'beforeSend expected function'
	,
		param	: 'accepts'
		assert	: (accepts) =>
			assert typeof accepts is 'string' ||
				Array.isArray(accepts) and accepts.every((e) => typeof e is 'string'),
				'accepts expected String or String list'
]