var remoteinitstate = true;
function showRemoteBals(data){
    //data.reverse();
    $('.remote').html('');
      var reviewTx = '';
      var remotehtml = '<div class="userblock"><div class="header remoteheader">Blockchain <span style="float:right;" class="btn btn-xs btn-warning totalremote">'+entry.bal+'</span></div>';
    if (remoteinitstate == true) {
    remotehtml = remotehtml + '<div class="row-fluid"><div class="span12"><div><table class="table" id="remotebals">';
    } else {
    remotehtml = remotehtml + '<div class="row-fluid"><div class="span12"><div><table class="table hide" id="remotebals">';
    }
    remotehtml = remotehtml + '<tbody>';
    var index;
    var total = 0;
    for (index = 0; index < data.length; ++index) {
      entry = data[index];
      if (entry.amount > 0) {
        remotehtml = remotehtml + '<tr class="remotebal" id="'+entry._id+'">';
                    if (entry.direction == 'in') remotehtml = remotehtml + '<td><i class="fa fa-download green" style="margin-right: 10px;"></i> '+entry.username+'</td>';
                    if (entry.direction == 'out') remotehtml = remotehtml + '<td><i class="fa fa-upload red" style="margin-right: 10px;"></i> '+entry.username+'</td>';
                    if (entry.status == 'processed') remotehtml = remotehtml + '<td><i class="fa fa-check-circle-o" style="margin-right: 10px;"></i> Processed</td>';
                    if (entry.status == 'processing') remotehtml = remotehtml + '<td><i class="fa fa-cog fa-spin" style="margin-right: 10px;"></i> Processing</td>';
                    if (entry.status == 'blocked') remotehtml = remotehtml + '<td><i class="fa fa-times-circle-o" style="margin-right: 10px;"></i> <span class="red">Blocked</span></td>';
                    if (entry.status == 'review') remotehtml = remotehtml + '<td><i class="fa fa-circle-o" style="margin-right: 10px;"></i> <span class="orange">Pending Review</span></td>';
                    if (entry.status == 'send') remotehtml = remotehtml + '<td><i class="fa fa-refresh fa-spin" style="margin-right: 10px;"></i> Sending...</td>';
                    if (entry.confirmations >= 3 && entry.confirmations < 100) remotehtml = remotehtml +'<td><i class="fa fa-check green" style="margin: 0px 10px 0px 10px;"></i> '+entry.confirmations+' </span></td>';
                    if (entry.confirmations > 100) remotehtml = remotehtml +'<td><i class="glyphicon glyphicon-tower green" style="margin: 0px 10px 0px 10px;"></i> '+entry.confirmations+' </span></td>';
                    if (entry.confirmations < 3 && entry.confirmations > 0) remotehtml = remotehtml +'<td><i class="fa fa-certificate orange" style="margin: 0px 10px 0px 10px;"></i> '+entry.confirmations+' </span></td>';
                    if (entry.confirmations == 0) remotehtml = remotehtml +'<td><i class="fa fa-certificate" style="color: #777;margin: 0px 10px 0px 10px;"></i> <span data-translate="justnow">New</span></td>';
                    remotehtml = remotehtml +'<td><i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+entry.amount+'</td>';
                    if (entry.status == 'review') remotehtml = remotehtml + '<td class="sendcontainer"><button class="btn btn-xs btn-success sendpayment" id="'+entry.to+'">Send</button></td>';
                    if (entry.status == 'review') remotehtml = remotehtml + '<td><button class="btn btn-xs btn-danger blockpayment" id="'+entry.to+'">Block</button></td>';

                    '<td>'+entry.username+'</td>';
                    //'<td><a target="_black" href="https://www.biteasy.com/blockchain/addresses/'+entry.address+'">'+entry.address+'</a</td>';
                    //'<td><time class="timeago" datetime="'+iodate+'">'+entrytime+'</time></td>'+
                  remotehtml = remotehtml + '</tr>';
                  total = total + entry.amount;
                  if (entry.status == 'review') reviewTx = '<div class="alert alert-warning" style="margin-top: 5px;"><div class="review"><i class="fa fa-upload orange" style="margin-right: 10px;"></i> <strong>Authorize Outputs: </strong> Users have requested funds. You must authorize these outputs. <span style="float:right"><a href="#" id="adminpage" class="btn btn-xs btn-blue">Admin Panel</a></span></div></div>';

      } 
    }

    remotehtml = remotehtml + '</div></div></div></tbody></table></div>';
    $('.remote').html(remotehtml);
    $('.notif').html(reviewTx);
    //
}




$(function() {

$(".hook").on("click",".remoteheader",function(e) {
  if (remoteinitstate == true) {
    remoteinitstate = false;
    $(this+' #remotebals').addClass('hide');
  } else {
    remoteinitstate = true;
    $(this+ '#remotebals').removeClass('hide');
  }
});

$(".hook").on("click",".sendpayment",function(e) {

});
$(".hook").on("click",".blockpayment",function(e) {
  $(this).hide();
  $('.sendcontainer').remove();
  $('.blockcontainer').remove();
});

$(".hook").on("click",".sendpayment",function(e) {
  var to = $(this).attr('id');
    bootbox.prompt("Master Password", function(result) {                
      if (result == null) {                                             
        console.log('box null');     
      } else {
        var pwd = result;
        var url = '/mastersend/'+pwd+'/'+to;
        console.log('attempting to send payment to '+to);
        $.ajax({
          type: "GET",
          url: url
        }).done(function( msg ) {
          console.log('sending payment '+msg);
              if (msg == 'OK') {
                $(this).hide();
                $('.blockpayment').hide();
                $('.sendcontainer').remove();
                $('.blockcontainer').remove();
              } else if (msg == 'PASSWD') {
                bootbox.alert('Password Incorrect');
              } else {
                bootbox.alert(msg);
              }
          });                          
        }
      });
  });


});
