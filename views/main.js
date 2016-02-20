var displayOptions = require(['modules/displayoptions']);
var showactive = require(['modules/activetrades']);
require(['modules/allactivetrades']);
require(['modules/historictrades']);
require(['modules/highchart']);
require(['modules/protodate']);
require(['modules/prefs']);
require(['modules/remote']);
require(['modules/local']);
require(['modules/guest']);
require(['modules/wallet']);
require(['modules/withdrawal']);
require(['modules/security']);
require(['modules/terms']);
require(['modules/prefs']);
require(['modules/chat']);
require(['modules/xp']);
require(['modules/referrals']);

var socket = io.connect('https://pilot.plus:3030', {secure: true});
var user, email, currency, dualfactor, verified, userid, option, price, expires, direction, userdeposit, ratio, percentage, xp, level, specialtitle;
var $users = $('#users ul');
var $chatOutput = $('.messages');
var $chatInput = $('#chat input');
var $messagesOutput = $('.messages');
var $messagesInput = $('#chat input');
var sitetitle = 'Pilot+';
var status = true;
var lastpass = false;
var userpage = true;
var card = false;
var target = 0;
var offer = 0;
var bal = 0;
var autocolor = 1;
var autotrader = new Array();
var tradingopen = true;
var publictrades = true;
var stoptrading = 0;
var activetrades = {};
var nexttrade = {};
var messages = {};
var expiretime = '0:00';
var displaySymbols = new Array();
var chartinit = new Array();
var prefs = new Array();
var tradeevery = 5;
var minsx, progress, symbols;
var price = new Array();
var updatekeystones = true;
var publictrades = false;
var date, percentagecomplete;

socket.on('stripe', function (data) {
  Stripe.setPublishableKey(data.publishableKey);
});
socket.on('messages', function (data) {
  messages = data;
});
socket.on('sitetitle', function (data) {
  sitetitle = data;
});
socket.on('sitedescription', function (data) {
  sitedescription = data;
});
socket.on('tradeevery', function (data) {
  tradeevery = data;
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
socket.on('movingaverage', function (data) {
  console.log(data);
})
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
  offer = data;
});

socket.on('servertime', function (data) {
  date = new Date(data);
  $('.servertime').html(date.customFormat( "#hhh#:#mm#:#ss#" ));
});

var selectedtime;
socket.on('nexttrade', function (data) {
  stoptrading = data.stoptrading;
  tradeevery = data.next;
  nexttrade = data;
  var show = '';
  $.each(tradeevery, function (t, time) {
  $('.tradetime[data-time="'+time.time+'"]').html(time.string);
    for (var i = selectedsymbol.length - 1; i >= 0; i--) {
      selectedtime = $('.'+selectedsymbol[i]+' .time').val();
      //var selectedtime = $('.'+symbol+' .time').val();
      if (!selectedtime && t == 0) selectedtime = time.time;
      if (selectedtime == time.time) {
        $('.'+selectedsymbol[i]+' .flash').css('transition', 'opacity 0.5s, width '+stoptrading+'s').css('-webkit-transition', 'opacity 0.5s, width '+stoptrading+'s');
        if ( time.seconds <= stoptrading ) {
          $('.'+selectedsymbol[i]+' .flash').css('opacity', 1).css('width', '115%');
        } else {
          $('.'+selectedsymbol[i]+' .flash').css('opacity', 0).css('width', '0%');
        }
        var show = '<li data-time="'+time.time+'" data-seconds="'+time.seconds+'" alt="'+time.label+'">'+time.string+'</li>';
        $('.timefield ul').html(show);
        
      }
    }
  });
  
});

var currencies = new Array();
socket.on('currencies', function (data) {
  currencies = new Array();
  $.each(data, function(i, data) {
    var currencyname = data.symbol;
    currencies.push(currencyname);
  });
});

var defaultsymbol, selectedsymbol;
socket.on('defaultsymbol', function (data) {
  defaultsymbol = data;
  if (window.location.hash) {
    selectedsymbol = new Array( String(window.location.hash.replace('#','')) );
  } else {
    selectedsymbol = new Array( defaultsymbol );
  } 
});

