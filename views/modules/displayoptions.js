var option = new Array();
function displayOptions(displaysymbols, guest) {
  var percentage = offer*100;
  //$(".trading").html('<div style="text-align:center;">Loading '+displaysymbols+'</div>');
  if (displaysymbols) {
    $.each(displaysymbols, function( index, symbol ) {
    symbol = symbolSwitch(symbol);
    //console.log('displayOptions: '+symbol);
    var show = '<div class="controls" id="'+symbol+'">';
        
      if ( prefs.symbolratios != false ) {
        show = show + '<div class="progress progress'+symbol+' vertical">'+
            '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuetransitiongoal="50"></div>'+
        '</div>';
      }

        show = show + '<div class="btn-group-vertical callputcontainer">'+
            '<button type="button" class="btn btn-success callbtn call'+symbol+'" data-symbol="'+symbol+'">'+
             ' <span class="glyphicon glyphicon-arrow-up"></span>'+
              '<span data-translate="call">Call</span>'+
            '</button>'+
             '<button type="button" class="keystone btn btn-default keystone'+symbol+'" style="font-weight: bold;">'+
              '--.--'+
            '</button>'+
            '<button type="button" class="btn btn-danger putbtn put'+symbol+'" data-symbol="'+symbol+'">'+
              '<span data-translate="put">Put</span>'+
              '<span class="glyphicon glyphicon-arrow-down"></span>'+
            '</button>'+
          '</div>'+
          '<div class="info">'+
          '<div class="details">'+

              '<h1>'+percentage+'%</h1>'+
              '<span class="hide rawoffer">'+offer+'</span>'+
             '<!--  <span class="bold rate">Payout if</span><br /> -->'+
              '<span class="direction bold"><span class="action" data-translate="if">If</span>: <span class="option">'+symbol+'</span> <span class="tradeicon glyphicon icon'+symbol+' green glyphicon-arrow-up"></span></span><br />'+
              '<span class="price"><span data-translate="from">From:</span> <span class="keystone keystone'+symbol+'"> --.--</span> <span class="lock"></span></span><br />'+
              '<span class="expires bold"><span data-translate="in">In:</span> <span class="expiretime"></span></span>'+
              
            '</div>'+

            '<div class="trader">' +
              '<div class="input-group amount">'+
                    '<span class="input-group-addon">'+currencysymbol+'</span>'+
                    '<input type="number" class="form-control amountfield" data-symbol="'+symbol+'" placeholder="">'+
              '</div>'+
              '<button type="button" data-translate="apply" data-symbol="'+symbol+'" class="btn btn-default applytrade apply'+symbol+'">Apply</button>'+
            '</div>'+

          '</div>'+
          '</div>';
    var lock = '<div class="nooffer"><i class="fa fa-lock" style="font-size: 25px;"></i><br /><span data-translate="tradingisclosed">Trading is Closed</span> <br />'+symbol+':<span class="keystone'+symbol+'"></span></div>';

    //if trading is allowed on this symbol
    if (tradingopen) {
      var renderoffer = show;
    } else {
      var renderoffer = lock;
    }

    if (index > 0){
      var header = '<div class="header" style="border-top: 1px solid #eee;">'+symbol+'</div>';
    } else {
      var header = '<div class="header">'+symbol+'</div>';
    }

    option = header+'<div class="panel'+symbol+'">'+
      // '<div class="header">'+symbol+'</div>'+
      '<div class="numbotron" id="'+symbol+'_container">'+
      '</div>'+
        renderoffer +
         '<div style="clear:both;"></div>'+
    '</div>';

      $(".trading").append(option);

      $(".trading").addClass('symbols');

  });
  }
}