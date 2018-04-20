###
Ajax utilities
###

#=require utilis.coffee
#=require requester.coffee
#=require mimetypes.coffee
#=require check-options.coffee
#=require process-options.coffee
#=require guess-data-type.coffee
#=require serializer.coffee
#=require main-method-factory.coffee

api =
	# main methodes
	get: _mainMethodFactory 'GET'
	post: _mainMethodFactory 'POST'
	put: _mainMethodFactory 'PUT'
	head: _mainMethodFactory 'HEAD'
	'delete': _mainMethodFactory 'DELETE'
	# other methodes
	getJson: _mainMethodFactory 'GET',
		contentType:'json'
	getXml: _mainMethodFactory 'GET',
		contentType:'xml'
	# once
	getOnce: _mainMethodFactory 'GET',
		once: true
	getJsonOnce: _mainMethodFactory 'GET',
		contentType:'json'
		once: true
	getXmlOnce: _mainMethodFactory 'GET',
		once: true
		contentType:'xml'

	# preferences
	timeout		: 0 			#default timeout
	cache		: true			# use navigator cache if enabled
	serializer	: _serializer
	# parser
