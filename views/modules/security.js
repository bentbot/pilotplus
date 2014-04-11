function showSecurity() {

  var html = '';
  $(".csec").html(html);
    html = html + '<div class="alert alert-success" style="margin-top: 20px;min-height: 146px;">';
    html = html + '<div class="authtitle">';
    html = html + '<img class="authylogo" src="/assets/img/com.authy.authy.png" />'
    html = html + '<a href="https://itunes.apple.com/us/app/authy/id494168017?mt=8&uo=4" class="apple btn btn-blue btn-xs" target="_blank">iPhone</a>';
    html = html + '<a href="https://play.google.com/store/apps/details?id=com.authy.authy" class="google btn btn-success btn-xs" target="_blank">Android</a>';
    html = html + '</div>';
    html = html + '<div class="authh">Dual-Factor Authorization</div>';
    if (!dualfactor)html = html + '<div class="authsub"><hr class="leftline" />Setup<hr class="rightline" /></div>';
    if (dualfactor) html = html + '<div class="authsub"><hr class="leftline" style="width: 70px;" />Enabled<hr class="rightline" style="width: 70px;" /></div>';
    if (!dualfactor) html = html + '<div class="authsign"><div class="input-group"><span class="input-group-addon">Cell +</span><input type="text" class="form-control" id="country" placeholder="1" autocomplete="off"><input type="text" class="form-control" id="phone" placeholder="1234567890" autocomplete="off"><button class="btn btn-success sendcode" style="border-radius: 0px 4px 4px 0px !important;"><i class="fa fa-phone"></i> Next</button></div></div>';
    if (dualfactor) html = html + '<div class="authsign" style="width: 240px"><div class="input-group"><span class="input-group-addon"><i class="fa fa-key securestatus"></i></span><input type="text" id="auth" maxlength="7" placeholder="*******" /><button class="btn btn-blue" id="authbtn" style="border-radius: 0px 4px 4px 0px !important;">Test</button></div></div>'
    if (!dualfactor) html = html + '<div class="csecsecure"><i class="fa fa-mobile"></i></div>';
    if (dualfactor) html = html + '<div class="csecsecure"><i class="fa fa-check"></i></div>';
    //if (dualfactor == false) html = html + '<div class="btcsecure"><i class="fa fa-key"></i><p>All you need is a cell phone.</p></div>';
    html = html + '</div>';

    html = html + '<div class="alert alert-success">';
    if (verified == true) html = html + '<i class="fa fa-envelope fa-lg alertico"></i><strong>'+email+'</strong> has been verified.';
    if (verified == false) html = html + '<i class="fa fa-envelope fa-lg alertico"></i><strong>Verify your email for greater security:</strong> '+email;
    if (verified == false) html = html + '<span style="float:right;"><a href="#" class="btn btn-xs btn-success">Verify Now</a></span>';
    if (verified == true) html = html + '<span style="float:right;opacity: 0.75"><i class="fa fa-check fa-lg"></i></span>';
    html = html + '</div>'

    html = html + '<div class="alert alert-info">';
    html = html + '<i class="fa fa-eye-slash fa-lg alertico"></i><strong>Your password</strong> has never been changed.';
    html = html + '<span style="float:right;"><a href="#" class="btn btn-xs btn-blue">Change Password</a></span>';
    html = html + '</div>'

  $(".csec").html(html);
  animateAuthy();
}

function animateAuthy() {
  $('.authylogo').animate({
    opacity: 1,
    top: "7",
  }, 2000, "easeOutBounce", function() {
    
  });
}
$(document).ready(function()
{


    

$(".hook").on("click",".sendcode",function(e) {    
  sign(e); 
});

$(".hook").on("keyup","#phone",function(e) {    
  if(e.keyCode == 13) {
  sign(e);
  }
});

$(".hook").on("click","#authbtn",function(e) {    
  auth(e);
});
$(".hook").on("keyup","#auth",function(e) { 
  if(e.keyCode == 13) {   
  auth(e);
  }
});

});

