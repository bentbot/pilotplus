function showWalletSend(data) {

  if (data) {

    var html = '';

  if (data.currencies) {
      html = html + '<div class="walletcurrencies btn-group" role="group" aria-label="...">';
      var currencies = data.currencies;

      $.each(currencies, function(i, currency) {
        var classes = '';
        var width = (100/currencies.length);
        if (data.currency == currency.symbol) {
          classes = 'btn-blue active';
        } else {
          classes = 'btn-dark';
        }
        html = html + '<button type="button" data-currency="'+currency.symbol+'" style="width:'+width+'%;" class="currency btn '+classes+'">';
        html = html + currency.name;
        html = html + '</button>';
      });
      
      html = html + '</div>';
    }

  $(".wallet").html(html); 

    switch (data.currency) { 
      case 'BTC':

      html = html + '<div class="alert alert-info btcwalletbox" style="margin-top: 20px;min-height: 146px;">';
      html = html + '<div class="btcqr"></div>';
      html = html + '<div class="btcwallet" data-translate="yourbtcaddress">Your Bitcoin Address:</div>';
      html = html + '<div class="btcaddress liveaddress" id="btcaddress">'+data.address+'</div>';
      html = html + '<div class="btcbal"><strong>m<i class="fa fa-bitcoin"></i> '+data.balance+'</strong></div>';
      if (dualfactor == true) html = html + '<div class="btcsecure"><i class="fa fa-lock"></i><span data-translate="dualfactorenabled">Dual-Factor Protected</div>';
      if (dualfactor == false) html = html + '<div class="btcsecure"><i class="fa fa-key"></i><a class="btn btn-xs btn-blue showsecuirtypage" href="#" data-translate="enabledualfactor">Enable Dual-Factor</a></div>';
      html = html + '</div>';
      html = html + '<div class="alert alert-warning nomoney" style="margin-top: 20px;text-align: center;display: none;"><strong data-translate="justaddbitcoin"><i class="fa fa-flag" style="margin: 0px 5px 0px 5px;"></i> Add some Bitcoin to your account to get started.</stong></div>';

      $(".wallet").html(html);
      if (!data.address) $('.notif').html('<div class="alert alert-danger walleterror" style="display: none;"><strong data-translate="nobtcwalletfound">No Bitcoin wallet found.</strong> Please check back later.</div>');
      if (!data.address) $(".walleterror").show();
      $('.liveaddress').html(data.address);
      $('.btcbal').html('<strong class="georgia">m</strong><i class="fa fa-bitcoin"></i> <strong class="livebalance">'+data.balance+'</strong>')

      break;
      default:

      html = html + '<div class="no cards">'+
      //'<div class="card green"><div class="stripe"></div><div class="label"><i class="fa fa-cc-visa"></i></div><div class="value">'+data.currency+'</div><i class="fa fa-cc-stripe"></i><div class="numbers"><span>3759</span><span>xxxx</span><span>xxxx</span><span>3456</span></div><div class="valid"><i class="fa fa-clock-o"></i> 10 / 20</div><div class="secure">123 <i class="fa fa-lock"></i></div></div>'+
      //'<div class="card blue"><div class="stripe"></div><div class="label"><i class="fa fa-cc-visa"></i></div><div class="value">'+data.currency+'</div><i class="fa fa-cc-stripe"></i><div class="numbers"><span>3759</span><span>xxxx</span><span>xxxx</span><span>3456</span></div><div class="valid"><i class="fa fa-clock-o"></i> 10 / 20</div><div class="secure">123 <i class="fa fa-lock"></i></div></div>'+
      //'<div class="card purple"><div class="stripe"></div><div class="label"><i class="fa fa-cc-visa"></i></div><div class="value">'+data.currency+'</div><i class="fa fa-cc-stripe"></i><div class="numbers"><span>3759</span><span>xxxx</span><span>xxxx</span><span>3456</span></div><div class="valid"><i class="fa fa-clock-o"></i> 10 / 20</div><div class="secure">123 <i class="fa fa-lock"></i></div></div>'+
      '</div>'+
      '<div class="addcard nocards alert alert-info" style="margin-top: 20px;'+
        '">'+
        '<div class="center">'+
          '<div class="paymentmethod" data-translate="paymentmethod"><span>Add a Payment</span></div>'+
          '<div class="btn-group" role="group" aria-label="Payment type">'+
            '<button type="button" class="btn btn-method btn-group-xs" data-method="cc">Credit Card</button>'+
            '<button type="button" class="btn btn-method btn-group-xs" data-method="paypal">PayPal</button>'+
            '<button type="button" class="btn btn-method btn-group-xs" data-method="bank">Bank Account</button>'+
          '</div>'+
          '<div class="fundsinput">'+
            '<div class="method cc">'+
                '<div class="input-group">'+
                  '<span class="input-group-addon"><a href="https://stripe.com" target="_blank"><i class="fa fa-cc-stripe"></i></a></span>'+
                  '<input type="text" class="form-control" id="number" placeholder="••••  ••••  ••••  ••••" autocomplete="off">'+
                  '<input type="text" class="form-control" id="expiry" maxlength="5" placeholder="••/••" autocomplete="off">'+
                  '<input type="text" class="form-control" id="cvc" maxlength="3" placeholder="•••" autocomplete="off">'+
                    '<button class="btn btn-success sendcc">'+
                      'Add Card <i class="fa fa-plus-circle"></i>'+
                    '</button>'+
                  '</div>'+
            '</div>'+
            '<div class="method paypal">'+
                '<div class="input-group">'+
                  '<span class="input-group-addon"><i class="fa fa-cc-paypal"></i></span>'+
                  '<input type="text" class="form-control" id="paypalemail" placeholder="PayPal Email" autocomplete="off">'+
                    '<button class="btn btn-success addpaypal" data-update="false">'+
                      '<span data-translate="addpaypal">Add PayPal</span> <i class="fa fa-paypal"></i> '+
                    '</button>'+
                  '</div>'+
            '</div>'+
            '<div class="method bank">'+
                '<div class="input-group">'+
                  '<span class="input-group-addon"><a href="https://stripe.com" target="_blank"><i class="fa fa-bank"></i></a></span>'+
                  '<input type="text" class="form-control" id="routing" placeholder="Routing #" autocomplete="off">'+
                  '<input type="text" class="form-control" id="account" placeholder="Account #" autocomplete="off">'+
                    '<button class="btn btn-success sendbank">'+
                      'Add Account <i class="fa fa-plus-circle"></i>'+
                    '</button>'+
                  '</div>'+
            '</div>'+
          '</div>';
          if (data.stripe || data.paypal) {
            html = html + '<div class="addfunds notice">'+
              '<i class="fa fa-info-circle"></i> <span data-translate="selectacard">Please select a card to add funds.</span>'
            '</div>';
          }
        html = html + '</div>'+
        '</div>'+
      '</div>';

      break;
    }

    $(".walletsend").html(html);

  } else {
    lastdata = data;
  }

}

