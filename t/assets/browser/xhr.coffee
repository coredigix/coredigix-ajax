

xhrCall = (xhr, options) ->
	# disable cache
	if options.cache is false
		options.param['_' + Math.random().toString(32).substr(2)] = Date.now()
	# add params to URL
	searchParams = options.url.searchParams
	for k,v of options.params
		if Array.isArray v
			for v2 in v
				searchParams.append k, v2
		else
			searchParams.append k, v
	# create XHR
	nativeXhr	= new XMLHttpRequest();
	xhr.xhr		= nativeXhr;

	# if timeout
	if options.timeout?
		xhr.timeout	= options.timeout

	# open request
	xhr.open options.type, options.url.href, true
	# add headers
		tmpOp	= options.headers
		for k, v of tmpOp
		 	xhr.setRequestHeader k, v
	xhr.send options.data || null