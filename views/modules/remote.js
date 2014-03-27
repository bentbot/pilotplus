var remoteinitstate = true;
function showRemoteBals(data){
    $('.remote').html('');
      var remotehtml = '<div class="userblock"><div class="header remoteheader">Blockchain</div>';    
    if (remoteinitstate == true) {
    remotehtml = remotehtml + '<div class="row-fluid"><div class="span12"><div><table class="table" id="remotebals">';
    } else {
    remotehtml = remotehtml + '<div class="row-fluid"><div class="span12"><div><table class="table hide" id="remotebals">';
    }
    remotehtml = remotehtml + '<tbody>';
    var index;
    for (index = 0; index < data.length; ++index) {
      entry = data[index];
      var amount = (+entry.amount*1000);

        remotehtml = remotehtml + '<tr class="remotebal" id="'+entry.address+'">' +
                    '<td>'+entry.account+'</td>'+
                    '<td>'+entry.address+'</td>';
                    //'<td><time class="timeago" datetime="'+iodate+'">'+entrytime+'</time></td>'+
                    
                    if (entry.confirmations < 1) { 
                      remotehtml = remotehtml + '<td class="orange">'+amount+'</td>';
                    } else {
                      remotehtml = remotehtml + '<td>'+amount+'</td>';
                    }
                  remotehtml = remotehtml + '</tr>';
  }
    remotehtml = remotehtml + '</div></div></div></tbody></table></div>';
    $('.remote').html(remotehtml);
}$(function() { 

$(".hook").on("click",".remoteheader",function(e) {
  if (remoteinitstate == true) {
    remoteinitstate = false;
    $('#remotebals').addClass('hide');
  } else {
    remoteinitstate = true;
    $('#remotebals').removeClass('hide');
  }
});

});