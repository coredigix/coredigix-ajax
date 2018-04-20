delay = (delay) ->
	new Promise (res, rej) =>
		api =
			resolve: res,
			reject: rej
		setTimeout res, delay
		api