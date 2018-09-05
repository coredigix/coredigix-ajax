###
convert string to snapcase
###
# strSnakeCase= (str)->
# 	str.trim()
# 		.split /[^\w]+|(?=[A-Z])/
# 		.map (w) => w.toLowerCase()
# 		.join '-'
strUpSnakeCase= (str)->
	str.trim()
		.split /[^\w]+|(?=[A-Z])/
		.map (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()
		.join '-'

###
generate random string
###
randomString= ()->
	Math.random().toString(32).substr(2)


### resolve URL ###
_resolveURL = (options)->
	url = options.url
	url = new URL _absURL url if typeof url is 'string'
	# add get params
	if options.params?
		for k,v of options.params
			url.searchParams.append k, v
				
	url