var price = [], lastprice, lasttype, lastsymbols, defaultsymbol, selectedsymbol;
socket.on('symbols', function (data) {
  var menu = '', sidebar = '',
  symbols = new Array();

  $.each(data, function(i, data) {
        
      if (!defaultsymbol && i==0) defaultsymbol = data.symbol;
      if (!selectedsymbol) selectedsymbol = new Array( data.symbol );
      
      // Update global variables
      if (updatekeystones) $('.keystone'+data.symbol).html(data.price);

      // Sort colored labels
      var classes = '';
      
      if (price[data.symbol] > data.price) {
        classes = 'red';
        $('.keystone'+data.symbol).addClass('red').removeClass('green');
      } else if (price[data.symbol] < data.price) {
        classes = 'green';
        $('.keystone'+data.symbol).removeClass('red').addClass('green');
      } else {
        classes = '';
        $('.keystone'+data.symbol).removeClass('red').removeClass('green');
      }
      
      if ( !selectedsymbol.indexOf(data.symbol) ) { classes = classes + ' selected'; }
      price[data.symbol] = data.price;

      var search = $('.symbolsearch').val();

      // Render menus
      if (lasttype != data.type && data.price && !search) {
        sidebar = sidebar + '<div class="sidebar-title"> <span data-translate="trade">'+data.type+'</span></div>'
        lasttype = data.type;
      }

      if ( data.price && search ) {
        sidebar = sidebar + '<li class="keystone keystonesidebar keystonelink keystone'+data.symbol+' '+classes+'" data-type="'+data.type+'" data-symbol="'+data.symbol+'"><div class="name">'+data.name+'</div><div class="price">'+data.price+'</div></li>'; 
      }

      if (data.price) menu = menu + '<li class="keystone keystonelink " data-type="'+data.type+'" data-symbol="'+data.symbol+'"><a>'+data.name+': <span class="keystone'+data.symbol+' '+classes+'">'+data.price+'</span></a></li>'; 
      if (data.price && !search) sidebar = sidebar + '<li class="keystone keystonesidebar keystonelink keystone'+data.symbol+' '+classes+'" data-type="'+data.type+'" data-symbol="'+data.symbol+'"><div class="name">'+data.name+'</div><div class="price">'+data.price+'</div></li>'; 

      if (activetrades.length > 0) sidebar = sidebar + '<ul class="'+data.symbol+'-trades trades">';

      // Cycle through active trades in the menu
        $.each(activetrades, function(i, active) {

          var activeclasses, direction;
          
          if (active.direction == 'Put') {
            direction = '<span class="red glyphicon glyphicon-arrow-down"></span> '+active.price;
            if (price[active.symbol] > active.price) {
              activeclasses = 'red';
            } else if (price[active.symbol] < active.price) {
              activeclasses = 'green';
            } else {
              activeclasses = '';
            }
          } else if (active.direction == 'Call') {
            direction = '<span class="green glyphicon glyphicon-arrow-up"></span> '+active.price;
            if (price[active.symbol] < active.price) {
              activeclasses = 'red';
            } else if (price[active.symbol] > active.price) {
              activeclasses = 'green';
            } else {
              activeclasses = '';
            }
          }

          if (active.symbol == data.symbol) {
            //sidebar = sidebar + '<li class="'+activeclasses+' sidebartrade keystonelink" data-symbol="'+active.symbol+'"><span style="float: left;">'+currencySwitch(active.currency)+' '+active.amount+'</span><span style="float:right;">'+direction+'</span></li>';
          }

        });

      sidebar = sidebar + '</ul>';


      // Check and adjust the fontsize of buttons
      // if ( $('.keystone'+data.symbol).html().length > 7) {
      //   $('.keystone'+data.symbol+'.keystone-btn').css('font-size', '11px !important');
      // } else {
      //   $('.keystone'+data.symbol+'.keystone-btn').css('font-size', '12px');
      // }

      $('.keystones').html(menu);
      $('.sidebar-symbols').html(sidebar);
  });
});

