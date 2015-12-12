function showWallet(data) {
console.log(data);
    var html = '';

    if (!data.address) data.address = '<i>no address</i>';

    if (data.currencies.length > 0) {
      html = html + '<div class="walletcurrencies btn-group" role="group" aria-label="...">';
      var currencies = data.currencies;
      
      $.each(currencies, function(i, currency) {
        var classes = '';
        var width = (100/currencies.length);
        if (data.currency == currency.symbol) {
          classes = 'btn-blue active';
        } else {
          classes = 'btn-default';
        }
        html = html + '<button type="button" data-currency="'+currency.symbol+'" style="width:'+width+'%;" class="currency btn '+classes+'">';
        html = html + '<span class="name">'+currency.name+'</span>';
        html = html + '<span class="symbol">'+currency.symbol+'</span>';
        html = html + '<span class="amount">'+currency.amount+'</span>';
        html = html + '</button>';
      });
      
      html = html + '</div>';

    }

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
      case 'CAD':

      html = html + '<div class="addcard alert alert-info" style="margin-top: 20px;min-height: 146px;">'+
      '</div><div class="cards">'+
        '<div class="visa credit card"><div class="details">4510 **** **** **79</div></div>'+
      '</div>';

      break;
      case 'USD':

      html = html + '<div class="addcard alert alert-info" style="margin-top: 20px;';
        if (data.methods) html = html + 'height: 125px;';
        if (!data.methods) html = html + 'height: 100px;';
        html = html + '">'+
        '<div class="center">'+
          '<div class="paymentmethod" data-translate="paymentmethod"><span>Add a Payment</span></div>'+
          '<div class="btn-group" role="group" aria-label="Payment type">'+
            '<button type="button" class="btn btn-method btn-group-xs" data-method="cc">Credit Card</button>'+
            '<button type="button" class="btn btn-method btn-group-xs" data-method="paypal">PayPal</button>'+
            '<button type="button" class="btn btn-method btn-group-xs" data-method="bank">Bank Account</button>'+
          '</div>'+
          '<div class="fundsinput">'+
            '<div class="method cc">'+
              '<form>'+
                '<div class="input-group">'+
                  '<span class="input-group-addon"><i class="fa fa-cc-stripe"></i></span>'+
                  '<input type="text" class="form-control" id="number" placeholder="••••  ••••  ••••  ••••" autocomplete="off">'+
                  '<input type="text" class="form-control" id="expiry" maxlength="5" placeholder="••/••" autocomplete="off">'+
                  '<input type="text" class="form-control" id="cvc" maxlength="3" placeholder="•••" autocomplete="off">'+
                    '<button class="btn btn-success sendcc" style="border-radius: 0px 4px 4px 0px !important;">'+
                      'Add Card <i class="fa fa-plus-circle"></i>'+
                    '</button>'+
                  '</div>'+
              '</form>'+
            '</div>'+
            '<div class="method paypal">'+
              '<form>'+
                '<div class="input-group">'+
                  '<span class="input-group-addon"><i class="fa fa-cc-paypal"></i></span>'+
                  '<input type="text" class="form-control" id="email" placeholder="PayPal Email" autocomplete="off">'+
                    '<button class="btn btn-success addpaypal" style="border-radius: 0px 4px 4px 0px !important;">'+
                      'Add PayPal <i class="fa fa-paypal"></i> '+
                    '</button>'+
                  '</div>'+
              '</form>'+
            '</div>'+
          '</div>';
          if (data.methods) {
            html = html + '<div class="addfunds notice">'+
              '<i class="fa fa-info-circle"></i> Select a payment method from below to add funds.'
            '</div>';
          }
        html = html + '</div>'+
        '</div>'+
      '</div>'+
      '<div class="cards">'+
        '<div class="card green"><div class="stripe"></div><div class="label"><i class="fa fa-cc-visa"></i></div><div class="value">USD</div><i class="fa fa-stripe"></i><div class="numbers"><span>3759</span><span>xxxx</span><span>xxxx</span><span>3456</span></div><div class="valid"><i class="fa fa-clock-o"></i> 10 / 20</div><div class="secure">123 <i class="fa fa-lock"></i></div></div>'+
        '<div class="card blue"><div class="stripe"></div><div class="label"><i class="fa fa-cc-visa"></i></div><div class="value">USD</div><i class="fa fa-stripe"></i><div class="numbers"><span>3759</span><span>xxxx</span><span>xxxx</span><span>3456</span></div><div class="valid"><i class="fa fa-clock-o"></i> 10 / 20</div><div class="secure">123 <i class="fa fa-lock"></i></div></div>'+
        '<div class="card purple"><div class="stripe"></div><div class="label"><i class="fa fa-cc-visa"></i></div><div class="value">USD</div><i class="fa fa-stripe"></i><div class="numbers"><span>3759</span><span>xxxx</span><span>xxxx</span><span>3456</span></div><div class="valid"><i class="fa fa-clock-o"></i> 10 / 20</div><div class="secure">123 <i class="fa fa-lock"></i></div></div>'+
      '</div>';

      break;
      case 'EUR':

      html = html + '<div class="addcard alert alert-info" style="margin-top: 20px;min-height: 146px;">'+
      '</div><div class="cards">'+
        '<div class="visa credit card"><div class="details">4510 **** **** **79</div></div>'+
      '</div>';

      break;
      case 'GBP':
      
      html = html + '<div class="addcard alert alert-info" style="margin-top: 20px;min-height: 146px;">'+
      '</div><div class="cards">'+
        '<div class="visa"></div>'+
      '</div>';

      break;
    }

    $(".wallet").html(html);
}


