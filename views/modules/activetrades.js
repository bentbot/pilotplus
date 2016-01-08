function showactive(data, nexttrade) {
    $('.tradesbody').html('');
    if (data && data[0] != null) {
      var tradehtml = '<div class="usertrades userblock"><div class="header"><span data-translate="activetrades">Active Trades</span> <span style="float:right;"><span class="expiretime">'+nexttrade[0]+':'+nexttrade[1]+'</span> <i class="fa fa-clock-o hide"></i></span></div>';
    } else {
      var tradehtml = '<div class="usertrades userblock"><div class="header" data-translate="noactivetrades">No Active Trades</div>';
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
      
      $.each(data, function (index, data) {

      if (data.user == user) {
        var possiblewin = (+data.amount+(data.amount*data.offer));
        possiblewin = possiblewin.toFixed(2);
        // var date = new Date(data.time);
        // var thistime = date.customFormat( "#hh#:#mm# #AMPM#" );
        // var thisdate = date.customFormat( "#DD#/#MM#/#YYYY#" );
        var currency = data.currency;
        data.price = Number(data.price);

        if (!lastprice) {
          lastprice = '-.--';
        }

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

        switch (data.currency) { 
          case 'BTC': currencyicon = '<td>m<i class="fa fa-btc"></i>'; break;
          case 'CAD': currencyicon = '<td><span class="hideinmobile">CAD</span> <i class="fa fa-dollar"></i>'; break;
          case 'EUR': currencyicon = '<td><span class="hideinmobile">EUR</span> <i class="fa fa-eur"></i>'; break;
          case 'GBP': currencyicon = '<td><span class="hideinmobile">GBP</span> <i class="fa fa-gbp"></i>'; break;
          case 'USA': currencyicon = '<td><span class="hideinmobile">USD</span> <i class="fa fa-dollar"></i>'; break;
          default: currencyicon = '<td><i class="fa fa-dollar"></i>'; break;
        }

        tradehtml = tradehtml + '<tr class="bgtransition usertrade" id="trade'+index+'">';
        tradehtml = tradehtml + '<td class="symbol"><a class="keystonelink" data-symbol="'+data.symbol+'">'+data.symbol+' : <span class="keystone keystone'+data.symbol+'">'+price[data.symbol]+'</span></a></td>';
        tradehtml = tradehtml + '<td>'+arrowhtml+' <span class="direction">'+data.direction+'</span><span class="from"> from</span> <span class="tradeprice">'+data.price+'</span></td>';
        tradehtml = tradehtml + '<td>'+currencyicon+data.amount+'</td>';
        tradehtml = tradehtml + '<td>'+currencyicon+possiblewin+'</td>';
        tradehtml = tradehtml + '<td><span class="tradetime">'+data.expiry+'</span></td>';
        tradehtml = tradehtml + '<td>'+currentoutcome+'</td>';
                    //'<td title="Expires: '+thisdate+' '+thistime+'">'+thistime+'</td>'+
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