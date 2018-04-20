_guessDataType = (data) ->
	if typeof data is 'string'
		# url encoded
		if(/^[^&]+=[^&]*(?:&[^&]+=[^&]*)*$/.test data
			dataType = 'urlEncoded'
		# JSON
		else if ( () =>
			try
				JSON.parse(data);
				true
			catch err
				false
		)()
			dataType = 'json'
		# text
		else
			dataType = 'text';
	}
	else if data instanceof FormData
		dataType	= 'multipart'
	else if data instanceof HTMLFormElement
		dataType	= 'multipart'
	else if typeof data is 'object' and data isnt null
		dataType	= 'json'
	else
		dataType = ''
	return dataType && MIMETYPE_MAP[dataType];