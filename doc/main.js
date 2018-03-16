ajaxUtils
	.ajax
		.xhrs	// list of all currecnt connection

		.abort()	// abort all connections
		.abort('folder.q45d14ff')	// abort all connection about this folder
		
		.abort(xhr => {}) // add a listener to fire when an abort occures
		.abort('folder', event => {}) // add a listener to fire when an abort occures on folder connections
		
		.catch(event => {}) 	// call when an error occuse

		.on('eventName', listener)
		.off('eventName', listener)
		//exemple,
		//	on('abort', event => {})
		//	on('abort.folders.{fid}.vignettes.{vid}', event => {})
		//	on('error.folders.{fid}.vignettes.{vid}', event => {})
		//	on('done') when a request done
		//	on('allDone') when all requests done

		.urlDecoder(url => {})


ajaxUtils
	.get(url | options)
	.post(url | options)
	.put(url | options)
	.head(url | options)
	.delete(url | options)

	.getJSON(url | options)
	.getXML(url | options)

	.getOnce(url | options)
	.getJSONOnce(url | options)
	.getXMLOnce(url | options)

/*<!>*/		.xhr			// get native XHR

/*<!>*/		.id('group.subGroup')	// grouper l'appel pour event

		.url			// current URL
		.originalURL	// url used to execute this call

		.goToURL(url)	// make redirect to this URL, before the request done only


		.timeout(int)	// request timeout, modifiable in progress mode
/*<!>*/	.on('timeout', event => {})
		.wait(int)		// time to wait before handling request, if lazy, waiting after enabling request
		/**
		 * add request to a queu
		 * @param {string} groupBy name of the queu
		 * @param {int} timeout timeout to wait inside queu
		 * @param {boolean} forceCall make call if timeout
		 */
/*<!>*/	.lazy('groupBy (queu name)', timeout, forceCall)	// if lazy, time to wait in the queu

		.cache(state) // enable/desable navigator cache

		.followMetaRedirects(state)	// if follow meta redirects
		.followMetaRedirects((url, xhr) => {})	// on before following metaredirect, if return is false, == do not follow

		.abort() 	// cancel the request
		.abort(raison) // cancel the request with message
		.abort(event => {})

		.replay() // refire request
		.replay(event => {})


		.param()				// get all GET params
		.param('name')			// get param value
		.param({name:value})	// set those params

		.accepts('json')	// set accepted mimetypes, === header({accept: 'json'})
		.accepts(['json'])	// set accepted mimetypes, === header({accept: arg.join(',')})

		.header() 					// get all request header
		.header('name')			// get a request header
		.header({key:value}) 		// override all headers

		.removeHeader('headerName')

		.readyState	// getter Ready state [0, 1, 2, 3, 4]
		.on('readyStateChange', cb)	// fired when readystate changes (async)

		.uploadProgress()	// {percent, totalBytes, uploadedBytes}
		.uploadProgress(({percent, totalBytes, uploadedBytes}) => {}) // == on('uploadProgress', cb)

		.downloadProgress()	// {percent, totalBytes, uploadedBytes}
		.downloadProgress(({percent, totalBytes, donwloadedBytes}) => {}) // == on('downloadProgress', cb)

		//POST Data
			.data()		// get data to be posted
			.data(obj || formData || HTMLForm || text || JQUERY || Brighter | arralLikeOfHTMLForm)

			.dataType('type') 		// typeof data: JSON, ...
			.dataCharset('utf8')	// encoding

			.serializer()	// get used serializer
			.serializer((data, dataType) => serializedData)	// set serializer for this request

		// Response
			.parser()			// get used deserializer
			.parser((data, dataType) => parsedData) // pase server response
			.response			// get parsed server response
			.nativeResponse		// response before parsing

			.responseType(str)	// force this response type, server say it "text" instead of "json"

			.responseHeader()				// get all response headers
			.responseHeader('headerName')	// get this response header
			.responseHeader(this => {})		// syn when headers received

			.contentType		// get content type === responseHeader('content-type').split(' ')[0]
			.contentCharset	// get response encoding === responseHeader('content-type').split(' ')[1]

			.status()		// get http status		, example: 404, 200, 500, ...
			.statusText	// get HTTP status text, example: not found

			.status({ // sync callback, before calling "then" after parsing
				200		: (this) => {true | false}, // cb when status is 200
				'40x'	: cb, // cb when status is 400 to 409
				'5xx'	: cb, // cb when status is 500 to 599
				'300-405':cb, // cb when status is between 300 and 405
			})

		// change native xhr before sending request
			.beforeSend(this => {})
		//promise
			.then(parsedServerResponse => {})
			.catch(err => {})
			.finally(() => {})

		// events
			.on('eventName', listener)
			.off('eventName', optionalLister), // off(), off(event), off(event, listener)
			.trigger('eventName', event)

		// infos
			.redirectStack	// array containings all redirect urls
			// example: [
			// 		{ // http permanent redirect, only on server side, in navigator side
			// 			url	: '*******',
			// 			type: '301'
			// 		},{ // http temporay redirect, only on server side
			// 			url	: '*******',
			// 			type: '302'
			// 		},{ // HTTP redirect, we detect last one only
			// 			url	: '*******',
			// 			type: 'http'
			// 		},{ // html meta redirect
			// 			url	: '*******',
			// 			type: 'meta'
			// 		}
			// ]