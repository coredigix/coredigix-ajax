//XMLHTTMRequest
//HTTP
//


$$.get('url') => promise

$$.get('url')
$$.post('url')
$$.delete('url')
$$.put('url')
$$.head('url')
	// .url 			// getter: current URL
	// .originalURL	// 

	.cache(true|false)
	.timeout(int)

	.abort()

	.param('name')			// get param value
	.param('name', value)	// add URL param
	.param({name:value})

	.data(obj || formData || HTMLForm || text) // set or get the data

	.requestHeader('key', value)
	.responseHeader('key')

	