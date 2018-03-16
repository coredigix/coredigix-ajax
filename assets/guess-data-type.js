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