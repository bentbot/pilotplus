function showAllActive(data){
    $('.allactive').html('');
    
    var allactive = '<div class="userblock"><div class="header activetradesheader">Active Trades <span style="float:right;" class="btn btn-xs btn-green totalamount"></span></div>';
    allactive = allactive + '<div class="row-fluid"><div class="span12"><div><table class="table" id="allactivetrades">';
    var index;
    var total = 0;

      allactive = allactive + '<tbody class="tradesbody">';
      
      $.each(data, function (index, data) {

      if (data.user == user) {
        var possiblewin = (+data.amount+(data.amount*data.offer));
        possiblewin = possiblewin.toFixed(2);
        
        if (!entry.address) entry.address = 0;
        if (!entry.bal) entry.bal = 0;
        total = (+data.amount+total);

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
        } else if (data.direction == 'Put') {
          var arrowhtml = '<span class="red glyphicon glyphicon-arrow-down"></span>';
        }

        if (data.currency == 'BTC') { 
          currencyicon = '<td>m<i class="fa fa-btc"></i>'; 
        } else if (data.currency == 'CAD') {
          currencyicon = '<td>Cad<i class="fa fa-dollar"></i>'; 
        } else {
          currencyicon = '<td><i class="fa fa-dollar"></i>'; 
        }


        allactive = allactive + '<tr class="bgtransition usertrade" id="trade'+index+'">';
        allactive = allactive + '<td class="symbol"><a class="keystonelink" id="'+data.symbol+'">'+data.symbol+':<span class="keystone keystone'+data.symbol+'">'+price[data.symbol]+'</span></a></td>';
        allactive = allactive + '<td>'+arrowhtml+' <span class="direction">'+data.direction+'</span><span class="from"> from</span> <span class="tradeprice">'+data.price+'</span></td>';
        allactive = allactive + '<td>'+currencyicon+data.amount+'</td>';
        allactive = allactive + '<td>'+currencyicon+possiblewin+'</td>';
                    //'<td title="Expires: '+thisdate+' '+thistime+'">'+thistime+'</td>'+
                    // if (nexttrade[0] == 0 && nexttrade[1] < 60) {
                    // allactive = allactive + '<td><i class="fa fa-lock"></i></td>';
                    // } else {
                    // allactive = allactive + '<td><i class="fa outcomeindicator"></i></td>';
                    // }
      allactive = allactive + '</tr>';
        //     if (lastprice > entry[1]) {
        //   $('#trade'+index+'').removeClass('redbg').addClass('greenbg');
        // } else if (lastprice < entry[1]) {
        //   $('#trade'+index+'').removeClass('greenbg').addClass('redbg');
        // } else {
        //   $('#trade'+index+'').removeClass('greenbg').removeClass('redbg');
        // }
      }

    });
    allactive = allactive + '</div></div></div></tbody></table></div>';
    $('.allactive').html(allactive);
    $('.totalamount').html(total);
}
$(function() { 


});