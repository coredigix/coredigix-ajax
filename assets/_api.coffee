MAX_META_REDIRECTS = 5 # max meta tag redirects to follow
#=include _header-map.coffee
#=include _utils.coffee
#=include _request.coffee

###
create request sercuits
###
_req = (type)->
	(options)->
		throw new Error type + '>> Illegal arguments' unless arguments.length is 1 and options?
		if typeof options is 'string' or options instanceof URL
			options = url: options
		options.type = type
		request options
###
GET
@example
* get('https://example.com/page1')
* get({
* 	url: '...'
* 	other options
* })
###
request.get		= _req 'GET'
request.head	= _req 'HEAD'
request.post	= _req 'POST'
request.patch	= _req 'PATCH'
request.put 	= _req 'PUT'
request.delete	= _req 'DELETE'

### JSON ###
request.getJson = (options)->
	xhr = request.get options
	xh2 = xhr.then (response) =>
		throw response unless response.ok
		response.json()
	# add abort function
	xh2.abort = (errMsg) -> xhr.abort errMsg
	xh2

### Once ###
_request_queu = {} # store requests

request.getOnce = (options) ->
	if typeof options is 'string' or options instanceof URL
		options = url: options
	# resolve final URL
	url = _resolveURL options
	delete options.params
	options.url = url
	href = url.href
	# result
	_request_queu[href] || (_request_queu[href] = request.get options)
request.getJsonOnce = (options) ->
	xhr = request.getOnce options
	xh2 = xhr.then (response)-> response.json()
	# add abort function
	xh2.abort = (errMsg) -> xhr.abort errMsg
	xh2


# post json
request.postJson = (options) ->
	options.headers ?= {}
	options.headers['content-type'] = 'json'
	if options.data and typeof options.data isnt 'string'
		options.data = JSON.stringify options.data
	request.post options

###
GET response, follow html meta tag redirects
###
request.getMetaFollow = (options) ->
	p = new Promise (resolve, reject) =>
		# do request
		redirectsCount = 0
		req = () =>
			currentReq = request.get options
				.then (response) =>
					url = response.getMetaRedirectURL()
					if url
						++redirectsCount
						throw new Error 'metatag redirect exceeds ' + redirectsCount if redirectsCount >= MAX_META_REDIRECTS
						if typeof options is 'string' or options instanceof URL
							options = url
						else
							options.url = url
							delete options.params
						do req # new request to this url
					else
						resolve response
				.catch reject
		req() # start request
	# abort wrapper
	p.abort = (errMsg)->
		currentReq.abort errMsg
	# return
	p