function walletSendUpdate(data) {
  //bal = bal.toFixed(8);
  if (data.currency == 'BTCUSD') {
    $('.liveaddress').html(data.address);
    $('.btcbal').html('<strong class="georgia">m</strong><i class="fa fa-bitcoin"></i> <strong class="livebalance">'+data.balance+'</strong>');
  } else if (data.currency == 'CAD') {

  } else if (data.currency == 'USD') {

  }
}

var lastdata;
function showTx(data) {
  lastdata=data;
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
          if (tdata.confirmations >= 2 && tdata.confirmations < 100) var confirms = '<i class="fa fa-check green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations > 100) var confirms = '<i class="glyphicon glyphicon-tower green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations == 1) { var confirms = '<i class="fa fa-certificate green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>'; bottlepop(tdata.tx,tdata.amount) } 
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
      } else if (s=='sending') {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
        html = html + '<div class="sent"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sending</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <i class="fa fa-certificate" style="margin: 0px 10px 0px 10px;"></i> '+tdata.to+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+'<a href="https://www.biteasy.com/blockchain/transactions/'+tdata.tx+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span></div>';
        html = html + '</div>';
        index++;
      } else if (s=='sent') {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
        html = html + '<div class="sent"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sent</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <i class="fa fa-certificate orange" style="margin: 0px 10px 0px 10px;"></i> '+tdata.to+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.tx+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span></div>';
        html = html + '</div>';
        index++;
      } else {
        html = html + '<div class="alert alert-info lastbtctxs" style="margin-top: 20px;">';
        var confirms = '';
          if (tdata.confirmations >= 3 && tdata.confirmations < 100) confirms = confirms + '<i class="fa fa-check green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations > 100) confirms = confirms + '<i class="glyphicon glyphicon-tower green" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations < 3 && tdata.confirmations > 0) confirms = confirms + '<i class="fa fa-certificate orange" style="margin: 0px 10px 0px 10px;"></i> '+tdata.confirmations+' <span data-translate="confirmations">Confirmations</span>';
          if (tdata.confirmations == 0) confirms = confirms + '<i class="fa fa-certificate" style="color: #777;margin: 0px 10px 0px 10px;"></i> <span data-translate="justnow">Just Sent...</span>';
          if (tdata.status == 'processing') confirms = confirms + '<i class="fa fa-cog fa-spin" style="color: #777;margin: 0px 10px 0px 10px;"></i> <span data-translate="justnow">Processing...</span>';
          html = html + '<div class="received"><i class="fa fa-upload red" style="margin-right: 10px;"></i> <span data-translate="sent">Sent</span> <i class="fa fa-btc" style="margin: 0px 2px 0px 5px;"></i>'+tdata.amount+' <span style="float: right" class="timeago">'+entrydate+' '+entrytime+' <a href="https://www.biteasy.com/blockchain/transactions/'+tdata.tx+'" target="_blank"><i style="margin: 0px 5px 0px 5px;" class="fa fa-info-circle"></i></a></span>'+confirms+'</div>';
          lastdata = tdata.tx;
      html = html + '</div>';
      index++;
      }
    }
  }
  $(".wallettx").html(html);
}

$(document).ready(function() {
  // Change the currency icon when you click currency button
  $(".hook").on("click",".currency",function(e) {    
    var currency = $(this).data('currency');
    socket.emit('currency', { currency: currency });
    page('wallet');
  });

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
              if (html == 'Authy Error') { $("#send").removeClass('btn-blue').addClass('btn-danger').html('Token'); }
              else if (html == 'Balance') { $("#send").removeClass('btn-blue').addClass('btn-danger').html('Funds'); }
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