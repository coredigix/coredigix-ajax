function _ajaxProcessOptions(xhr, options){
	AJAX_PROCESS_OPTIONS.forEach(option => {
		if(options.hasOwnProperty(option.param))
			option.process(xhr, options);
	});
}

const AJAX_PROCESS_OPTIONS	= [
	{
		param	: 'data',
		precess	: (xhr, options) => {
			if(typeof options.data === 'string'){}
			else {
				assert(options.hasOwnProperty('serializer'), 'Required serializer');
				options.data = options.serializer(options.data);
			}
		}
	},{
		param	: 'accepts',
		process	: (xhr, options) => {
			var accepts	= options.accepts;
			if(Array.isArray(accepts))
				options.accepts = accepts.map(ele => MIMETYPE_MAP[ele] || ele).join(',');
			else
				options.accepts = MIMETYPE_MAP[accepts] || accepts;
		}
	}
];