function btcWalletUpdate(data) {  
  //bal = bal.toFixed(8);
  if (data.currency == 'BTC') {
      if (!data.address) {
        var qraddress = window.location.href;
      } else {
        var qraddress = data.address;
      }
      $(".btcqr").qrcode({
        render: 'canvas',
        size: 100,
        radius: 100,
        fill: '#31708f',
        text: qraddress
      });
  }
}


$(document).ready(function() {


  // Change the currency icon when you click currency button
  $(".hook").on("click",".currency",function(e) {    
    var currency = $(this).data('currency');
    socket.emit('currency', { currency: currency });
    page('wallet');
  });


  // Change the add fund method
  var selectedmethod = false;
  $('.hook').on('click', '.btn-method', function(e) {
    if ( !$(this).hasClass('active') ) {
      $('.btn-method').removeClass('active');
      $(this).addClass('active');
      var method = $(this).attr('data-method');
      $('.addcard').height(160);

      if (selectedmethod) {
        $('.fundsinput .method').removeClass('showmethod');
        setTimeout( function() { $('.fundsinput .'+method).addClass('showmethod'); }, 500 );
      } else {
        $('.fundsinput .'+method).addClass('showmethod');
      }

      selectedmethod = method;
    }
  });


  // Validate CC Number
  $('.hook').on('keyup', '#number', function (e) {
    var val = $('#number').val().replace(' ', '').replace('-','');
    var type = Stripe.cardType(val).toLowerCase();
    if ( Stripe.validateCardNumber(val) == true ) {
      $('#number').css('color', 'hsl(113, 100%, 35%)');
    } else {
      $('#number').css('color', '#D83300');
    }

  });
  $('.hook').on('keyup', '#expiry', function (e) {
    var val = $('#expiry').val();
    if ( Stripe.validateExpiry(val) == true ) {
      $('#expiry').css('color', 'hsl(113, 100%, 35%)');
    } else {
      $('#expiry').css('color', '#D83300');
    }
  });
  $('.hook').on('keyup', '#cvc', function (e) {
    var val = $('#cvc').val();
    if ( Stripe.validateCVC(val) == true ) {
      $('#cvc').css('color', 'hsl(113, 100%, 35%)');
    } else {
      $('#cvc').css('color', '#D83300');
    }
  });


  $('.hook').on('click', '.sendcc', function (e) {
    var number = $('#number').val().replace(' ', '').replace('-','');
    var expiry = $('#expiry').val();
    var cvc = $('#cvc').val();
    if ( Stripe.validateCardNumber(number) != true || Stripe.validateExpiry(expiry) != true || Stripe.validateCVC(cvc) != true ) {
      // Invalid Card
      $('#number').css('color', '#D83300');
      $('#expiry').css('color', '#D83300');
      $('#cvc').css('color', '#D83300');
      var btntxt = $('.sendcc').html();
      $('.sendcc').html('Invalid Card <i class="fa fa-times"></i>').removeClass('btn-success').addClass('btn-danger');
      setTimeout( function() {
        $('.sendcc').html(btntxt).removeClass('btn-danger').addClass('btn-success');
      }, 2000);
    } else {
      var btntxt = $('.sendcc').html();
      $('#number').css('color', 'hsl(113, 100%, 35%)');
      $('#expiry').css('color', 'hsl(113, 100%, 35%)');
      $('#cvc').css('color', 'hsl(113, 100%, 35%)');
      $('.sendcc').html('Adding Card <i class="fa fa-check"></i>').removeClass('btn-danger').addClass('btn-success');
      setTimeout( function() { $('.sendcc').html(btntxt); }, 2000);
    }
  });

  $('.hook').on('click', '.addpaypal', function (e) {
    var email = $('#email').val();
    if ( !email ) {
      // Invalid Card
      $('#email').css('color', '#D83300');
      var btntxt = $('.addpaypal').html();
      $('.addpaypal').html('Invalid Email <i class="fa fa-times"></i>').removeClass('btn-success').addClass('btn-danger');
      setTimeout( function() {
        $('.addpaypal').html(btntxt).removeClass('btn-danger').addClass('btn-success');
      }, 2000);
    } else {
      var btntxt = $('.addpaypal').html();
      $('#email').css('color', 'hsl(113, 100%, 35%)');
      $('.addpaypal').html('Adding PayPal <i class="fa fa-check"></i>').removeClass('btn-danger').addClass('btn-success');
      setTimeout( function() { $('.addpaypal').html(btntxt); }, 2000);
    }
  });

  // Selection BTC Accress
  $(".hook").on("click",".btcaddress",function(e) {    
    select_all(this);
    var add = $(this).html();
    clientText.setText( add );
  });

  // Show security page
  $(".hook").on("click",".showsecuirtypage",function(e) {    
    page('security');
    showAccount();
  });

});
