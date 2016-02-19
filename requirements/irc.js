// IRC Listener
var messages = new Array();

var girclient = new irc.Client(keys.irc.connection, 'root', {
  channels: [keys.irc.channel]
});
girclient.addListener('message'+keys.irc.channel, function (from, message) {
  
  messages.push({from:from, message:message});
  io.sockets.emit('messages', messages)
  
});
girclient.addListener('error', function(message) {
    console.log('error: ', message);
});
// girclient.say(keys.irc.channel, 'data.message');
// Allow console to talk
var stdin = process.stdin;
//stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );
var cons = '';
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }
  cons = cons + key;
  if ( key === '\u000D' ) {
    if (cons.charAt(0) == '/') {
      console.log(cons);
    } else {
      girclient.say(keys.irc.channel, cons);
      console.log('root:'+cons);
      cons = '';
    }
  }

});