###
create ajax main methods
###
_mainMethodFactory = (type, pOptions)->
	return (options, data)->
		assert arguments.length in [1,2], 'Illegal arguments'
		# URL
		url = options.url || options.href || options
		if typeof url is 'string'
			url = new URL toAbsURL url
		else unless options instanceof URL
			throw new Error 'Incorrect URL'
		# caller
		ajaxC	= new _ajaxRequester url, type

		# exec other options
		if pOptions?
			for value, key in pOptions
				ajaxC[key](value)
		if typeof options is 'object' and options isnt null
			for value, key in options
				if ajaxC.hasOwnProperty key
					ajaxC[key] value
				else
					throw new Error 'Unknown option: ' + key
		# return
		ajaxC
		