function showactive(data) {
    $('.tradesbody').html('');
      var tradehtml = '';
      if (data.length < 1) tradehtml = tradehtml + '<div class="usertrades"><div class="header" data-translate="noactivetrades">No Active Trades</div>';

      // Timing loop
      var timeleft, totalseconds, totaltime, totaltimestring = '';
      $.each(data, function (index, trade) {

        // Display the next trade in the header
        if ( !totaltime || trade.expires >= totaltime ) {
          totalseconds = trade.expires;
          totaltime = trade.expires; // 60 seconds
          $('.full.tradetime').attr('time', totalseconds); // Setting the attrbute will automatically set it's time
        }

      });

      // Display loop
      $.each(data, function (index, data) {

        // Update trade times
        for (var i = nexttrade.next.length - 1; i >= 0; i--) {
          if ( totaltime == nexttrade.next[i].time ) totaltimestring = nexttrade.next[i].string;
          if ( data.expires == nexttrade.next[i].time ) {
            timeleft = nexttrade.next[i].string; // 0:29
            totalseconds = nexttrade.next[i].seconds; // 29..28
          }
        };

        // Create trades table header
        if (index == 0) {
          tradehtml = tradehtml + '<div class="usertrades"><div class="header"><span data-translate="activetrades">Active Trades</span> <span style="float:right;"><span class="full tradetime" data-time="'+totaltime+'">'+totaltimestring+'</span> <i class="fa fa-clock-o hide"></i></span></div>';
          tradehtml = tradehtml + '<div class="row-fluid"><div class="span12 "><div><table class="table tradestable" id="trades">';
          '<thead>' +
              '<tr>';
                if (publictrades == true) tradehtml = tradehtml + '<th>User</th>';
                tradehtml = tradehtml + '<th class="symbol">Symbol</th>'+
                '<th>Trade</th>'+
                '<th>Amount</th>'+
                '<th>Prize</th>'+
                '<th>Outcome</th>'+
                '<th>Time</th>'+
              '</tr>' +
          '</thead>';
        }
      
      tradehtml = tradehtml + '<tbody class="tradesbody">';

      if (data.user == user || !user) {

        // Calulate possible win
        var possiblewin = (+data.amount+(data.amount*data.offer));
        possiblewin = possiblewin.toFixed(2);

       
        // Money display
        var currency = data.currency;
        data.price = Number(data.price);
        if (!lastprice) lastprice = '-.--';

        // Signal Logic
        if (data.direction == 'Call') {
          var arrowhtml = '<span class="green glyphicon glyphicon-arrow-up"></span>';
          if (price[data.symbol] > data.price) {
            var currentoutcome = '<span data-translate="winning" class="trade-control green"><i class="fa fa-circle"></i></span>';
          } else if (price[data.symbol] < data.price) {
            var currentoutcome = '<span data-translate="losing" class="trade-control red"><i class="fa fa-circle"></i></span>';
          } else {
            var currentoutcome = '<span data-translate="tied" class="trade-control orange"><i class="fa fa-circle"></i></span>';
          } 
        } else if (data.direction == 'Put') {
          var arrowhtml = '<span class="red glyphicon glyphicon-arrow-down"></span>';
          if (price[data.symbol] < data.price) {
            var currentoutcome = '<span data-translate="winning" class="trade-control green"><i class="fa fa-circle"></i></span>';
          } else if (price[data.symbol] > data.price) {
            var currentoutcome = '<span data-translate="losing" class="trade-control red"><i class="fa fa-circle"></i></span>';
          } else {
            var currentoutcome = '<span data-translate="tied" class="trade-control orange"><i class="fa fa-circle"></i></span>';
          } 
        }

        // Currency Switch
        switch (data.currency) { 
          case 'BTC': currencyicon = 'm<i class="fa fa-btc"></i>'; break;
          case 'CAD': currencyicon = '<span class="hideinmobile">CAD</span> <i class="fa fa-dollar"></i>'; break;
          case 'EUR': currencyicon = '<span class="hideinmobile">EUR</span> <i class="fa fa-eur"></i>'; break;
          case 'GBP': currencyicon = '<span class="hideinmobile">GBP</span> <i class="fa fa-gbp"></i>'; break;
          case 'USD': currencyicon = '<span class="hideinmobile">USD</span> <i class="fa fa-dollar"></i>'; break;
          case 'RUB': currencyicon = '<span class="hideinmobile">RUB</span> <i class="fa fa-rub"></i>'; break;
          default: currencyicon = '<i class="fa fa-dollar"></i>'; break;
        }

        // Row HTML
        tradehtml = tradehtml + '<tr class="bgtransition usertrade" id="trade'+index+'">';
        if (publictrades == true) tradehtml = tradehtml + '<td class="user">' + data.user + '</td>';
        tradehtml = tradehtml + '<td class="symbol"><a class="keystonelink" data-symbol="'+data.symbol+'">'+data.symbol+' : <span class="keystone keystone'+data.symbol+'">'+price[data.symbol]+'</span></a></td>';
        tradehtml = tradehtml + '<td>'+arrowhtml+' <span class="direction">'+data.direction+'</span><span class="from"> from</span> <span class="tradeprice">'+data.price+'</span></td>';
        tradehtml = tradehtml + '<td>'+currencyicon+data.amount+'</td>';
        tradehtml = tradehtml + '<td>'+currencyicon+possiblewin+'</td>';
        tradehtml = tradehtml + '<td>'+currentoutcome+'</td>';
        tradehtml = tradehtml + '<td><span class="tradetime" data-time="'+data.expires+'">'+timeleft+'</span></td>';
                    //'<td title="Expires: '+thisdate+' '+thistime+'">'+thistime+'</td>'+
                    // if (nexttrade[0] == 0 && nexttrade[1] < 60) {
                    // tradehtml = tradehtml + '<td><i class="fa fa-lock"></i></td>';
                    // } else {
                    // tradehtml = tradehtml + '<td><i class="fa outcomeindicator"></i></td>';
                    // }
        tradehtml = tradehtml + '</tr>';
      }
    // loop end
});
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
          $('#'+tradeid+'').removeClass('redbg').addClass('greenbg');
          $('#'+tradeid+' .outcomeindicator').removeClass('fa-hand-o-up').addClass('fa-hand-o-down');
          // $('#'+tradeid+'').effect("highlight", {color: 'hsl(113, 100%, 35%, 0.15)'}, 2030, "easeInOutCirc");
        } else if (symbolprice > tradeprice) {
          $('#'+tradeid+'').addClass('redbg').removeClass('greenbg');
          $('#'+tradeid+' .outcomeindicator').removeClass('fa-hand-o-down').addClass('fa-hand-o-up');
          // $('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 2030, "easeInOutCirc");
        } else {
          //
        }
      } else if (direction == 'Call') {
        if (symbolprice > tradeprice) {
          $('#'+tradeid+'').removeClass('redbg').addClass('greenbg');
          // $('#'+tradeid+'').effect("highlight", {color: 'hsl(113, 100%, 35%, 0.15)'}, 2030, "easeInOutCirc");
        } else if (symbolprice < tradeprice) {
          $('#'+tradeid+'').addClass('redbg').removeClass('greenbg');
          // $('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 2030, "easeInOutCirc");
        } else {
          // $('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 1530, "easeInOutCirc");
        }
        }
   });
}
$(function() {

  $('.trade-repeat').on('click', function (e) {
    if ($(this).hasClass('active')) {
      $(this).removeClass('fa-spin');
    } else {
      $(this).addClass('fa-spin');
    }
  });

});