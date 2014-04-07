function showWallet(add, bal) {

  if (add) {
  var html = '';
  $(".wallet").html(html);
    html = html + '<div class="alert alert-info" style="margin-top: 20px;min-height: 133px;">';
    html = html + '<div class="btcqr"></div>';
    html = html + '<div class="btcwallet" data-translate="yourbtcaddress">Your Bitcoin Address:</div>';
    html = html + '<div class="btcaddress id="btcaddress" data-clipboard-text='+add+'>'+add+'</div>';
    if (bal > 0) html = html + '<div class="btcbal"><i class="fa fa-bitcoin"></i> <strong>'+(bal/1000)+'</strong></div>';
    if (bal == 0) html = html + '<div class="btcbal"><i class="fa fa-bitcoin"></i> <strong>'+bal+'</strong></div>';
    if (dualfactor == true) html = html + '<div class="btcsecure"><i class="fa fa-lock"></i><span data-translate="dualfactorenabled"><strong>Dual-Factor</strong> protection Enabled</span></div>';
    if (dualfactor == false) html = html + '<div class="btcsecure"><i class="fa fa-key"></i><a class="btn btn-xs btn-blue" href="#" data-translate="enabledualfactor">Enable Dual-Factor</a></div>';
    html = html + '</div>';
    if (bal == 0) html = html + '<div class="alert alert-warning" style="margin-top: 20px;text-align: center;"><strong data-translate="justaddbitcoin"><i class="fa fa-flag" style="margin: 0px 5px 0px 5px;"></i> Add some Bitcoin to your account to get started.</stong></div>';

  $(".wallet").html(html);
  $(".btcqr").qrcode({
    render: 'canvas',
    size: 100,
    radius: 100,
    fill: '#31708f',
    text: add
  });

  } else {
    $('.notif').html('<div class="alert alert-danger"><strong data-translate="nobtcwalletfound">No Bitcoin wallet found.</strong></div>');
  }
}

function showWalletSend() {

  var html = '';
  $(".walletsend").html(html);
    html = html + '<div class="alert alert-info" style="margin-top: 20px;min-height: 133px;">';
    html = html + '<div class="sendtitle"><i class="fa fa-upload"></i></div>';
    html = html + '<div class="btcaddress liveaddress"></div>';
    html = html + '<div class="btcsend"><div class="input-group"><span class="input-group-addon"><i class="fa fa-btc"></i></span><input type="text" class="form-control amount" placeholder="0.000000"><span class="input-group-addon" style="border-raidus: 0px;"><i class="fa fa-share"></i></span><input type="text" class="form-control address" placeholder="Bitcoin Address"></div></div>';
    html = html + '<div class="btcbal"><i class="fa fa-bitcoin"></i> <strong class="livebalance"></strong></div>';
    if (dualfactor == true) html = html + '<div class="btcsecure"><i class="fa fa-lock"></i><span data-translate="dualfactorenabled"><strong>Dual-Factor</strong> protection Enabled</span></div>';
    if (dualfactor == false) html = html + '<div class="btcsecure"><i class="fa fa-key"></i><a class="btn btn-xs btn-blue" href="#" data-translate="enabledualfactor">Enable Dual-Factor</a></div>';
    html = html + '</div>';

  $(".walletsend").html(html);

}

function walletSendUpdate(add, bal) {
  $('.liveaddress').html(add);
  $('.btcbal').html('<i class="fa fa-bitcoin"></i> <strong class="livebalance">'+bal/1000+'</strong>')
}


function showTx(data) {
  //console.log(data);
  var html = '';
  $(".wallettx").html(html);
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

    //html = html + '<div class="header" data-translate="wallettx">Last Transactions</div>';
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