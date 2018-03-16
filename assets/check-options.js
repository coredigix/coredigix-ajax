/**
 * check all ajax options
 */
function _ajaxCheckOptions(xhr, options){
	AJAX_OPTIONS.forEach(item => {
		if(options.hasOwnProperty(item.param))
			item.assert(options[item.param], options);
		else if(item.required === true)
			throw new Error('Needs option ' + item.param);
		else if(item.hasOwnProperty('default'))
			options[item.param]	= item.default(options);
	});
}

const AJAX_OPTIONS = [
	{
		param	: 'url',
		assert	: url => assert(url instanceof URL, 'url must be of type URL'),
		required: true
	},{
		param	: 'id',
		assert	: id => assert(typeof id === 'string', 'id must be of type string')
	},{
		param	: 'timeout',
		assert	: timeout => assert(typeof timeout === 'number') && timeout >= 0, 'timeout must be of type number and greater or equals than 0'),
		default	: () => ajaxUtils.ajax.timeout()
	},{
		param	: 'wait',
		assert	: wait	=> assert(typeof wait === 'number' && wait >= 0, 'wait must be of type number and greater or equals than 0'),
		default : () => 0
	},{
		param	: 'cache',
		assert	: cache	=> assert(typeof cache === 'boolean', 'cache must be of type boolean'),
		default	: () => true
	},{
		param	: 'dataType',
		assert	: dataType => assert(typeof dataType === 'string', 'dataType must be of type string'),
		default	: (options) => {
			if(options.data !== undefined)
				return _guessDataType(options.data);
		}
	},{
		param	: 'data',
		assert	: (data, options) => assert(options.type === 'POST' || options.type === 'PUT', 'Sending data requires POST or PUT request')
	},{
		param	: 'dataCharset',
		assert	: dataCharset => assert(typeof dataCharset === 'string', 'dataCharset must be of type string')
	},{
		param	: 'serializer',
		assert	: serializer => assert(typeof serializer === 'function', 'serializer must be a function'),
		default	: () => ajaxUtils.ajax.serializer()
	},{
		param	: 'parser',
		assert	: parser => assert(typeof parser === 'function', 'parser must be a function'),
		default	: () => ajaxUtils.ajax.parser()
	},{
		param	: 'responseType',
		assert	: parser => assert(typeof responseType === 'string', 'responseType must be of type string')
	},{
		param	: 'beforeSend',
		assert	: beforeSend => assert(typeof beforeSend === 'function', 'beforeSend must be a function')
	},{
		param	: 'accepts',
		assert	: accepts => {
			assert(
				typeof accepts === 'string'
				|| (
					Array.isArray(accepts)
					accepts.every(e => typeof e === 'string')
				)
				, 'illegal argument'
			);
		}
	}
];