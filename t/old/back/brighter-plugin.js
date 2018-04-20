/**
 * pluging for brighter
 */
if(typeof BrighterJS === 'undefined'){
	throw new Error('Brighter not found.');
}

;(function($$){
	'use strict';
	//=include xhr-sender.js
	//=include ajax-call.js

	$$.rootPlugin({
		get		: ajaxCall('GET'),
		post	: ajaxCall('POST'),
		delete	: ajaxCall('DELETE'),
		head	: ajaxCall('HEAD')
	});
})(BrighterJS);