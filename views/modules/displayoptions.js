var option = new Array();
function displayOptions(displaysymbols, guest) {
  var percentage = offer*100,
  mode = 'Manual';
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
             '<button type="button" class="keystone btn keystone-btn btn-default keystone'+symbol+'" data-symbol="'+symbol+'" style="font-weight: bold;">'+
              '--.--'+
            '</button>'+
            '<button type="button" class="btn btn-danger putbtn put'+symbol+'" data-symbol="'+symbol+'">'+
              '<span data-translate="put">Put</span>'+
              '<span class="glyphicon glyphicon-arrow-down"></span>'+
            '</button>'+
          '</div>'+
          '<div class="trademode">'+mode+'</div>'+
          '<input type="hidden" name="action" class="action" value="none" />'+
          '<div class="info">'+
                '<div class="manual">'+

                  '<div class="details">'+
                      '<h1>'+percentage+'%</h1>'+
                      '<span class="hide rawoffer">'+offer+'</span>'+
                     '<!--  <span class="bold rate">Payout if</span><br /> -->'+
                      '<span class="direction bold"><span class="option">'+symbol+'</span> <span class="tradeicon glyphicon icon'+symbol+' green glyphicon-arrow-up"></span></span><br />'+
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
                '<div class="auto hide">'+

                  '<div class="details">'+
                      '<h1>'+percentage+'%</h1>'+
                      '<span class="hide rawoffer">'+offer+'</span>'+
                      '<span class="direction bold"><span class="option">'+symbol+'</span> <span class="tradeicon firsttradeicon glyphicon icon'+symbol+' orange glyphicon-arrow-up"></span><span class="tradeicon lasttradeicon glyphicon icon'+symbol+' orange glyphicon-arrow-down" style="margin-left: -2px;"></span></span><br />'+
                      '<div class="progress">'+
                        '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width:50%">'+
                        '</div>'+
                      '</div>'+
                  '</div>'+
                  '<div class="trader">' +
                    '<div class="input-group repeat">'+
                      '<span class="input-group-addon"><i class="fa fa-repeat"></i></span>'+
                      '<input type="number" class="form-control repeatfield" data-symbol="'+symbol+'" placeholder="">'+
                    '</div>'+
                    '<div class="input-group amount">'+
                          '<span class="input-group-addon">'+currencysymbol+'</span>'+
                          '<input type="number" class="form-control repeatamountfield" data-symbol="'+symbol+'" placeholder="">'+
                    '</div>'+
                    '<button type="button" data-translate="start" data-symbol="'+symbol+'" class="btn btn-success applyautotrade apply'+symbol+'"><i class="fa fa-play"></i> Start</button>'+
                  '</div>'+
                '</div>'+
                '<div style="clear:both;"></div>'+
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

     var controls = '<div class="chart-controls" data-symbol="'+symbol+'">'+
     '<i class="trade-switch fa fa-toggle-off"></i>'+
     '<i class="chart-expand fa fa-expand"></i>'+
      '<span class="chart-time downplay vanish" data-time="300000">5m</span>'+
      '<span class="chart-time" data-time="600000">10m</span>'+
      '<span class="chart-time downplay vanish" data-time="900000">15m</span>'+
      '<span class="chart-time downplay vanish" data-time="1200000">20m</span>'+
      '<span class="chart-time active" data-time="1800000">30m</span>'+
      '<span class="chart-time downplay vanish" data-time="3600000">1h</span>'+
      '<span class="chart-time" data-time="10800000">3h</span>'+
      '<span class="chart-time downplay vanish" data-time="18000000">5h</span>'+
      '<span class="chart-time downplay vanish" data-time="43200000">12h</span>'+
      '<span class="chart-time downplay vanish" data-time="86400000">24h</span>'+
      '<i class="chart-ellipsis fa fa-ellipsis-h"></i>'+
      '<div class="chat-more"></div>'+
    '</div>';

    if (index > 0){
      var header = '<div class="header" style="border-top: 1px solid #eee;" data-symbol="'+symbol+'">'+symbol+controls+'</div>';
    } else {
      var header = '<div class="header" data-symbol="'+symbol+'">'+symbol+controls+'</div>';
    }

    option = header + '<div class="'+symbol+'">'+
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