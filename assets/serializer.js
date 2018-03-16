// convert data
const DATA_SERIALIZERS = {
	'application/json'					: $$.toJSON,
	'application/xml'					: $$.toXML,
	'application/x-www-form-urlencoded'	: $$.toURLEncoded,
	'multipart/form-data'				: $$.toFormData
};

_ajaxCorePrivate.serializer	= function(data, dataType){
	if(!data)
		throw new Error('Need data');
	if(!dataType)
		dataType = _guessDataType(data);
	if(dataType && DATA_SERIALIZERS.hasOwnProperty(dataType))
		return DATA_SERIALIZERS[dataType](data);
	else return data;
};

