function showactive(data, nexttrade) {
    //console.log(data);
    $('.tradesbody').html('');
    if (data[0] != null) {
      var tradehtml = '<div class="usertrades"><div class="header"><span data-translate="activetrades">Active Trades</span> <span style="float:right;"><span class="expiretime">'+nexttrade[0]+':'+nexttrade[1]+'</span> <i class="fa fa-clock-o hide"></i></span></div>';
    } else {
      var tradehtml = '<div class="usertrades"><div class="header" data-translate="noactivetrades">No Active Trades</div>';
    }
          tradehtml = tradehtml + '<div class="row-fluid"><div class="span12 "><div><table class="table tradestable" id="trades">';
              // '<thead>' +
              //   '<tr>' +
              //     '<th class="symbol">Symbol</th>' +
              //     '<th>Trade</th>' +
              //     '<th>Amount</th>' +
              //     '<th>End</th>' +
              //     '<th>Payout</th>';
        //if (publictrades == true) { tradehtml = tradehtml + '<th>User</th>'; }
       // tradehtml = tradehtml + '</tr>' +
              //'</thead>'+
              tradehtml = tradehtml + '<tbody class="tradesbody">';
    var index;
    for (index = 0; index < data.length; ++index) {
            entry = data[index];
      entry[0] = symbolSwitch(entry[0]);


      if (entry[6] == user) {
        var possiblewin = (+entry[3]+(entry[3]*entry[2]));
        possiblewin = possiblewin.toFixed(2);
        var date = new Date(entry[5]);
        var thistime = date.customFormat( "#hh#:#mm# #AMPM#" );
        var thisdate = date.customFormat( "#DD#/#MM#/#YYYY#" );
        entry[1] = Number(entry[1]);

        if (!lastprice) {
          lastprice = '-.--';
        }


        if (entry[4] == 'Call') {
          var arrowhtml = '<span class="green glyphicon glyphicon-arrow-up"></span>';
        } else if (entry[4] == 'Put') {
          var arrowhtml = '<span class="red glyphicon glyphicon-arrow-down"></span>';
        }

        tradehtml = tradehtml + '<tr class="bgtransition usertrade" id="trade'+index+'">' +
                    '<td class="symbol"><a class="keystonelink" id="'+entry[0]+'">'+entry[0]+':<span class="keystone keystone'+entry[0]+'">'+price[entry[0]]+'</span></a></td>'+
                    '<td>'+arrowhtml+' <span class="direction">'+entry[4]+'</span> from <span class="tradeprice">'+entry[1]+'</span></td>'+
                    '<td>m<i class="fa fa-btc"></i>'+entry[3]+'</td>'+
                    //'<td title="Expires: '+thisdate+' '+thistime+'">'+thistime+'</td>'+
                    '<td>m<i class="fa fa-btc"></i>'+possiblewin+'</td>';
                    // if (nexttrade[0] == 0 && nexttrade[1] < 60) {
                    // tradehtml = tradehtml + '<td><i class="fa fa-lock"></i></td>';
                    // } else {
                    // tradehtml = tradehtml + '<td><i class="fa outcomeindicator"></i></td>';
                    // }
      tradehtml = tradehtml + '</tr>';
        //     if (lastprice > entry[1]) {
        //   $('#trade'+index+'').removeClass('redbg').addClass('greenbg');
        // } else if (lastprice < entry[1]) {
        //   $('#trade'+index+'').removeClass('greenbg').addClass('redbg');
        // } else {
        //   $('#trade'+index+'').removeClass('greenbg').removeClass('redbg');
        // }
      }
    }
    tradehtml = tradehtml + '</tbody></table></div></div></div></div>';
     $('.tradestable').html(tradehtml);

$( ".usertrade" ).each(function( index ) {
      var tradeid = $(this).attr('id');
      var symbolprice = $('#'+tradeid+' .keystone').html();
      var tradeprice = $('#'+tradeid+' .tradeprice').html();
      var direction = $('#'+tradeid+' .direction').html();


      symbolprice = Number(symbolprice);
      tradeprice = Number(tradeprice);
      symbolprice = symbolprice.toFixed(4);
      tradeprice = tradeprice.toFixed(4);

      //console.log(tradeid + ',' + symbolprice + ',' + tradeprice + ',' + direction);
      if (direction == 'Put') {
        if (symbolprice < tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(113, 100%, 35%, 0.15)');
          $('#'+tradeid+' .outcomeindicator').removeClass('fa-hand-o-up').addClass('fa-hand-o-down');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(113, 100%, 35%, 0.15)'}, 2030, "easeInOutCirc");
        } else if (symbolprice > tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(360, 100%, 35%, 0.25)');
          $('#'+tradeid+' .outcomeindicator').removeClass('fa-hand-o-down').addClass('fa-hand-o-up');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 2030, "easeInOutCirc");
        } else {
          //
        }
      } else if (direction == 'Call') {
        if (symbolprice > tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(113, 100%, 35%, 0.15)');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(113, 100%, 35%, 0.15)'}, 2030, "easeInOutCirc");
        } else if (symbolprice < tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(360, 100%, 35%, 0.25)');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 2030, "easeInOutCirc");
        } else {
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 1530, "easeInOutCirc");
        }
        }
   });
}