function showloginfield(username, bal) {

  if (username) {
    $('.btnuser.username').html(username);
    $('.btnfinance.userbal').html(bal);
      var login = '<div type="button" style="height: 31px;" class="btn btnuser username" tabindex="3">'+username+'</div>';
      if (bal) {
        login = login + '<div style="height: 31px;" class="btn userbal btnfinance" tabindex="2">'+bal+'</div>';
      } else { 
        login = login + '<div style="height: 31px;" class="btn userbal btnfinance" tabindex="2">--.-</div>';
      }
    $('.topright').addClass('accountinfo');
  } else {
    var login = '<input type="text" autocomplete="off" class="form-control headerlogin headerusername" name="email" id="email" placeholder="Username">' +
    '<input type="password" autocomplete="off" class="form-control headerlogin headerpassword" name="password" id="password" placeholder="Password">' +
    '<div data-translate="2factor" class="header2factor">2 Factor Security</div>'+
    '<input type="text" autocomplete="off" class="form-control headerauthy" name="authy" id="authy" placeholder="*******">'+
    '<button type="submit" class="btn loginbtn" data-translate="login">Login</button>';
    $('.topright').addClass('loginform');
  }

  $('.topright').html(login);
  
}
function loadTrades(displaysymbols, guest) {
 $('.hook').html('');
  
  var page = '<div class="container" style="padding: 4px 0px;">'+
  '<ul class="grid">';
    var row = 1;
        if (prefs.timer != false) {
          // page = page + '<li class="tradetimer" data-row="2" data-col="1" data-sizex="4" data-sizey="1">'+
          //   '<div class="header progress progress-striped" style="margin:0px;">'+
          //     '<div class="progress-bar progress-bar-warning tradeprogress" role="progressbar" aria-valuenow="'+percentagecomplete+'" aria-valuemin="0" aria-valuemax="100" style="width: '+percentagecomplete+'%;">'+
          //   '</div>'+
          //   '</div>'+
          // '</li>';
        }

        page = page + '<li class="tradestable" data-row="'+row+'" data-col="1" data-sizex="4" data-sizey="2"></li>'+

      '</ul>'+
      '<div class="clear"></div>'+
      '<div class="guest"></div>';

    var page = page + '</div>';
  $('.hook').html(page);
  displayOptions(displaysymbols);
  updateOption(displaysymbols);
  if (user && prefs['historictrades'] != false) {
    socket.emit('historictrades', { limit: 5, skip: 0 });
    socket.on('historictrades', function (data) {
      $('li.recenttrades').remove();
      $('.grid').append('<li class="recenttrades" data-row="'+row+'" data-col="1" data-sizex="4" data-sizey="2"></li>'); row++;
      showhistoric(data);
    });
  }
  if (user && prefs['statistics'] != false) {
    $('.grid').append('<li class="xp" data-row="'+row+'" data-col="2" data-sizex="2" data-sizey="2"></li>'); row++;
    displayxp();
  }
  if (prefs['chat'] != false) {
    $('.grid').append('<li class="chat" data-row="'+row+'" data-col="1" data-sizex="2" data-sizey="2"></li>'); row++;
    showChat();
  }
  
  if (!user) {
    $('.grid').append('<li class="recenttrades guesttrades" data-row="'+row+'" data-col="2" data-sizex="2" data-sizey="2"></li>'); row++;
    showloginfield();
    showGuest();
  } 

}
if (!user) {
  setInterval( function() { socket.emit('publictrades'); }, 1000);
  socket.on('publictrades', function (trades) {
    showactive(trades.active);
    showhistoric(trades.historic);
  });
}
function loadAdmin() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="col1 sync">'+
    '<div class="local">'+
    '</div>'+
    '<div class="allactive">'+
    '</div>'+
    '</div>'+
    '<div class="col2 sync">'+
    '<div class="remote">'+
    '</div>'+
    '</div>'+
    '</div>';
  $('.hook').html(page);

  socket.on('serverbalance', function (data) {
    $('.bitcoinconnectionerr').remove();
    if (data.error) {
      $('.notif').append('<div class="bitcoinconnectionerr alert alert-danger" style="margin-top: 20px;" role="alert"><b>Could not connect to Bitcoin server</b> - Remote balances remain unavailable</div>')
    } else {
    }
  });

  socket.on('localbals', function (data) {
    showLocalBals(data);
  });
  //showRemoteBals(data);
  socket.on('remotebals', function (data) {
    showRemoteBals(data);
  });

  socket.on('allactivetrades', function (data) {
    showAllActive(data);
  })

}

