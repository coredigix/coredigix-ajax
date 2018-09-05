###
use http to make request on nodejs
###
http = require 'http'
https= require 'https'

###
request adapter
@param {XMLHTTPRequest} options.xhr custom xhr to use with the request

@param {int} options.timeout request timeout
@param {string} options.type request type
@param {URL} options.url URL
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
_sendRequest = (options) ->
	url = options.url
	# what to use
	nativehttp = if /^https/i.test url.href then https else http

	# prepare request
	req = 
		protocol: url.protocol
		host	: url.host
		port	: url.port
		method	: options.type
		path	: url.pathname + url.search
		headers	: options.headers
		#agent TODO
		timeout : options.timeout
	# user name and password
	if url.username
		req.auth = url.username + ':' + url.password
	# exec request
	request = nativehttp.request req, (res)->
		# response
		res.on 'end', () =>
			options.load response
	# create response object
	response = new requestResponse request
	response.originalURL = options.url
	# on Error
	if options.error?
	request.on 'error', (err) =>
		response.error = err
		options.error response

	# send post data
	if options.type in ['POST', 'PUT', 'PATCH']
		request.write options.data
	# starts
	request.end()
	##########################################################################################################
	

	#response type
	nativeXhr.responseType = options.responseType if options.responseType?

	# upload / download listener
	nativeXhr.upload.addEventListener 'progress', options.upload, false if options.upload?
	nativeXhr.addEventListener 'progress', options.download, false if options.download?

	# headers received
	if options.headersReceived?
		nativeXhr.addEventListener 'headersReceived',(event) => options.headersReceived response

	# load and error
	nativeXhr.addEventListener 'load',(event) => options.load response, false if options.load?
	nativeXhr.addEventListener 'error',(event) => options.error response, false if options.error?
	nativeXhr.addEventListener 'abort',(event) => options.error response, false if options.error?

	# cache
	if options.cache is false
		urlParams = options.url.searchParams
		loop
			prm = '_' + randomString()
			unless urlParams.has prm
				urlParams.append prm, 1
				break
	# send request
	nativeXhr.open options.type, options.url.href, true

	# add headers
	if options.headers
		for k, v of options.headers
			nativeXhr.setRequestHeader k, v
	# send data
	nativeXhr.send options.data || null

	# return
	response