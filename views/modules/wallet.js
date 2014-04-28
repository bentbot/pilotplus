function showWallet() {

  var html = '';
  $(".wallet").html(html);
    html = html + '<div class="alert alert-info" style="margin-top: 20px;min-height: 133px;">';
    html = html + '<div class="btcqr"></div>';
    html = html + '<div class="btcwallet" data-translate="yourbtcaddress">Your Bitcoin Address:</div>';
    html = html + '<div class="btcaddress liveaddress" id="btcaddress"></div>';
    html = html + '<div class="btcbal"></div>';
    if (dualfactor == true) html = html + '<div class="btcsecure"><i class="fa fa-lock"></i><span data-translate="dualfactorenabled">Dual-Factor Protected</div>';
    if (dualfactor == false) html = html + '<div class="btcsecure"><i class="fa fa-key"></i><a class="btn btn-xs btn-blue showsecuirtypage" href="#" data-translate="enabledualfactor">Enable Dual-Factor</a></div>';
    html = html + '</div>';
    html = html + '<div class="alert alert-warning nomoney" style="margin-top: 20px;text-align: center;display: none;"><strong data-translate="justaddbitcoin"><i class="fa fa-flag" style="margin: 0px 5px 0px 5px;"></i> Add some Bitcoin to your account to get started.</stong></div>';

  $(".wallet").html(html);
  $('.notif').html('<div class="alert alert-danger walleterror" style="display: none;"><strong data-translate="nobtcwalletfound">No Bitcoin wallet found.</strong></div>');
}
function walletUpdate(add, bal) {
  //bal = bal.toFixed(8);
  if (!add) $(".walleterror").show();
  $('.liveaddress').html(add);
  $('.btcbal').html('<strong class="georgia">m</strong><i class="fa fa-bitcoin"></i> <strong class="livebalance">'+bal+'</strong>')

  $(".btcqr").html('');
  $(".btcqr").qrcode({
    render: 'canvas',
    size: 100,
    radius: 100,
    fill: '#31708f',
    text: add
  });
}

function showWalletSend() {

  var html = '';
  $(".walletsend").html(html);
    html = html + '<div class="alert alert-info" style="margin-top: 20px;min-height: 146px;">';
    html = html + '<div class="sendtitle"><i class="fa fa-upload"></i></div>';
    html = html + '<div class="btcaddress liveaddress"></div>';
    if (dualfactor == false) html = html + '<div class="btcsend"><div class="input-group"><span class="input-group-addon">m<i class="fa fa-btc"></i></span><input type="text" class="form-control amount" placeholder="0.000000"><span class="input-group-addon" style="border-raidus: 0px;"><i class="fa fa-share"></i></span><input type="text" style="width: 300px;" class="form-control address" placeholder="Bitcoin Address"><button class="btn btn-blue" id="send">Send</button></div></div>';
    if (dualfactor == true) html = html + '<div class="btcsend" style="width: 697px;"><div class="input-group"><span class="input-group-addon">m<i class="fa fa-btc"></i></span><input type="text" class="form-control amount" placeholder="0.000000"><span class="input-group-addon" style="border-raidus: 0px;"><i class="fa fa-share"></i></span><input type="text" class="form-control address" placeholder="Bitcoin Address"><span class="input-group-addon"><i class="fa fa-key securestatus"></i></span><input type="text" id="auth" maxlength="7" placeholder="*******" /><button class="btn btn-blue" id="send">Send</button></div></div>';
    html = html + '<div class="btcbal"><i class="fa fa-bitcoin"></i> <strong class="livebalance"></strong></div>';
    //if (dualfactor == true) html = html + '<div class="btcsendsecure"><i class="fa fa-key"></i><span data-translate="dualfactorsend"><input type="text" id="auth" maxlength="7" placeholder="*******" /></div>';
    //if (dualfactor == false) html = html + '<div class="btcsecure"><i class="fa fa-key"></i><a class="btn btn-xs btn-blue showsecuirtypage" href="#" data-translate="enabledualfactor">Enable Dual-Factor</a></div>';
    html = html + '</div>';

  $(".walletsend").html(html);

}
function walletSendUpdate(add, bal) {
  //bal = bal.toFixed(8);
  $('.liveaddress').html(add);
  $('.btcbal').html('<strong class="georgia">m</strong><i class="fa fa-bitcoin"></i> <strong class="livebalance">'+bal+'</strong>')
}

