
var tradestatus = false;
var chatstatus = false;

function showReferrals() {
  var html = '';
  $(".referrals").html(html);

    if (tradestatus == true) html = html + '<div class="alert alert-success">';
    if (tradestatus == false) html = html + '<div class="alert alert-info">';
    if (tradestatus == true) html = html + '<a href="#" style="margin-right: 10px;"><i class="fa fa-check-circle-o fa-lg tradetimertoggle"></i></a> <strong>Trade Timer</strong> Visually countdown the number of seconds until the next trade.';
    if (tradestatus == false) html = html + '<a href="#" style="margin-right: 10px;"><i class="fa fa-circle-o fa-lg tradetimertoggle"></i></a> <strong>Trade Timer</strong> Visually countdown the number of seconds until the next trade.';
    html = html + '</div>';

    if (chatstatus == true) html = html + '<div class="alert alert-success">';
    if (chatstatus == false) html = html + '<div class="alert alert-info">';
    if (chatstatus == true) html = html + '<a href="#" style="margin-right: 10px;"><i class="fa fa-check-circle-o fa-lg chatboxtoggle"></i></a> <strong>Chat Box</strong> Show the chat box on the trade page.';
    if (chatstatus == false) html = html + '<a href="#" style="margin-right: 10px;"><i class="fa fa-circle-o fa-lg chatboxtoggle"></i></a> <strong>Chat Box</strong> Show the chat box on the trade page.';
    html = html + '</div>';

  $(".referrals").html(html);
}


$(function() {
	
	$(".hook").on("click",".tradetimertoggle",function(e) {  
    e.preventDefault();
		if (tradestatus == true) { tradestatus = false; }
		else if (tradestatus == false) { tradestatus = true; }
		showReferrals();
    updateOption('tradetimer',tradestatus);
	});	


function updateOption(option,intl) {
    $.ajax({
        url: '/userReferrals/'+user+'/'+option+'/'+intl,
        cache: false
      }).done(function(html) {
          console.log(html);
          if (html == 'OK') {
            
          } else {
            
          }
      });
}


});