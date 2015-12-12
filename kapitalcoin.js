var socket = require('socket.io-client')('https://vbit.io:3030'),
    express = require('express'),
    keys = require('./keys.json'),
    app = express();

    kapitalize = require('kapitalize')({
		user: keys.btcrpc.user,
		pass: keys.btcrpc.password
	}),
	keys = require('./keys.json');

var heart;
var beats = new Array();

app.use('/add/:id', function(req, res) {
	socket.emit('addtx', { txid: req.params.id });
	res.send('Heard '+req.params.id);
});

app.use('/log/:id', function(req, res) {
	socket.emit('log', { log: req.params.id });
	res.send('Logged '+req.params.id);
});

app.listen(3030);


socket.on('connect', function() {

	console.log('Connected');

	socket.on('addtx', function (data) {

		console.log('addtx: '+data);

		console.log('New transation: ' + data)

	});

	socket.emit('coinconnect', { key: keys.coin });

	socket.on('coinconnection', function (data) {

		if (data.status == 'OK') {

			status = true;

			heart = setInterval(function() {
				var date = new Date(),
				time = date.getTime(),
				rand = new Array(5).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
				socket.emit('heartbeat', { host: 'Kapitalcoin', time: time });
			}, 1650);

		} else if (data.status == 'KEY') {
			console.log(data.date + ': Invalid Private Key - Could Not Connect');
		}

	});

	socket.on('heartbeat', function (beat) {
		beats.push(beat);
		//console.log('heartbeat '+beat.latency); 
	});

	socket.on('backupwallet', function (data) {

		console.log('backupwallet: '+data);
		kapitalize.exec('backupwallet', data.mount, function(err, info){
			if (err) throw (err);
			socket.emit('backupwallet', { err: err, info: info });
		});
	});

	socket.on('getbalance', function (data) {
		if (data) {
			kapitalize.exec('getbalance', data.user, data.confirmations, function(err, balance, resHeaders) {
				if (err) throw (err);
				socket.emit('getbalance', { err: err, balance: balance });
				console.log('Balance: '+balance);
			});	
		} else {
			kapitalize.exec('getbalance', function(err, balance, resHeaders) {
				if (err) throw (err);
				socket.emit('getbalance', { err: err, balance: balance });
			});
		}	
	});

	socket.on('getinfo', function (data) {
		kapitalize.exec('getinfo', function(err, info) {
			if (err) throw (err);
			console.log('Info: '+info);
			socket.emit('getinfo', { err: err, info: info });
		});
	});

	socket.on('getnewaddress', function (data) {
		kapitalize.exec('getnewaddress', data.label, function(err, add, resHeaders) {
			if (err) throw (err);
			console.log('New address for '+data.label+ ' >> ' + add);
			socket.emit('getnewaddress', { err: err, address: add });
		});
	});

	socket.on('listreceivedbyaddress', function (data) {

		console.log('listreceivedbyaddress: '+data);
		kapitalize.exec('listreceivedbyaddress', function(err, result, resHeaders) {
			if (err) throw (err);
			socket.emit('listreceivedbyaddress', { err: err, result: result });
		});
	});

	socket.on('move', function(data) {
		console.log('move: '+data);
		kapitalize.exec('move', data.from, data.to, data.amount, function(err, result, resHeaders) {
			if (err) throw (err);
			socket.emit('move', { err: err, result: result });
		});
	});

	socket.on('sendfrom', function (data){

		console.log('sendfrom: '+data);
		kapitalize.exec('sendfrom', data.from, data.to, data.amount, function(err, txid, resHeaders) {
			if (err) throw (err);
			socket.emit('sendfrom', { err: err, txid: txid });
		});
	});

	socket.on('sendtoaddress', function(data) {

		console.log('sendtoaddress: '+data);
		kapitalize.exec('sendtoaddress', data.to, data.amount, function(err, txid, resHeaders) {
			if (err) throw (err);
			socket.emit('sendtoaddress', { err: err, txid: txid });
		});
	});

});

socket.on('disconnect', function(){
	console.log('Disconnected');
	clearInterval(heart);
});
