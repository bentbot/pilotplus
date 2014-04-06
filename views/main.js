var displayOptions = require(['modules/displayoptions']);
var showactive = require(['modules/activetrades']);
require(['modules/historictrades']);
require(['modules/chart']);
require(['modules/protodate']);
require(['modules/remote']);
require(['modules/local']);
require(['modules/guest']);
require(['modules/wallet']);

  // $.each(symbols, function( index, symbol ) {
    // each something          index, current
  // });

  var dualfactor = false;
    var socket = io.connect('https://vbit.io:3000', {secure: true});
    var user, userid, option, price, expires, direction, userdeposit;
    var $users = $('#users ul');
    var $chatOutput = $('.messages');
    var $chatInput = $('#chat input');
    var $messagesOutput = $('.messages');
    var $messagesInput = $('#chat input');
    var target = 0;
    var autocolor = 1;
    var tradingopen = true;
    var publictrades = true;
    var nexttrade = {};
    var chartinit = new Array();
         socket.on('nexttrade', function (data) {
           data[1] = ('0' + data[1]).slice(-2);
          nexttrade = data;
            if (data[0] || data[1]) {
              $('.expiretime').html(data[0] + ':' + data[1]);
            }
          });
function showloginfield(username) {
if (username) {
  var login = '<div class="btn-group accountinfo" style="padding: 0px;">'+
        '<button type="button" style="height: 31px;" class="btn btn-success btnuser username">'+username+'</button>'+
        '<button type="button" style="height: 31px;" class="btn btn-blue userbal btnfinance"></button>'+
      '</div>';
} else {
  var login = '<div class="btn-group accountinfo" style="padding: 0px; ">' +
        '<div class="input-group input-group-sm loginform">' +
        '<input type="text" autocomplete="off" class="form-control headerlogin headerusername" name="email" id="email" placeholder="Username" style="border-radius: 4px 0px 0px 4px !important;">' +
        '<input type="password" autocomplete="off" class="form-control headerlogin" name="password" id="password" placeholder="Password">' +
        '<button type="submit" style="height: 31px;border-radius: 0px 4px 4px 0px;" class="btn btn-success loginbtn" data-translate="login">Login</button>' +
        '</div>'+
    '</div>';
}
$('.topcontainer .right').html(login);
}
var displaysymbols;
function loadtrades(displaysymbols, guest) {

  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="trading"></div>'+
    '<div class="col1">'+
    '<div class="tradestable">'+
    '</div>'+
    '</div>'+
    '<div class="col2">'+
    '<div class="historictrades">'+
    '</div>'+
    '</div>'+
    '<div class="guest">'+
    '</div>';
    var page = page + '</div>';
  $('.hook').html(page);

  displayOptions(displaysymbols);
  updateOption(displaysymbols);
  if (guest) showGuest();
  if (guest) showloginfield();
}

function loadbalsync() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="col1 sync">'+
    '<div class="local">'+
    '</div>'+
    '</div>'+
    '<div class="col2 sync">'+
    '<div class="remote">'+
    '</div>'+
    '</div>'+
    '</div>';
  $('.hook').html(page);

  socket.on('localbals', function (data) {
    showLocalBals(data);
  });

  socket.on('remotebals', function (data) {
    showRemoteBals(data);
  });

}

function loadDeposit() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    //'<div class="col1">'+
    '<div class="wallet">'+
    '</div>'+
    ///'</div>'+
    //'<div class="col2">'+
    '<div class="wallettx">'+
    '</div>'+
    //'</div>'+
    '</div>';
  $('.hook').html(page);

  socket.on('wallet', function (data) { // btc address
    showWallet(data.address, data.balance);
  });

  socket.on('wallettx', function (data) { // raw json tx
    showTx(data);
  });

}
              //Bitcoin             Euro      Pound    China      Dow     Oil           Gold        Silver      S&P 500   Nasdaq
