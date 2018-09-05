_requestQueu = new Set() # store all requests
###
single request sender
@param {XMLHTTPRequest} options.xhr custom xhr to use with the request

@param {int} options.timeout request timeout
@param {string} options.type request type

@param {URL} options.url URL
@param {map} options.params GET params
@param {string} options.cache true|false

@param {function} options.upload cb on upload progress
@param {function} options.download cb on download progress
@param {function} options.headersReceived cb on headers received

@param {map} headers request headers map
###
request = (options)->
	response = null
	p = new Promise (resolve, reject) =>
		assert options?.url?, 'Request>> URL expected'
		options.type = options.type?.toUpperCase() || 'GET'
		# url
		url = _resolveURL options
		# fix headers
		headers = {}
		if options.headers
			# convert kies to lowercase and snapcase
			for k of options.headers
				headers[strUpSnakeCase k] = options.headers[k]
			# add conenttype
			contentType = headers['Content-Type']
			if contentType?
				contentType = contentType.toLowerCase()
				headers['Content-Type'] = MIME_TYPE_MAP[contentType] if MIME_TYPE_MAP[contentType]?
			# accept
			if headers.Accept?
				accept = headers.Accept
				if Array.isArray accept
					headers.Accept = accept.map (el) =>
						MIME_TYPE_MAP[el.toLowerCase()] || el
				else if typeof accept is 'string'
					accept = accept.toLowerCase()
					if MIME_TYPE_MAP[accept]
						headers.Accept = MIME_TYPE_MAP[accept]
		options.headers = headers

		# onLoad, onError
		options.load = resolve
		options.error = reject

		# tags: convert to array
		if options.tags?
			unless Array.isArray options.tags
				options.tags = [options.tags]

		# use xhr
		response = _sendRequest url, options
		# return response
		response
	# add other attributes
	p.abort = (errMsg) ->
		response.abort errMsg
	# store inside queu
	_requestQueu.add p
	p.finally ()=>
		_requestQueu.delete p
	# return promise
	p


# queu manager
request.abortAll = (abortMsg)->
	for req in _requestQueu
		req.abort abortMsg

request.abort = (tag, abortMsg)->
	lst = request.find tag
	for req in lst
		req.abort abortMsg
# find requests with tag or all tags
request.find = (tag)->
	lst =[]
	# one tag
	if Array.isArray tag
		for req in _requestQueu
			if req.tags.indexOf(tag) isnt -1
				lst.push req
	# all tags
	else
		for req in _requestQueu
			if tag.every((tg) => req.tags.indexOf(tg) isnt -1)
				lst.push req
	lst