var option = new Array();
function displayOptions(displaysymbols, guest) {
  var percentage = offer*100,
  mode = 'Manual';
  //$(".trading").html('<div style="text-align:center;">Loading '+displaysymbols+'</div>');
  if (displaysymbols) {
    $.each(displaysymbols, function( index, symbol ) {
      symbol = symbolSwitch(symbol);
      //console.log('displayOptions: '+symbol);
      var show = '<div class="controls" data-symbol="'+symbol+'">';
        var bonus = 5;
      // if ( prefs.symbolratios != false ) {
      //   show = show + '<div class="progress progress'+symbol+' vertical">'+
      //       '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuetransitiongoal="50"></div>'+
      //   '</div>';
      // }

        show = show + '<div class="btn-group-vertical callputcontainer">'+
            '<button type="button" class="btn btn-success callbtn call'+symbol+'" data-symbol="'+symbol+'">'+
             ' <span class="glyphicon glyphicon-arrow-up"></span>'+
              '<span data-translate="call" class="button-text">Call</span>'+
            '</button>'+
             '<button type="button" class="keystone btn keystone-btn btn-default keystone'+symbol+'" data-symbol="'+symbol+'" style="font-weight: bold;">'+
              '--.--'+
            '</button>'+
            '<button type="button" class="btn btn-danger putbtn put'+symbol+'" data-symbol="'+symbol+'">'+
              '<span class="glyphicon glyphicon-arrow-down"></span>'+
              '<span data-translate="put" class="button-text">Put</span>'+
            '</button>'+
          '</div>'+
          '<div class="trademode">'+mode+'</div>'+
          '<input type="hidden" name="action" class="action" value="none" />'+
          '<input type="hidden" name="action" class="time" value="60" />'+
          '<div class="info">'+
                '<div class="manual">'+

                  '<div class="details trader">'+
                      '<h1>'+percentage+'%</h1>';
                      if (bonus) show = show + '<span class="bonusoffer">+'+bonus+'%</span>';
                      show = show + '<span class="hide rawoffer">'+offer+'</span>'+
                     '<!--  <span class="bold rate">Payout if</span><br /> -->'+
                      '<span class="direction bold"><span class="option">'+symbol+'</span></span><br />'+
                      
                    '<div class="directionpicker">'+
                      '<div class="btn-group-horizontal">'+
                        '<button type="button" class="btn btn-xs btn-success callbtn call'+symbol+'" data-symbol="'+symbol+'">'+
                         ' <span class="glyphicon glyphicon-arrow-up"></span>'+
                        '</button>'+
                         '<button type="button" class="keystone btn btn-xs keystone-btn btn-default keystone'+symbol+'" data-symbol="'+symbol+'" style="font-weight: bold;">'+
                          '--.--'+
                        '</button>'+
                        '<button type="button" class="btn btn-xs btn-danger putbtn put'+symbol+'" data-symbol="'+symbol+'">'+
                          '<span class="glyphicon glyphicon-arrow-down"></span>'+
                        '</button>'+
                      '</div>'+
                    '</div>'+

                      '<div class="expires">'+
                        '<div class="btn-group">'+
                            '<button type="button" class="btn btn-xs btn-default subtract" data-symbol="'+symbol+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                              '<i class="fa fa-minus"></i>'+
                            '</button>'+
                            '<button type="button" class="btn btn-xs btn-default timefield">'+
                            '<div class="flash"></div>'+
                            '<ul class="'+symbol+'_tradetimes">';
                            show = show + '</ul></button>'+
                            '<button type="button" class="btn btn-xs btn-default add" data-symbol="'+symbol+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+                            
                              '<i class="fa fa-plus"></i>'+
                            '</button>'+
                          '</div>'+
                      '</div>'+
                  '</div>'+

                  '<div class="input-group amount">'+
                        '<span class="input-group-addon">'+currencysymbol+'</span>'+
                        '<input type="number" class="form-control amountfield" data-symbol="'+symbol+'" placeholder="">'+
                        '<div class="btn-group-vertical" role="group" aria-label="...">'+
                          '<div class="btn btn-xs btn-default amountup" data-symbol="'+symbol+'"><i class="fa fa-caret-up"></i></div>'+
                          '<div class="btn btn-xs btn-default amountdown" data-symbol="'+symbol+'"><i class="fa fa-caret-down"></i></div>'+
                        '</div>'+
                  '</div>'+

                  '<button type="button" data-translate="apply" data-symbol="'+symbol+'" class="btn btn-default applytrade apply'+symbol+'">Apply</button>'+
                  '<span class="floater">+50xp</span>'+

                  '</div>'+
                '<div class="auto hide">'+

                  '<div class="details">'+
                      '<h1>'+percentage+'%';
                      if (bonus) show = show + '<span class="bonusoffer">+'+bonus+'%</span>';
                      show = show + '</h1>'+
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
                    '<button type="button" data-translate="start" data-symbol="'+symbol+'" class="btn btn-success applyautotrade apply'+symbol+'">Start</button>'+
                    '<span class="floater">+50xp</span>'+
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

     var controls = '<div class="chart-controls '+symbol+'" data-symbol="'+symbol+'">'+
     '<i  class="close-chart fa fa-times"></i>'+
     '<i class="trade-switch fa fa-toggle-off"></i>'+
     '<i class="chart-expand fa fa-expand"></i>'+
      '<span class="chart-time" data-time="1000">1m</span>'+
      '<span class="chart-time hideinmobile" data-time="300000">5m</span>'+
      '<span class="chart-time downplay vanish hideinmobile" data-time="900000">15m</span>'+
      '<span class="chart-time active" data-time="1800000">30m</span>'+
      '<span class="chart-time downplay vanish" data-time="3600000">1h</span>'+
      '<span class="chart-time downplay vanish hideinmobile" data-time="18000000">5h</span>'+
      '<span class="chart-time downplay vanish hideinmobile" data-time="43200000">12h</span>'+
      '<span class="chart-time downplay vanish" data-time="86400000">24h</span>'+
      '<i class="chart-ellipsis fa fa-ellipsis-h" data-symbol="'+symbol+'"></i>'+
      '<i class="chart-flags fa fa-flag"></i>'+
      '<div class="chat-more"></div>'+
    '</div>';

      var header = '<li class="trading symbols chart-'+symbol+'" data-symbol="'+symbol+'" data-row="'+index+'" data-col="1" data-sizex="4" data-sizey="2"><div class="header" data-symbol="'+symbol+'">'+symbol+controls+'</div>';

    var optiontimer = '';
    /*if ( prefs["optiontimer"] == true ) {
        optiontimer = optiontimer + '<div class="optionprogress progress" style="margin:0px;">'+
          '<div class="progress-bar tradeprogress" role="progressbar" aria-valuenow="'+percentagecomplete+'" aria-valuemin="0" aria-valuemax="100" style="width: '+percentagecomplete+'%;">'+
          '</div>'+
        '</div>';
    }*/

    option = header + '<div class="'+symbol+'">'+
      // '<div class="header">'+symbol+'</div>'+
      '<div class="numbotron" id="'+symbol+'_container">'+
      '<canvas id="'+symbol+'_chart" height="100%" width="100%"></canvas>'+
      '</div>'+
        renderoffer + optiontimer +
        '<div style="clear:both;"></div>'+
     '</div></li>';

      $(".grid").prepend(option);

  });
  }
}