var lastdata;
function showTx(data) {
  if (data) { 
    $(".nomoney").slideUp();
  } else {
    $(".nomoney").slideDown();
  }
  //console.log(data);
  data.reverse();
  var html = '';
  $(".wallettx").html(html);
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

      if (s=='new'||s=='confirmed' && d=='in') {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
          if (tdata.confirmations >= 3 && tdata.confirmations < 100) var confirms = '<i class="fa fa-check green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations > 100) var confirms = '<i class="glyphicon glyphicon-tower green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations == 1) { var confirms = '<i class="fa fa-certificate green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>'; bottlepop(tdata.tx); } 
          //if (tdata.confirmations == 1) { var confirms = '<i class="fa fa-certificate orange" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations (one more)</span>';  }
          if (tdata.confirmations == 0) var confirms = '<i class="fa fa-certificate" style="color: #777;margin: 0px 10px 0px 10px;"></i> <span data-translate="justnow">Awaiting Confirmation</span>';
          html = html + '<div class="received"><i class="fa fa-download green" style="margin-right: 10px;"></i> <span data-translate="received">Received</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.tx+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span>'+confirms+'</div>';
          lastdata = tdata.tx;
          //if (tdata.category == 'sent') html = html + '<div class="sent"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sent</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.txid+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span>'+confirms+'</div>';
          //if (data.category == 'send') html = html + '<div class="sent"><i class="fa fa-upload red"></i> Sent '+data.amount+'</div>';

      html = html + '</div>';
      index++;
    } else if (d=='out') {
      if (s=='review') {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
        html = html + '<div class="sent"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sending</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <i class="fa fa-certificate" style="color: #777;margin: 0px 10px 0px 10px;"></i> Payment Review (could take a few hours) <span style="float: right" class="timeago">'+entrydate+' '+entrytime+'</span></div>';
        html = html + '</div>';
        index++;
      } else if (s=='send') {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
        html = html + '<div class="sent"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sending</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <i class="fa fa-refresh fa-spin" style="color: #777;margin: 0px 10px 0px 10px;"></i> Processing <span style="float: right" class="timeago">'+entrydate+' '+entrytime+'</span></div>';
        html = html + '</div>';
        index++;
      } else if (s=='sent') {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
        html = html + '<div class="sent"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sent</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <i class="fa fa-certificate orange" style="margin: 0px 10px 0px 10px;"></i> Sent <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.tx+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span></div>';
        html = html + '</div>';
        index++;
      } else {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
          if (tdata.confirmations >= 3 && tdata.confirmations < 100) var confirms = '<i class="fa fa-check green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations > 100) var confirms = '<i class="glyphicon glyphicon-tower green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations < 3) var confirms = '<i class="fa fa-certificate orange" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations == 0) var confirms = '<i class="fa fa-certificate" style="color: #777;margin: 0px 10px 0px 10px;"></i> <span data-translate="justnow">Awaiting Confirmation</span>';
          if (tdata.status == 'processing') var confirms = '<i class="fa fa-cog fa-spin" style="color: #777;margin: 0px 10px 0px 10px;"></i> <span data-translate="justnow">Processing...</span>';
          html = html + '<div class="received"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sent</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.tx+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span>'+confirms+'</div>';
          lastdata = tdata.tx;
      html = html + '</div>';
      index++;
      }

    }
  }
  $(".wallettx").html(html);
}

$(document).ready(function()
{
    

var clientText = new ZeroClipboard( $(".btcaddress"), {
    moviePath: "https://vbit.io/assets/img/ZeroClipboard.swf",
    debug: false
} );
$(".hook").on("click",".btcaddress",function(e) {    
  select_all(this);
  var add = $(this).html();
  clientText.setText( add );
});
$(".hook").on("click",".showsecuirtypage",function(e) {    
  page('security');
  showAccount();
});
$(".hook").on("click","#send",function(e) {    
    var auth = $("#auth").val();
    var amount = $(".amount").val();
    var address = $(".address").val();
    var url = "/send/"+user+"/"+address+"/"+amount+"/"+auth;
    if (!amount) {
      $(".securestatus").removeClass('fa-key fa-unlock-alt').addClass('fa-lock');
      $("#send").removeClass('btn-blue').addClass('btn-warning').html('Value');
      setTimeout(function() {
      $("#send").addClass('btn-blue').removeClass('btn-warning').html('Send');
      },5000);
    }if (!address) {
      $(".securestatus").removeClass('fa-key fa-unlock-alt').addClass('fa-lock');
      $("#send").removeClass('btn-blue').addClass('btn-warning').html('To');
      setTimeout(function() {
      $("#send").addClass('btn-blue').removeClass('btn-warning').html('Send');
      },5000);
    }
    if (auth.length == 7) {
      $.ajax({
        url: url,
        cache: false
      }).done(function( html ) {
          console.log(html);
          if (html == 'OK') {
            $(".securestatus").removeClass('fa-key red green orange').addClass('fa-unlock-alt');
            $("#send").removeClass('btn-blue btn-warning').addClass('btn-success').html('Sent');
            console.log('Withdrawl of '+amount+' requested from '+user+' to '+address+' with auth '+auth)
            setTimeout(function() {
            $(".securestatus").removeClass('fa-unlock-alt red green orange').addClass('fa-lock');
            $("#send").removeClass('btn-success btn-warning').addClass('btn-blue').html('Send');
            $("#auth").val('');
            $(".amount").val('');
            $(".address").val('');
            },7000);
          } else {
            $(".securestatus").removeClass('fa-key fa-unlock-alt').addClass('red fa-lock');
            $("#send").removeClass('btn-blue').addClass('btn-danger').html('Token');
            setTimeout(function() {
            $("#send").addClass('btn-blue').removeClass('btn-danger').html('Send');
            },5000);
          }
      });
    } else {
      $(".securestatus").removeClass('fa-key fa-unlock-alt').addClass('fa-lock');
      $("#send").removeClass('btn-blue btn-warning').addClass('btn-info').html('Send');
      setTimeout(function() {
      $("#send").addClass('btn-blue').removeClass('btn-info').html('Send');
      },730);
    }
});

});

function select_all(el) {
        if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.select();
        }
    }