function loadDeposit() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="wallet">'+
    '</div>'+
    '<div class="wallettx">'+
    '</div>'+
    '</div>';
  $('.hook').html(page);

  var lastdata = false;
   socket.emit('cards', true);
   socket.on('wallet', function (data) { // btc address
    if (data.currency!=lastdata) {
      lastdata = data.currency;
      showWallet(data);
      btcWalletUpdate(data);
      walletSendUpdate(data);
      showCards(data);
    }
  });

  socket.on('cards', function (data){
    showCards();
  })

  socket.on('wallettx', function (data) { // raw json tx
    showTx(data);
  });
}

function loadSecurity() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="csec">'+
    '</div>'+
    '<div class="loginattempts">'+
    '</div>'+
    '</div>';
  $('.hook').html(page);
  showSecurity();

  socket.on('logins', function (data) {
    showLoginattempts(data);
  });
}function loadTerms() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="termstop"></div>'+
    '<div class="terms">'+
    '</div>'+
    '<div class="guest">'+
    '</div>'
    '</div>';
  $('.hook').html(page);
  showTerms();
  showGuest();
}function loadPrefs() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="prefs"></div>'+
    '</div>';
  $('.hook').html(page);
  showPrefs();
}function loadReferrals() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="referrals"></div>'+
    '<div class="refslist"></div>'+
    '</div>';
  $('.hook').html(page);
  showReferrals();
}
function loadSend() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="walletsend">'+
    '</div>'+
    '<div class="wallettx">'+
    '</div>'+
    '</div>';
  $('.hook').html(page);
  
  var lastdata;
  socket.on('wallet', function (data) {
    if (lastdata != data.currency) showWalletSend(data);
    walletSendUpdate(data);
    lastdata = data.currency;
  })
  socket.on('wallettx', function (data) { // raw json tx
    data.reverse();
    showTx(data);
  });
}

