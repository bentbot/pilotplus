var localinitstate = true;
function showLocalBals(data){
    $('.local').html('');
      var localhtml = '<div class="userblock"><div class="header localheader">Local</div>';
    if (localinitstate == true) {
    localhtml = localhtml + '<div class="row-fluid"><div class="span12"><div><table class="table" id="localbals">';
    } else {
    localhtml = localhtml + '<div class="row-fluid"><div class="span12"><div><table class="table hide" id="localbals">';
    }
    localhtml = localhtml + '<tbody>';
    var index;
    for (index = 0; index < data.length; ++index) {
      entry = data[index];
        localhtml = localhtml + '<tr class="localbal">' +
                    '<td>'+entry.account+'</td>'+

                    '<td>'+entry.address+'</td>'+
                    //'<td><time class="timeago" datetime="'+iodate+'">'+entrytime+'</time></td>'+
                    '<td>'+entry.bal+'</td>'+
                  '</tr>';
  }
    localhtml = localhtml + '</div></div></div></tbody></table></div>';
    $('.local').html(localhtml);
}
$(function() { 

$(".hook").on("click",".localheader",function(e) {
  if (localinitstate == true) {
    localinitstate = false;
    $('#localbals').addClass('hide');
  } else {
    localinitstate = true;
    $('#localbals').removeClass('hide');
  }
});

});