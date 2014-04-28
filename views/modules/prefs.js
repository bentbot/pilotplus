
var tradestatus = false;
var chatstatus = false;

function showPrefs() {
  var html = '';
  $(".prefs").html(html);

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

  $(".prefs").html(html);
}



$(function() {
	
	$(".hook").on("click",".tradetimertoggle",function(e) {  
    e.preventDefault();
		if (tradestatus == true) { tradestatus = false; }
		else if (tradestatus == false) { tradestatus = true; }
		showPrefs();
    updateOption('tradetimer',tradestatus);
	});	

	$(".hook").on("click",".chatboxtoggle",function(e) {  
    e.preventDefault();
		if (chatstatus == true) { chatstatus = false; }
		else if (chatstatus == false) { chatstatus = true; }
		showPrefs();
    updateOption('chatbox',chatstatus);
	});

function updateOption(option,intl) {
    $.ajax({
        url: '/userprefs/'+user+'/'+option+'/'+intl,
        cache: false
      }).done(function(html) {
          console.log(html);
          if (html == 'OK') {
            
          } else {
            
          }
      });
}


});