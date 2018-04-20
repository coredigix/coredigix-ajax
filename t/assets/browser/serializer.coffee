
DATA_SERIALIZERS =
	'application/json'					: JSON.stringify
	# 'application/xml'					: $$.toXML
	# 'application/x-www-form-urlencoded'	: $$.toURLEncoded
	# 'multipart/form-data'				: $$.toFormData

_serializer = (data, dataType) ->
	throw new Error 'Need data' unless data?
	dataType = _guessDataType dataType unless dataType?

	if dataType? and DATA_SERIALIZERS[dataType]?
		data = DATA_SERIALIZERS[dataType](data)
	data