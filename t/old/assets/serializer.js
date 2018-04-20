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

function _guessDataType(data){
	var dataType;
	if(typeof data === 'string'){
		// url encoded
			if(/^[^&]+=[^&]*(?:&[^&]+=[^&]*)*$/.test(data))
				dataType = 'urlEncoded';
		//JSON
			else if(
				( () => { try{ JSON.parse(data); return true; }catch(e){ return false } })()
			)
				dataType = 'json';
		// text
			else
				dataType = 'text';
	}
	else if(data instanceof FormData)
		dataType	= 'multipart';
	else if(data instanceof HTMLFormElement)
		dataType	= 'multipart';
	else if(objUtils.isPlainObj(data))
		dataType	= 'json';
	else{
		
	}
	return dataType && MIMETYPE_MAP[dataType];
}