function sign(e){ 
    var country = $("#country").val();
    var phone = $("#phone").val();
    //console.log(user);
  if (country && phone.length == 10) {
    var url = '/2f/add/'+user+'/'+country+'/'+phone;
      $.ajax({
        url: url,
        cache: false
      }).done(function(result) {
          console.log(result);
          if (result == 'OK') {
            $(".sendcode").html('<i class="fa fa-cog fa-spin"></i> Next');
            setTimeout(function() {
            $(".authsub").html('<hr class="leftline">Test<hr class="rightline">');
            $(".authsign").css('width', 240).html('<div class="input-group"><span class="input-group-addon"><i class="fa fa-key securestatus"></i></span><input type="text" id="auth" maxlength="7" placeholder="*******" /><button class="btn btn-blue" id="authbtn" style="border-radius: 0px 4px 4px 0px !important;">Test</button></div>');
            $(".csecsecure").html('<i class="fa fa-key"></i>');
            },3700);
          } else {
            $(".sendcode").removeClass('btn-success').addClass('btn-warning').html('<i class="fa fa-times"></i> Error');
          }
      });

  }
}

function auth(e) {
    var auth = $("#auth").val();
    var url = "/2f/auth/"+user+"/"+auth;
    if (auth.length == 7) {
      $.ajax({
        url: url,
        cache: false
      }).done(function( html ) {
          console.log(html);
          if (html.token == 'is valid') {
              $("#authbtn").removeClass('btn-blue').removeClass('btn-warning').addClass('btn-success');
              $(".securestatus").removeClass('fa-lock').removeClass('fa-key').addClass('fa-unlock-alt');
            setTimeout(function() {
              $(".securestatus").removeClass('fa-unlock-alt').removeClass('fa-key').addClass('fa-lock');
              $("#authbtn").removeClass('btn-warning').removeClass('btn-success').addClass('btn-blue');
              $("#auth").val('');
            },20000);
          } else {
            $("#authbtn").removeClass('btn-success').removeClass('btn-blue').addClass('btn-warning');
            $(".securestatus").removeClass('fa-key').addClass('fa-lock');
          }
      });
    } else {
      $("#authbtn").removeClass('btn-success').removeClass('btn-blue').addClass('btn-warning');
      $(".securestatus").removeClass('fa-key').addClass('fa-lock');
    }
}

function showLoginattempts(data) {
  //console.log(data);
  var html = '';
  $(".loginattempts").html(html);
  var index = 0;
  var tdata;
  while (index < data.length) { 
    tdata = data[index];
    //console.log(tdata);
  html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
    var entrytime = new Date(0);
    var entrydate = new Date(0);
    var iodate = new Date(0);
    entrytime.setUTCSeconds(tdata.time);
    entrydate.setUTCSeconds(tdata.time);
    iodate.setUTCSeconds(tdata.time);
    entrytime = entrytime.customFormat( "#hhh#:#mm#:#ss# " );
    entrydate = entrydate.customFormat( "#DD#/#MM#/#YYYY#" );
    iodate = iodate.toISOString();

    //html = html + '<div class="header" data-translate="loginattempts">Last Transactions</div>';
    if (tdata) {
      if (tdata.confirmations > 3) var confirms = '<i class="fa fa-check green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
      if (tdata.confirmations < 3) var confirms = '<i class="fa fa-certificate orange" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
      if (tdata.confirmations == 0) var confirms = '<i class="fa fa-certificate" style="color: #777;margin: 0px 10px 0px 10px;"></i> <span data-translate="justnow">Awaiting Confirmation</span>';
      if (tdata.category == 'receive') html = html + '<div class="received"><i class="fa fa-download green" style="margin-right: 10px;"></i> <span data-translate="received">Received</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.txid+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span>'+confirms+'</div>';
      if (tdata.category == 'sent') html = html + '<div class="sent"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sent</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.txid+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span>'+confirms+'</div>';
      //if (data.category == 'send') html = html + '<div class="sent"><i class="fa fa-upload red"></i> Sent '+data.amount+'</div>';
    } 
  html = html + '</div>';
  index++;
  }
  $(".loginattempts").html(html);
}