###
convert URL to it's absolute form
###

_absURLElment = document.createElement 'a'
toAbsURL = (url) ->
	_absURLElment.setAttribute 'href', url
	_absURLElment.href