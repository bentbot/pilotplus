var txinitstate = true;
function showRemoteBals(data){
    $('.wallettx').html('');
      var remotehtml = '<div class="userblock"><div class="header remoteheader" data-translate="transactions">Transations</div>';
    if (txinitstate == true) {
    remotehtml = remotehtml + '<div class="row-fluid"><div class="span12"><div><table class="table" id="transactions">';
    } else {
    remotehtml = remotehtml + '<div class="row-fluid"><div class="span12"><div><table class="table hide" id="transactions">';
    }
    remotehtml = remotehtml + '<tbody>';
    var index;
    for (index = 0; index < data.length; ++index) {
      entry = data[index];
      var amount = (+entry.amount*1000);

        remotehtml = remotehtml + '<tr class="remotebal" id="'+entry.address+'">' +
                    '<td>'+entry.account+'</td>'+
                    '<td><a target="_black" href="https://blockchain.info/qr?data='+entry.address+'">'+entry.address+'</a</td>';
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
  if (txinitstate == true) {
    txinitstate = false;
    $('#transactions').addClass('hide');
  } else {
    txinitstate = true;
    $('#transactions').removeClass('hide');
  }
});

});