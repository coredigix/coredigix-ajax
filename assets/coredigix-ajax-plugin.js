/**
 * plugin for ajax calls
 */

if(typeof CoreDigixPlugin === 'undefined'){
	throw new Error('CoreDigixPlugin not found');
}

(function($$){
	'use strict';
	//ajax call maker
	//=include call-maker.js

	$$.plugin({
		get		: callMaker('GET'),
		post	: callMaker('POST'),
		delete	: callMaker('DELETE'),
		head	: callMaker('HEAD'),
	});
})(CoreDigixPlugin);