var globalchats = new Array();

function showChat() {
  $('.chat').html('');
  var chathtml = '<div class="userblock"><div class="header" data-translate="noactivetrades">Chat</div>';
  chathtml = chathtml + '<div class="row-fluid"><div class="span12 "><div class="chatcontainer"><table class="table chattable" id="chat">';
  chathtml = chathtml + '<tbody class="chatmessages">';
  if (globalchats){
    var i = 0;
    while (i < globalchats.length) {
        var from = globalchats[i].from;
        var message = globalchats[i].message;
        if (message.indexOf(user) > -1){
          ircBloop.play();         
        chathtml = chathtml + '<td style="font-weight: bold;"><span>'+from+':</span>'+
        ' '+message+'</td>'+
        '</tr>';
        } else {
        chathtml = chathtml + '<td><span style="font-weight: bold;">'+from+':</span>'+
        ' '+message+'</td>'+
        '</tr>';
        }
        i++;
    }
  }
          chathtml = chathtml + '</tbody>'+
          '</table></div>'+
          '<div class="talk"><input type="text" class="say" placeholder="Say..." /></div>'+
          '</div></div></div>';
     $('.chat').html(chathtml);
}

function newChat(from,message) { 
        var newchathtml = newchathtml + '<tr class="chatmessage">';
        globalchats.push({from:from, message: message});
        //console.log(globalchats);
        if (message.indexOf(user) > -1){
        ircBloop.play();         
        newchathtml = newchathtml + '<td style="font-weight: bold;"><span>'+from+':</span>'+
        ' '+message+'</td>'+
        '</tr>';
        } else {
        newchathtml = newchathtml + '<td><span style="font-weight: bold;">'+from+':</span>'+
        ' '+message+'</td>'+
        '</tr>';
        }
        $('.chatmessages').append(newchathtml);
        $('.chatcontainer').scrollTop($('.chatcontainer')[0].scrollHeight);

  }

$(function() {
$(".hook").on("keyup",".say",function(e) {
    if (e.keyCode == 13){
      var msg = $('.say').val();
      chat(msg);
      newChat(user, msg);
      $('.say').val('');
    }
  });
});