function loadHistory() {
  $('.hook').html('');
  var page = '<div class="container" style="padding: 4px 0px;">'+
    '<div class="notif"></div>'+
    '<div class="allhistorictrades">'+
    '</div>'+
    '</div>';
  socket.emit('historictrades', { limit: 30, skip: 0 });
  socket.on('historictrades', function (data) {
    historicTrades(data);
  });
  $('.hook').html(page);
}


    socket.on('loadpage', function (data) {
      //console.log('loadpage ' + data.page);
      switch (data.page) {
        case 'trade':
          if (userpage == 'trade') {
            displayOptions([data.symbol]);
          } else {
            loadTrades([data.symbol]);
          }
          updateOption(data.symbol);
        break;
        case 'prefs':
          loadPrefs();
        break;
      case 'deposit':
          loadDeposit();
        break;
      case 'send':
          loadSend();
        break;
      case 'history':
          loadHistory();
        break;      
        case 'referrals':
          loadReferrals();
        break;
      case 'security':
          loadSecurity();
        break;
      case 'terms':
          loadTerms();
        break;
        case 'admin':
          loadAdmin();
        break;
      }
      userpage = data.page;
    });

    // Some symbols have special characters
    function symbolSwitch(symbol) {
        switch (symbol) {
          case '^DJI':
            symbol = 'DOW'
          break;
          case 'CLM15.NYM':
            symbol = 'OIL'
          break;
          case 'GCZ15.CMX':
            symbol = 'GOLD'
          break;
          case '^GSPC':
            symbol = 'SP500'
          break;
          case '^IXIC':
            symbol = 'NASDAQ'
          break;
          case '^SLVSY':
            symbol = 'SILVER'
          break;
        }
        return symbol;
    }
    
    var currencysymbol = '<i class="fa fa-dollar"></i>';
    function currencySwitch(currency) {
      switch( currency ) {
        default:
          currencysymbol = '<i class="fa fa-dollar"></i>';
        break;
        case 'BTC':
          currencysymbol = 'm<i class="fa fa-btc"></i>';
        break;
        case 'EUR':
          currencysymbol = '<i class="fa fa-eur"></i>';
        break;
        case 'GBP':
          currencysymbol = '<i class="fa fa-gbp"></i>';
        break;
        case 'RUB':
          currencysymbol = '<i class="fa fa-rub"></i>';
        break;
      }
      return currencysymbol;
    }

    function page(name, symbol) {
      //console.log('changepage '+name+' '+symbol);
      socket.emit('page', { page: name, symbol: symbol });
    }

    socket.on('hello', function (data) {
      $('.username').html(data.hello);
      
      user = data.hello;
      userid = data.id; //
      email = data.email; //
      currency = data.currency;
      userdeposit = data.btc;
      dualfactor = data.dualfactor;
      verified = data.verified;
      ratio = data.ratio;
      percentage = data.percentage;
      lastpass = data.lastpassword;
      if (percentage == null) percentage = 50;
      level = data.level;
      console.log('Hello '+user+' #'+userid+' '+email+' coin:'+currency+' btc:'+userdeposit+' 2f:'+dualfactor+' email:'+verified+' radio:'+ratio+' %:'+percentage);
      showloginfield(data.hello);
     currencysymbol = currencySwitch(data.currency);
    });
    // Logout
    socket.on('logout', function (data) {
      window.location = '/logout';
    });

    // Get user preferences
    socket.on('get-pref', function (data) {      
      prefs[data.pref] = data.setting;
    });

    var lastbal = 0;
    socket.on('bankbal', function (data) {
      $('.bankbal').html(data);
    });

    var experience = 0, xp = 0;
    socket.on('experience', function (data) {
      if (data > xp) {
        $('.userxp').addClass('green');
      } else if (data < xp) {
        $('.userxp').addClass('red');
      } else {
        $('.userxp').removeClass('green').removeClass('red');
      }
      xp = data;
      if ( data > 999999 ) {
        experience = Math.round(Number(data/1000000))+'m';
      } else if ( data > 9999 ) {
        experience = Math.round(Number(data/1000))+'k';
      } else if ( data > 999 ) {
        experience = data.toLocaleString();
      } else {
        experience = Number(data);
      }
      $('.userxp').html(experience);
    });

    var ratio = 0;
    socket.on('ratio', function (data) {
      ratio = data;
      $('.ratio').html(ratio);
    });

    var percentage = 50;
    socket.on('percentage', function (data) {
      percentage = data;
      $('.percentage').html(percentage);
    });

    var level = 0;
    socket.on('level', function (data) {
      level = data;
      $('.userlevel').html(level);
    });

   var autopage = 0;
   socket.on('userbal', function (data) {
    currencysymbol = currencySwitch(data.currency);
    currency = data.currency;
    switch (data.currency) {
      case 'BTC':
        if (data.balance < 1000) $('.userbal').html('<span style="text-transform:lowercase;margin-right: 2px;">m</span><i class="fa fa-btc"></i> '+data.balance+'').css('padding-top', '25px');
        if (data.balance > 1000) $('.userbal').html('<i class="fa fa-btc"></i> '+data.balance/1000+'').css('padding-top', '25px');
      break;
      case 'USD':
        $('.userbal').html('<div style="font-size: 12px">US</div> <i class="fa fa-usd"></i> '+data.balance+'').css('padding-top', '15px');
      break;
      case 'CAD':
        $('.userbal').html('<div style="font-size: 12px">CAD</div> <i class="fa fa-usd"></i> '+data.balance+'').css('padding-top', '15px');
      break;
      case 'EUR':
        $('.userbal').html('<i class="fa fa-eur"></i> '+data.balance+'').css('padding-top', '25px');
      break;
      case 'GBP':
        $('.userbal').html('<i class="fa fa-gbp"></i> '+data.balance+'').css('padding-top', '25px');
      break;
      case 'RUB':
        $('.userbal').html('<i class="fa fa-rub"></i> '+data.balance+'').css('padding-top', '25px');
      break;
    }
    //showloginfield(data.name, data.balance, data.currency);
    if (data.name) $('.guest').remove();

    //if (data.balance == 0 && autopage < 2) { page('deposit'); autopage++; }
      if (lastbal < data.balance) {
        $('.userbal').addClass("btn-success").removeClass('btn-danger').removeClass('btn-blue');
      } else if (lastbal > data.balance) {
        $('.userbal').addClass("btn-danger").removeClass('btn-success').removeClass('btn-blue');
      } else {
        $('.userbal').removeClass('btn-success').removeClass('btn-danger');
      }

      bal = data.balance;
      lastbal = data.balance;
    });


   // New Trade


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
           $('.apply'+symbol).removeClass('btn-warning').removeClass('btn-danger').removeClass('btn-default').addClass('btn-success').html('<span class="glyphicon glyphicon-ok"></span>');

           setTimeout(function(e){
                $('.call'+symbol).removeClass('btn-warnng').removeClass('btn-default').addClass('btn-success');
                $('.put'+symbol).removeClass('btn-warnng').removeClass('btn-default').addClass('btn-danger');
                $('.'+symbol+' .action').val('none');
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
            },1000);
          });

  socket.on('disconnect', function () {
    status = false;
    $('.btnlogo').removeClass('btn-warning').addClass('btn-danger');
    $('.btnlogo').html('<div class="glyphicon glyphicon-warning-sign"></div> <div data-translate="lostconnection">Lost Connection</div>');
  });
  socket.on('reconnect', function () {
    status = true;
    $('.btnlogo').removeClass('btn-warning').removeClass('btn-danger').addClass('btn-success');
    $('.btnlogo').html('<div class="glyphicon glyphicon-lock"></div> <div data-translate="reconnected">Reconnected</div>');
    setTimeout(function(){
      $('.btnlogo').removeClass('btn-success').removeClass('btn-danger');
      $('.btnlogo').html('<div class="bars"><div class="line one"></div><div class="line two"></div><div class="line three"></div></div>');
    },3000);
  });


  socket.on('tradingopen', function (data) {
    var tradingopen = data;
    //console.log(tradingopen);
  });

