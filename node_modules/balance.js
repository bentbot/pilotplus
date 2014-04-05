function getbalance(username) {
	return rclient.get(username);
}
function sendtobank(amount, username) {
	var bank = rclient.get('myaccount');
	var balance = rclient.get(username);
	balance = (+balance-amount);
	bank = (+bank+amount);
	rclient.set(username, balance);
	rclient.set('myaccount', bank);
	return rclient.get(username);
}
function sendfrombank(amount, username) {
	var bank = rclient.get('myaccount');
	var balance = rclient.get(username);
	balance = (+balance+amount);
	bank = (+bank-amount);
	rclient.set(username, balance);
	rclient.set('myaccount', bank);
	return rclient.get(username);
}

