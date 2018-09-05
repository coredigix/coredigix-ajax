use ajax

## api
``` coffeescript
request options

request.get options
request.head options
request.post options
request.patch options
request.put options
request.delete options

# 
request.getJson options # get parsed json
request.getOnce options # get result only once
request.getJsonOnce options # get only parsed json once
request.getMetaFollow options # like GET, will follow redirections via HTML meta tags

```

## commons functions
``` coffeescript
request.abortAll() # abort all requests
request.abort('tag') # abort the specified tag
request.find(tag) # get a list of all request under this tag
request.find([tag1, tag2]) # get a list of all request under this tag
```

### options
``` coffeescript
type	: GET|POST|HEAD|PUT|PATCH|DELETE # request methode
url		: 'url' # request URL

tags	: 'tag'
tags	: ['tag1', 'tag2']

# GET params
params	:
	parm1: 'value'
	parm2: 'value'

# http headers
headers: 
	header1: 'value'
	'content-type': 'json'

# data (via post, put or patch)
data: string, formData

# timeout
timeout: #request timeout


# custom XHR
xhr : new XMLHttpRequest()

# enable, disable cache
cache: true|false # default to true

# upload progress
upload: (event)=> ...

# download progress
download: (event)=> ...

# headersReceived: intercept header received: used for example to cancel the request before loading data (if the content type isnt desired) or if we just need headers, but the target server do not support "header" request (we do get, and then we cancel it)
headersReceived: (response) => ...
```

## Examples

``` coffeescript
request.get
	url: 'http://example.com/page?param=1'
	params: # GET params
		p1: 'value'
		p2: 'value 2'
	headers: # HTTP headers
		header1: 'value'
		'content-type': 'json' # specify the content type
	

	.then (response) ->
		response.status # get the status code
		response.statusText # get the status text
		response.readyState # get the readystate
		response.ok # if the response status is between 200 and 299
		response.url # get the current URL (after all redirections)
		response.originalURL # get the original URL

		response.type # get the response content type
		response.headers() # get all headers
		response.header('headerName') # get the header value

		response.json() # parse the json
		response.text # get the native response text
		response.response # get buffer, used for binary data

		response.getMetaRedirectURL() # internal use, used to get the meta tag redirect url
```


``` coffeescript
	request.get
		url	: 'http://google.com'
		tags: ['fa415qsd4145qsd', 'v4251dsf5sdf4sdf']
	.then (response)
		response.json()
		response.text
	.catch (reponse)
		response.status
		response.statusText
		response.text
		response.json()
```

remove vignette:
	request.abort('v4251dsf5sdf4sdf') # abort all request related to this vignette
	request.abort('fa415qsd4145qsd') # abort all request related to this folder
	request.abortAll() # abort all requests