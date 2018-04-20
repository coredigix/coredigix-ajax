#Ajax Utilities


##Main methodes
* .get(url | options)
* .post(url | options, data)
* .get(url | options, data)
* .head(url | options)
* .delete(url | options)

* .getJSON(url | options)
* .getXML(url | options)

* .getOnce(url | options)
* .getJSONOnce(url | options)
* .getXMLOnce(url | options)

##Common sub methodes
* .xhr get native xhr
* .id('grpID') add a group id
* .url						get current url
* .originalURL				get original URL
* .urlDecoder(url => url)	decode URL
* .goToURL(url)				make redirect to this URL, before the request done

* .timeout(int)				request timeout
* .on('timeout', event => {})
* .wait(int)		// time to wait before handling request, if lazy, waiting after enabling request

* .