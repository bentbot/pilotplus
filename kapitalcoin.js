var ioclient   	= require('socket.io-client')('https://vbit.io:3000'),
	kapitalize 	= require('kapitalize'),
	status		= false;

socket.on('connect', function() {

	socket.emit('coinconnect', { key: 'AVERYLONGSTRING' });

	socket.on('coinconnection', function (data) {

		if (data.status == 'OK') {

			status = true;

			var heart = setInterval(function() {
				var date = new Date(),
				time = date.getTime();
				socket.emit('heartbeat', { host: 'localhost', time: time });
			}, 1000);
			socket.on('heartbeat', function(beat) { console.log(beat); });

		} else if (data.status == 'KEY') {
			console.log('Invalid Private Key - Could Not Connect');
		}

	});

	socket.on('getinfo', function (data) {
		gclient.cmd('getinfo', function(err, info) {
			socket.emit('getinfo', { err: err, info: info });
		});
	});

	socket.on('backupwallet', function (data) {
		gclient.cmd('backupwallet', data.mount, function(err, info){
			socket.emit('backupwallet', { err: err, info: info });
		});
	});

	socket.on('getbalance', function (data){
		gclient.cmd('getbalance', data.user, data.confirmations, function(err, balance, resHeaders) {
			socket.emit('getbalance', { err: err, balance: balance });
		});
	});

	socket.on('getnewaddress', function (data){
		gclient.cmd('getnewaddress', data.label, function(err, add, resHeaders) {
			socket.emit('getnewaddress', { err: err, address: add });
		});
	});

	socket.on('listreceivedbyaddress', function (data){
		gclient.cmd('listreceivedbyaddress', function(err, result, resHeaders) {
			socket.emit('listreceivedbyaddress', { err: err, result: result });
		});
	});


	socket.on('sendfrom', function (data){
		gclient.cmd('sendfrom', data.from, data.to, data.amount, function(err, txid, resHeaders) {
			socket.emit('sendfrom', { err: err, txid: txid });
		});
	});

	socket.on('sendtoaddress', function(data) {
		gclient.cmd('sendtoaddress', data.to, data.amount, function(err, txid, resHeaders) {
			socket.emit('sendtoaddress', { err: err, txid: txid });
		});
	});

	socket.on('move', function(data) {
		gclient.cmd('move', data.from, data.to, data.amount, function(err, result, resHeaders) {
			socket.emit('move', { err: err, result: result });
		});
	});

});

socket.on('disconnect', function(){
	console.log('Disconnected');
	clearInterval(heart);
});