var symbols = ['BTCUSD', 'BTCCNY', 'EURUSD', 'GBPUSD', 'USDCNY', '^DJI', 'CLK14.NYM', 'GCJ14.CMX', 'SIJ14.CMX', '^GSPC', '^IXIC'];
// var symbols;

// socket.on('symbols', function (data) {
// symbols = data;
// console.log('Symbols: '+symbols);
// });


    socket.on('loadpage', function (data) {
      //console.log('loadpage ' + data.page);
      switch (data.page) {
        case 'trade':
          loadtrades(data.symbol,data.guest);
        break;
        case 'account':
          loadaccount(data.user);
        break;
      case 'deposit':
          loadDeposit();
        break;
        case 'admin':
          loadbalsync();
        break;
      }
    });

    function page(name, symbol) {
      //console.log('changepage '+name+' '+symbol);
      if (user) socket.emit('page', {page: name, symbol: symbol});
      if (!user) socket.emit('page', {page: name, symbol: symbol, guest: true});
    }

    socket.on('hello', function (data) {
      $('.username').html(data.hello);
      showloginfield(data.hello);
      console.log('hello:', data.hello+':id'+data.id);
      user = data.hello;
      userid = data.id; //
      userdeposit = data.btc;
    });
  var lastbal = 0;
   socket.on('bankbal', function (data) {
      $('.bankbal').html(data);
    });

   var autopage = 0;
   socket.on('userbal', function (data) {
    if (data < 1000) $('.userbal').html('m<i class="fa fa-btc"></i>'+data+'');
    if (data > 1000) $('.userbal').html('<i class="fa fa-btc"></i>'+data/1000+'');
    if (data == 0 && autopage < 2) { page('deposit'); autopage++; }
      if (lastbal < data) {
        $('.userbal').addClass("btn-success").removeClass('btn-danger').removeClass('btn-blue');
      } else if (lastbal > data) {
        $('.userbal').addClass("btn-danger").removeClass('btn-success').removeClass('btn-blue');
      } else {
        $('.userbal').addClass("btn-blue").removeClass('btn-success').removeClass('btn-danger');
      }

      lastbal = data;
    });


   socket.on('totalcall', function (data) {
      $('.totalcall').html(data);
    });
   socket.on('totalput', function (data) {
      $('.totalput').html(data);
    });
   socket.on('option', function (data) {
      $('.info h1').html(data);
    });
   socket.on('ratios', function (data) {
      for (var key in data) {
        var obj = data[key];
        key = symbolSwitch(key);
        //console.log(key + obj);
        $('.progress'+key+' .progress-bar').attr('aria-valuetransitiongoal', obj);
        $('.progress'+key+' .progress-bar').progressbar();
      }
    });
   socket.on('offer', function (data) {
      $('.rawoffer').html(data);
      $('.info h1').html(data*100+'%');

    });
   socket.on('servertime', function (data) {
    var date = new Date(data);
      $('.servertime').html(date.customFormat( "#hhh#:#mm#:#ss#" ));
    });
   // New Trade



