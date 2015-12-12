
var refs = false;
var chatstatus = false;

function showReferrals() {
  var html = '';
  $(".referrals").html(html);

    if (refs == true) html = html + '<div class="alert refs alert-success"><strong>Make even more money:</strong> Refer folks to our site using the link below and reap 5% of all their winnings.</div>';
    if (refs == false) html = html + '<div class="alert refs alert-info">';
    if (refs == true) html = html + '<div class="refstitle"></div>';
    if (refs == false) html = html + '<div class="refstitle"><i class="fa fa-users"></i></div>';
    html = html + '<div class="referral-code" data-translate="yourreferralcode">Your Referral Link:</div>';
    html = html + '<div class="refcode" id="refcode">https://'+user+'.'+document.domain+'</div>';
    html = html + '<div class="refcount"><span class="users"><i class="fa fa-user"></i> 0</span><span class="cash">$0</span></div>';
    html = html + '</div>';

    // if (refs == false){
    //   html = html + '<div class="alert refs alert-warning">';
    //   html = html + '<strong>You have not refered any users.</strong>';
    //   html = html + '</div>';
    // }


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


  $(".hook").on("click","#refcode",function(e) {
    select_all(this);
    var add = $(this).html();
    clientText.setText( add );
  });

var lastdata;
function updateRefs(data) {
  data.reverse();
  var html = '';
  $(".refslist").html(html);
  var index = 0;
  var tdata;
  while (index < data.length) { 
    tdata = data[index];
    //console.log(tdata);
    var s = tdata.status;
    var d = tdata.direction;
    var entrytime = new Date(0);
    var entrydate = new Date(0);
    var iodate = new Date(0);
    entrytime.setUTCSeconds(tdata.time);
    entrydate.setUTCSeconds(tdata.time);
    iodate.setUTCSeconds(tdata.time);
    entrytime = entrytime.customFormat( "#hhh#:#mm#:#ss# " );
    entrydate = entrydate.customFormat( "#DD#/#MM#/#YYYY#" );
    iodate = iodate.toISOString();

        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
        html = html + '<div class="areferral"><i class="fa fa-user" style="margin-right: 10px;"></i> <span data-translate="referred">'+
        tdata.name.toString()+
        '</span> <span style="float:right;"><strong>m</strong><i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+
        tdata.amount.toString()+
        '</span></div>';
        html = html + '</div>';
    }
  $(".refslist").html(html);
}
});