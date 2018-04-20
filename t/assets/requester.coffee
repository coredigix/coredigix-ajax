###
Requester
###
AJAX_OPTIONS_SYMB	= Symbol()
REQUESTER_PRIVATE	= Symbol()
class _ajaxRequester extends Promise
	constructor: (url, type)->
		prvt = 
			redirectStack: [] # store redirect URLs
		# promise
		super (res, rej) =>
			resolve	= res
			reject	= rej
			return
		this[REQUESTER_PRIVATE] = prvt
		# options
		options = @[AJAX_OPTIONS_SYMB] = 
			url		: url
			type	: type
			param	: {}	# get params
		# send request
		resolve(() =>
			loop
				try
					prvt.redirect = false
					prvt.redirectStack.push options.url
					# check options
					_ajaxCheckOptions options
					# process options
					_ajaxProcessOptions options
					# prepare native XHR
					nativeXHR = xhr.xhr = _prepareXHR this, options
					# on before send
					if options.beforeSend
						options.beforeSend this
					# delay before sending ajax
					prvt.waitP = delay options.wait || 0
					await prvt.waitP
					#send request
					await _xhrSend(nativeXHR, options.data || null)
					# parsing
					dataType = nativeXHR.getResponseHeader 'content-type'
					if dataType
						dataType			= dataType.split ';'
						prvt.responseType	= dataType[0]
						prvt.responseCharset= dataType[1]
						dataType			= dataType[0]
					prvt.response = data = options.parser xhr.nativeResponse, options.responseType || dataType
					status			= nativeXHR.status
					if status < 200 || status >= 300
						throw 'Error'
					data
				catch err
					unless prvt.redirect is true
						throw err
		)
		prvt.timeout = setTimeout(() => 
			try
				prvt.timeout = null
				# make call
				loop
					if(typeof options.wait is 'number')
						private.timeout = setTimeout(() => 
							private.timeout = null
							xhrCall this, options
							, options.wait)
					else
						xhrCall this, options
			catch err
				prvt.reject err
		, 0)
	# id
	id	: (id) ->
		if arguments.length is 0
			@[AJAX_OPTIONS_SYMB].id
		else if arguments.length is 1 && typeof id is 'string'
			@[AJAX_OPTIONS_SYMB].id = id



Object.defineProperties _ajaxRequester.prototype,
	# current URL
	url:
		value: ->
			this.xhr?.responseURL || this.originalURL
	# original URL
	#originalURL
	# add url param
	# param({ key: value })
	param:
		value: (param) ->
			assert typeof param is 'object' and param isnt null
			params = @[AJAX_OPTIONS_SYMB].param
			for key, value of params
				params[key] = value
			this
	###
	header
	@example
	* header({key: value})
	###
	header:
		value: (param) ->
			assert typeof param is 'object' and param isnt null
			@[AJAX_OPTIONS_SYMB].param ?= {}
			params = @[AJAX_OPTIONS_SYMB].param
			for key, value of params
				params[key] = value
			this
	###
	goToURL
	reply
	###
	
	# abort
	abort:
		value: (errMessage) ->
			p	= this[AJAX_PRIVATE_SYMB]
			if p.timeout?
				clearTimeout p.timeout
				p.timeout = null
			@xhr?.abort()
			p.reject(errMessage || 'abort');
			this


###
other params
###
_addAjaxParam = (param) ->
	(value) ->
		@[AJAX_OPTIONS_SYMB][param] = value
		this

mList = [
	'timeout',
	'wait',
	'cache',
	'followMetaRedirects',
	'accepts',
	# POST Data
	'data',
	'dataType',
	'dataCharset',
	'serializer',
	# response
	'parser',
	'responseType',
	'beforeSend'
]
for ele in mList
	_addAjaxParam(ele)