// Keystones and Prices
   var lastprice, index, symbol;
   var price = {};

  $.each(symbols, function( index, symbol ) {

   socket.on(symbol+'_price', function (data) {
     symbol = symbolSwitch(symbol);
    if (price[symbol] > data){
        $('.keystone'+symbol).addClass('red');
        $('.keystone'+symbol).removeClass('green');
       uitradeico(symbol,0);
      } else if (price[symbol] < data){
        $('.keystone'+symbol).addClass('green');
        $('.keystone'+symbol).removeClass('red');
        uitradeico(symbol,1);
      } else {
        $('.keystone'+symbol).removeClass('red');
        $('.keystone'+symbol).removeClass('green');
      }
      if (price[symbol] != data){
        $('.controls .price .lock').html('');
      }
      $('.keystone'+symbol).html(data);
      //lastprice = data;
      price[symbol] = data;
    });
  });

    $('.showallhistoric').click(function() {
      $('.historictrade').each(function( index ) {
        $(this).addClass('hide');
      });
    });


        socket.on('bank', function (data) {
          console.log('Bank: '+data);
        });



         socket.on('tradeadded', function (symbol) {
          symbol = symbolSwitch(symbol);
           $('.apply'+symbol).removeClass('btn-warning').addClass('btn-success').html('<span class="glyphicon glyphicon-ok"></span>');

           setTimeout(function(e){
                $('.call'+symbol).removeClass('btn-default').addClass('btn-success');
                $('.put'+symbol).removeClass('btn-default').addClass('btn-danger');
                $('#'+symbol+' .direction .action').html('If');
                $('.apply'+symbol).removeClass('btn-success').addClass('btn-default').html('Apply');
            },500);
          });

         socket.on('tradeerror', function (data) {
          symbol = data.sym;
          var err = data.msg;
          symbol = symbolSwitch(symbol);
           $('.apply'+symbol).removeClass('btn-warning').addClass('btn-danger').html('<span  class="glyphicon glyphicon-remove"></span> '+err);

           setTimeout(function(e){
                $('.apply'+symbol).removeClass('btn-danger').addClass('btn-warning').html('Apply');
            },2500);
          });

  socket.on('disconnect', function () {
    var sitename = $('.btnlogo .sitename').html();
    $('.btnlogo').removeClass('btn-warning').addClass('btn-danger');
    $('.btnlogo .sitename').html('<span class="glyphicon glyphicon-warning-sign"></span> <span data-translate="lostconnection">Lost Connection</span>');
  })
  socket.on('reconnect', function () {
    $('.btnlogo').removeClass('btn-warning').removeClass('btn-danger').addClass('btn-success');
    $('.btnlogo .sitename').html('<span class="glyphicon glyphicon-lock"></span> <span data-translate="reconnected">Reconnected</span>');
    setTimeout(function(){
      $('.btnlogo').removeClass('btn-success').removeClass('btn-danger').addClass('btn-warning');
      $('.btnlogo .sitename').html('<span class="glyphicon glyphicon-arrow-up"></span><span class="glyphicon glyphicon-arrow-down"></span>');
    },3000);
  })


  socket.on('tradingopen', function (data) {
    var tradingopen = data;
    //console.log(tradingopen);
  });

socket.on('alertuser', function (data) {
  if (data.color == 'green') {
    showSuccess(data.message, data.trinket, showSymbols);
  } else if (data.color == 'red') {
    showDanger(data.message, data.trinket, showSymbols);
  }
});

socket.on('tradeoutcome', function (data) {
  showSplit(data.x,data.y,data.z,showSymbols);
});

// Proto
    socket.on('listing', function (data) {
     // console.log('listing:', data);
      window.users = data;
      target = 0;
      $users.empty();
      $.each(data, function (index, user) {
        //console.log(arguments);
        $users.append('<li>' + user);
      });
      $users.find('li:first').addClass('selected');
    });
    socket.on('chat', function (message) {
      console.log('chat:', message);
      $messagesOutput.append('<div>' + message);
      $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });
    socket.on('message', function (message) {
      console.log('message', message);
      $messagesOutput.append('<div>' + message +'</div>');
      $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });

    function action(i) {
      socket.emit('action', i);
    }

    function chat(message) {
      socket.emit('chat', message);
    }
    function message(user, message) {
      socket.emit('message', {
        user: user,
        message: message
      });
    }

function updateOption(symbol) {
  socket.on('activetrades', function (data) {
    showactive(data, nexttrade);
  });

  socket.on('historictrades', function (data) {
    showhistoric(data, user, 5);
  });

  socket.on(symbol+'_updatedchart', function (data) {
    updateChart(symbol, data);
  });

  socket.on(symbol+'_chart', function (data) {
    loadChart(symbol, data);
  });
}

$("[data-translate]").jqTranslate('index');
$('.keystones').scrollbox();

$(".timeago").timeago();
require(['modules/onloadui']);