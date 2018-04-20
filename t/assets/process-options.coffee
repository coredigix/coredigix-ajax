_ajaxProcessOptions = (options) ->
	for p in AJAX_PROCESS_OPTIONS
		if options.hasOwnProperty p.param
			p.process options

AJAX_PROCESS_OPTIONS = [
		param	: 'data'
		precess : (options) ->
			unless typeof options.data is 'string'
				assert options.serializer?, 'serializer required'
				options.data = options.serializer options.data
	,
		param	: 'accepts'
		precess : (options) ->
			accepts	= options.accepts
			if Array.isArray accepts
				options.accepts = accepts.map((ele) => MIMETYPE_MAP[ele] || ele).join(',')
			else
				options.accepts = MIMETYPE_MAP[accepts] || accepts
]