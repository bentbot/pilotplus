var globalchats = new Array();

function showChat() {
  $('.chat').html('');
  var chathtml = '<div class="chatblock"><div class="header" data-translate="noactivetrades">Chat</div>';
  chathtml = chathtml + '<div class="row-fluid"><div class="span12 ">';
  if (globalchats.length > 0) { 
    chathtml = chathtml + '<div class="chatcontainer">'; 
  } else {
    chathtml = chathtml + '<div class="chatcontainer">'; 
  }
  chathtml = chathtml + '<table class="table chattable" id="chat">';
  chathtml = chathtml + '<tbody class="chatmessages">';
  chathtml = chathtml + '</tbody>'+
    '</table></div>'+
    '<div class="chaterror"></div>'+
    '<div class="talk"><input type="text" class="say" placeholder="Say..." /></div>'+
    '</div></div></div>';
  $('.chat').html(chathtml);
  setTimeout( function() {
    if (messages) {
      $.each(messages, function (i, message) {
        newChat(message.from, false, message.message, false)
      });
    }
  }, 500);
}

function newChat(from,to,message,errors) {
  var chatclasses = '';
  var chathtml = '';
  var chatcolour = 'inherit';
  var err = false;
  var lowercasemessage = message.toLowerCase();
  if (lowercasemessage.indexOf(user) > -1 || to == user){
    ircBloop.play();
    chatclasses = chatclasses + 'bold';
  }

  message = XBBCODE.process({
    text: message,
    removeMisalignedTags: false,
    addInLineBreaks: false
  });
  
  if (message.error) err = 'BBCode tag opening/closing error.';
  
  message = emoji.replace_colons(message.html);
  if ((message.match(/:/g) || []).length > 1) err = 'Invalid emoji: '+message+'<span style="float:right;font-style:italic;"><a href="http://emojipedia.org/" target="_blank">:sweat_smile: <span class="emoji emoji-sizer" style="background-image:url(/emoji-data/img-apple-64/1f605.png)" title="sweat_smile"></span></a></span></span>';

  message = emoji.replace_emoticons(message);

  if (err && errors) {
    $('.chaterror').html(err).addClass('show');
    setTimeout( function() { $('.chaterror').removeClass('show'); }, 3000);
  }  else {
    chathtml = chathtml + '<tr class="chatmessage">'+
      '<td>'+
        '<span class="from">'+from+':</span> ' +
        '<span class="'+chatclasses+'" style="color:'+chatcolour+'">'+message+'</span>'+
      '</td>'+
    '</tr>';
    $('.chatmessages').append(chathtml).animate({ scrollTop: $('.chatmessages').height() }, "slow");;
    $('.say').val('');
  }
}

$(function() {
  var said = new Array();
  var i = 0;
  $(".hook").on("keyup",".say",function(e) {
    if (e.keyCode == 13){
      i = 0;
      var msg = $('.say').val();
      said.unshift(msg);

       var message = XBBCODE.process({
          text: msg,
          removeMisalignedTags: false,
          addInLineBreaks: false
        });
        
        if (message.error) var err = 'BBCode tag opening/closing error.';
    
        message = emoji.replace_colons(message.html);
        if ((message.match(/:/g) || []).length > 1) var err = 'Invalid emoji: '+message+'<span style="float:right;font-style:italic;"><a href="http://emojipedia.org/" target="_blank">:sweat_smile: <span class="emoji emoji-sizer" style="background-image:url(/emoji-data/img-apple-64/1f605.png)" title="sweat_smile"></span></a></span></span>';

        message = emoji.replace_emoticons(message);

        if (err) {
          $('.chaterror').html(err).addClass('show');
          setTimeout( function() { $('.chaterror').removeClass('show'); }, 3000);
        }  else {
            chat(msg);
        }
    } else if (e.keyCode == 38){
      $('.say').val(said[i]);
      i++;
    } else if (e.keyCode == 40){
      $('.say').val(said[i]);
      i--;
    }
  });
});