socket.on('alertuser', function (data) {
  if (data.colour == 'green') {
    showSuccess(data.message, data.trinket, showSymbols);
  } else if (data.colour == 'red') {
    showDanger(data.message, data.trinket, showSymbols);
  }
});



socket.on('tradeoutcome', function (data) {
  socket.emit('historictrades', { limit: 6, skip: 0 });
  socket.on('historictrades', function (data) {
    historicTrades(data);
  });
  if (data.user == user) {
    showSplit(data.x, data.y, data.z, 7000);
    setTimeout( function() {
      showXP(data.xp, data.lastxp, data.nextxp, 5000);
      setTimeout( function() {
        showSymbols();
      },5000)
    }, 7000);
  }
  $('.trades li').css('left', '100%');
  socket.emit('historictrades', { limit: 5 });
});

socket.on('chart', function (data) {
  //console.log(data);
  loadChart(data);
});

socket.on('flags', function (data) {
  loadFlags(data);
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
    socket.on('chat', function (data) {
      //console.log(data.from+':'+data.message);
      newChat(data.from, data.to, data.message);
    });
    socket.on('message', function (data) {
      newChat(data.from, data.to, data.message);
    });

    function action(i) {
      socket.emit('action', i);
    }

    function chat(message) {
      socket.emit('chat', { from: user, message: message });
      newChat(user,false,message,true);
    }
    function message(to, message) {
      socket.emit('message', {
        from: user,
        to: to,
        message: message
      });
      newChat(user,to,message);
    }

function updateOption(symbol) {

  socket.emit('chart', {symbol: symbol});
  socket.emit('historictrades', {user: user, limit: 5});

  if ($('.chart-flags').hasClass('active')) {
    var time = $('.chart-time.active').attr('data-time');
    socket.emit('flags', {user: user, symbol: symbol, time: time });
  }

  socket.on('activetrades', function (data) {
    if (data != activetrades) {
      showactive(data, nexttrade);
      activetrades = data;
    }
  });

  socket.on('historictrades', function (data) {
    showhistoric(data);
  });

  socket.on(symbol+'_updatedchart', function (data) {
    updateChart(symbol, data);
    // console.log('updating chart : '+symbol + ' : ' + data);
  });

}

$("[data-translate]").jqTranslate('index');
$('.keystones').scrollbox();

$(".timeago").timeago();
require(['modules/onloadui']);

function select_all(el) {
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.select();
    }
}

// Function to add custom formats to dates in milliseconds
Date.prototype.customFormat = function(formatString){
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var dateObject = this;
    YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
    MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=dateObject.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

    h=(hhh=dateObject.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=dateObject.getMinutes())<10?('0'+m):m;
    ss=(s=dateObject.getSeconds())<10?('0'+s):s;
    return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}