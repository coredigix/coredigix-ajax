# convert an URL to abs
_ancore = document.createElement 'a'
_absURL = (url) ->
	_ancore.setAttribute 'href', url
	_ancore.href

# assert
assert = (pattern, errMsg) ->
	unless pattern
		if typeof errMsg is 'string'
			throw new Error errMsg
		else
			throw errMsg

###
request adapter
@param {XMLHTTPRequest} options.xhr custom xhr to use with the request

@param {int} options.timeout request timeout
@param {string} options.type request type
@param {URL} url URL
@param {string} options.cache true|false

@param {string} options.responseType type of the response (arraybuffer)

@param {function} options.upload cb on upload progress
@param {function} options.download cb on download progress
@param {function} options.load cb on load
@param {function} options.error cb on errror
@param {function} options.headersReceived cb on headers received

@param {map} options.headers request headers map

@param {mixed} options.data data to send
###
_sendRequest = (url, options) ->
	# xhr
	nativeXhr			= options.xhr or new XMLHttpRequest()
	nativeXhr.timeout	= options.timeout if options.timeout?

	# create response object
	response = new requestResponse nativeXhr
	response.originalURL = url

	#response type
	nativeXhr.responseType = options.responseType if options.responseType?

	# upload / download listener
	nativeXhr.upload.addEventListener 'progress', options.upload, false if options.upload?
	nativeXhr.addEventListener 'progress', options.download, false if options.download?

	# headers received
	if options.headersReceived?
		nativeXhr.addEventListener 'headersReceived',(event) => options.headersReceived response

	# load and error
	if options.load?
		nativeXhr.addEventListener 'load',(event) =>
			options.load response
		, false
	if options.error?
		nativeXhr.addEventListener 'error',(event) =>
			options.error response
		, false
	if options.error?
		nativeXhr.addEventListener 'abort',(event) =>
			options.aborted = true
			options.error response
		, false

	# cache
	if options.cache is false
		urlParams = url.searchParams
		loop
			prm = '_' + randomString()
			unless urlParams.has prm
				urlParams.append prm, 1
				break
	# send request
	nativeXhr.open options.type, url.href, true

	# add headers
	if options.headers
		for k, v of options.headers
			nativeXhr.setRequestHeader k, v
	# send data
	nativeXhr.send options.data || null

	# return
	response

###
response
###
class requestResponse
	constructor: (@xhr)->

	### abort current request ###
	abort : (@abortMsg)->
		@error = 'aborted'
		@error += ': ' + @abortMsg if @abortMsg?
		@xhr.abort()

Object.defineProperties requestResponse.prototype,
	status:
		get: ()->
			@xhr.status
	statusText:
		get: ()->
			@xhr.statusText
	readyState:
		get: ()->
			@xhr.readyState
	### URL ###
	url:
		get: ()->
			@xhr.responseURL || @originalURL
	### if the request is ok ###
	ok:
		get: ()->
			200 <= @xhr.status <= 299
	# content type
	type:
		get: ()->
			dataType = @xhr.getResponseHeader 'content-type'
			if dataType
				dataType	= dataType.split ';'
				dataType[0].toLowerCase()
			
	### get all headers ###
	headers:
		get: ()->
			@xhr.getAllResponseHeaders()
	### get header ###
	header:
		value: (name)->
			@xhr.getResponseHeader name

	### get the response as text ###
	text:
		get: ()->
			@xhr.responseText
	### get and parse the response ###
	json:
		value: (name)->
			try
				JSON.parse @xhr.responseText
			catch e
				@error = e
				throw this
			
	### binary response ###
	response:
		get: ()->
			@xhr.response

	### parse HTML and get MetaRedirectURL ###
	getMetaRedirectURL:
		value: (name)->
			if @type?.indexOf 'html' isnt -1
				response = @xhr.responseText
				if response
					metaRegex = /<meta.+?>/gi
					while tag = metaRegex.exec response
						if /\bhttp-equiv\s*=\s*"?refresh\b/i.test tag[0]
							return tag[0].match(/url=([^\s"']+)"?/i)?[1]