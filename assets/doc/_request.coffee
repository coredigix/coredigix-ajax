request
	url		: 'url'
	xhr		: () => nativeXhr # custormize user XHR

	params	: # get params
		param1: 'value'
		param2: 'value2'

	headers	: # request headers
		header1: value

	headersReceived: cb

	timeout	: # request timeout
	cache	: true|false



	# onHeaders: (response) -> # cb, when receiving headers
	# 	response.url
	# 	response.originalURL
	# 	response.abort(errMsg) # abort the request
	# 	response.goToURL(url) # abort this request and go to URL

	# followMetaRedirects:  true | false


	# post data
	data	: JSON.stringify data

	#id		: 'request identifier'

	upload(cb)
	download(cb)

.abort(errMsg) # abort the request
.then (response) -> # call when headers received
	response.status # response status
	response.readyState
	response.statusText
	response.type	# contentType

	response.ok		# is the reponse between 200 and 299

	response.headers # received headers
	response.header('headerName') # get header

	response.url	# current URL
	response.originalURL	# get the original URL

	response.getMetaRedirectURL() # get meta redirect URL if exists
.then (response) -> # call when response ends

	response.status
	response.readyState
	response.statusText
	response.headers # received headers
	response.text	# get text
	response.json() # parse the json response
	response.type	# contentType

	response.url	# current URL
	response.originalURL	# get the original URL
.catch (err) ->
