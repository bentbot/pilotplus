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
require(['modules/chat']);
require(['modules/xp']);
require(['modules/referrals']);
require(['modules/loginmodal']);


var socket = io.connect('https://pilot.plus:3030', {secure: true});
var user, email, currency, dualfactor, verified, userid, option, price, expires, direction, userdeposit, ratio, percentage, xp, level, specialtitle;
var $users = $('#users ul');
var $chatOutput = $('.messages');
var $chatInput = $('#chat input');
var $messagesOutput = $('.messages');
var $messagesInput = $('#chat input');
var sitetitle = 'Pilot+';
var myName = '';
var status = true;
var lastpass = false;
var userpage = true;
var card = false;
var target = 0;
var offer = 0;
var bal = 0;
var percentage = 0;
var tradecount = 0;
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
var currentpage = false;
var date, percentagecomplete = 0, lasthistoric = null;
var activeTradeUpdater = null, historicTradeUpdater = null;

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
socket.on('socklog', function (data) {
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

socket.on('tradecount', function (data) {
  tradecount = data;
  $('.tradecount').html(data);
});
// Socket and Trade Timing Functions

socket.on('servertime', function (data) {
  date = new Date(data);
  $('.servertime').html(date.customFormat( "#hhh#:#mm#:#ss#" ));
});


var selectedtime;
socket.on('nexttrade', function (data) {
  // Define Global Controls
  stoptrading = data.stoptrading;
  tradeevery = data.next;
  nexttrade = data;
  var show = '';

  // Run each time every second or so
  $.each(tradeevery, function (t, time) {
    // Update appropriate time containers
    $('.tradetime[data-time="'+time.time+'"]').html(time.string);
    // Observe selected symbols
    for (var i = selectedsymbol.length - 1; i >= 0; i--) {
      // Set the time selected from a symbolic field
      selectedtime = $('.'+selectedsymbol[i]+' .time').val();
      // Set the selected time if not already filled
      if (!selectedtime && t == 0) selectedtime = time.time;
      // Check if this specific time is the selected one
      if (selectedtime == time.time) {
        // Animation to lock out / stop trading
        $('.'+selectedsymbol[i]+' .flash').css('transition', 'opacity 0.5s, width '+stoptrading+'s').css('-webkit-transition', 'opacity 0.5s, width '+stoptrading+'s');
        if ( time.seconds <= stoptrading || stoptrading == 0 ) {
          $('.'+selectedsymbol[i]+' .flash').css('opacity', 1).css('width', '115%');
          $('.tradeprogress').addClass('progress-bar-danger');
        } else {
          $('.'+selectedsymbol[i]+' .flash').css('opacity', 0).css('width', '0%');
          $('.tradeprogress').removeClass('progress-bar-danger');
        }

        // Show the trade time remaining specific to each symbol
        var show = '<li data-time="'+time.time+'" data-seconds="'+time.seconds+'" alt="'+time.label+'">'+time.string+'</li>';
        $('.'+selectedsymbol[i]+'_tradetimes').html(show);
        
        tradeprogress = (time.seconds / time.time ) * 100;
        $('.tradeprogress').attr('aria-valuenow', tradeprogress).width(tradeprogress+'%');

      }
    }

  }); // Each Trade, Every Time
  
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
        classes = 'red ';
        $('.keystone'+data.symbol).addClass('red').removeClass('green');
      } else if (price[data.symbol] < data.price) {
        classes = 'green ';
        $('.keystone'+data.symbol).removeClass('red').addClass('green');
      } else {
        classes = '';
        $('.keystone'+data.symbol).removeClass('red').removeClass('green');
      }

      if ( $.inArray(data.symbol, selectedsymbol) > -1) { classes = classes + 'selected '; }
      price[data.symbol] = data.price;

      // Render menus
      if (data.price) menu = menu + '<li class="keystone keystonelink " data-type="'+data.type+'" data-symbol="'+data.symbol+'"><a>'+data.name+': <span class="keystone'+data.symbol+' '+classes+'">'+data.price+'</span></a></li>'; 

      // Render sidebar
      var search = '';
      if ($('.symbolsearch').val()) search = $('.symbolsearch').val();

      // Add the type of symbol titles
      if (lasttype != data.type && data.price && !search) {
        sidebar = sidebar + '<div class="sidebar-title"> <span data-translate="trade">'+data.type+'</span></div>'
        lasttype = data.type;
      }

      // Add sidebar items
      
      if ( data.price && search.length > 0 ) {
        classes = classes + 'hide ';
      }
      
      sidebar = sidebar + '<li class="keystone keystonesidebar keystonelink keystone'+data.symbol+' '+classes+'" data-type="'+data.type+'" data-symbol="'+data.symbol+'"><div class="name">'+data.name+'</div><div class="price">'+data.price+'</div>'; 

      // Add any active trades below the symbol
      if ( activetrades.length > 0 && prefs["sidebartrades"] != false) {

        sidebar = sidebar + '<ul class="'+data.symbol+'-trades trades">';

        // Cycle through active trades
          $.each(activetrades, function(i, active) {

            // Cycle through colors and directions
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

              sidebar = sidebar + '<li class="'+activeclasses+' sidebartrade keystonelink" data-symbol="'+active.symbol+'"><span style="float: left;">'+currencySwitch(active.currency)+' '+active.amount+'</span><span style="float:right;">'+direction+'</span></li>';
            
            }

          }); // Trades loop   
      }


      // Close the symbol
      sidebar = sidebar + '</li>';
      
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

function showloginfield(user, bal) {

  if (user) {

    $('.btnuser.username').html(user);
    $('.btnfinance.userbal').html(bal);

      var login = '<div type="button" style="height: 31px;" class="btn btnuser username" tabindex="3">'+user+'</div>';

      if (bal) {
        login = login + '<div style="height: 31px;" class="btn userbal btnfinance" tabindex="2">'+bal+'</div>';
      } else { 
        login = login + '<div style="height: 31px;" class="btn userbal btnfinance" tabindex="2">--.-</div>';
      }
    $('.topright').addClass('accountinfo');
  } else {
    
    var login = '<input type="text" tabindex="3" autocomplete="off" class="form-control headerlogin headerusername" name="username" id="username" placeholder="Username">' +
    '<input type="password" tabindex="4" autocomplete="off" class="form-control headerlogin headerpassword" name="password" id="password" placeholder="Password">' +
    '<div data-translate="2factor" class="header2factor">2 Factor Security</div>'+
    '<input type="text" tabindex="5" autocomplete="off" class="form-control headerauthy" name="authy" id="authy" placeholder="*******">'+
    '<button type="submit" tabindex="2" class="btn loginbtn" data-translate="login">Login</button>';
    
    // var login = '<div class="loginwindow hidden">'+
    //   '<div class="loginpane">'+
    //     '<p data-translate="pleaselogin">Please enter your username and password.</p>'+
    //     '<input type="text" tabindex="3" autocomplete="off" class="form-control" name="email" id="email" placeholder="Username">'+
    //     '<input type="password" tabindex="4" autocomplete="off" class="form-control" name="password" id="password" placeholder="Password">'+
    //     '<button type="submit" tabindex="2" class="btn loginbtn" data-translate="login">Sign In</button>'+
    //     '<button type="submit" tabindex="2" class="btn loginbtn" data-translate="login">Sign Up</button>'+
    //   '</div>'+
    //   '<div class="dualauthpane">'+
    //     '<p data-translate="2factor" class="header2factor">2 Factor Security</p>'
    //     '<input type="text" tabindex="5" autocomplete="off" class="form-control" name="authy" id="authy" placeholder="*******">'+
    //     '<button type="submit" tabindex="2" class="btn loginbtn" data-translate="login">Login</button>'+
    //   '</div>'+
    // '</div>';

    $('.topright').addClass('loginform');
  }

  $('.topright').html(login);
  
}
function signup(un, em, pwd, term, cb) {
  var path = "adduser/"+un+"/"+em+"/"+pwd;
  if (un && em && pwd && term && un.length >= 3) {
    $.ajax({
      url: path,
      cache: false
    }).done(function( resp ) {
      cb(resp);
      if (resp == 'OK') {
        login(un, pwd, function(resp) {
          if (resp == "OK") setTimeout( function() { document.location.reload(); }, 750);
        })
      }
    });
  } else {
    cb('Error');
  }
}


function login(username, password, authy, cb) {
  
  if (!username) var username = $("#username").val();
  if (!password) var password = $("#password").val();
  if (!authy) var authy = $("#authy").val();
  if (!cb) var cb = loginCallback;  

  if (username.length > 0 && password.length > 0) {
  
    if (authy.length > 0) {
      var url = "/login/" + username + "/" + password + '/' + authy;
    } else {
      var url = "/login/" + username + "/" + password + '/false';
    } 

    $.ajax({
      url: url,
      cache: false
    }).done(function( resp ) {
      cb(resp);
    });
  }

}


function loginCallback(html) {
  // Handle the login responce
  switch ( html ) {
    case "Two Factor":

      $('.loginbtn').removeClass('btn-warning').addClass('btn-yellow').html("<img src='/assets/img/com.authy.authy.png' height='30' width='30'>");            
      $('.headerlogin').hide();
      $('.headerpassword').hide();
      $('.header2factor').show();
      $('.headerauthy').show().focus();

    break;
    case "Authy Error":
      
      $('.loginbtn').removeClass('btn-yellow').addClass('btn-warning');
    
    break;
    case "OK":
      
      $('.loginbtn').removeClass('btn-warning').removeClass('btn-yellow').addClass('btn-success').html("<i class='fa fa-check'></i>");
      setTimeout( function() { document.location.reload(); }, 750);

    break;
    default:

      $('.loginbtn span').removeClass('hidden');
      $('.loginbtn').removeClass('btn-warning').addClass('btn-danger').html("<i class='fa fa-times'></i><span>"+ html +"</span>");
      setTimeout( function() { 
        $('.loginbtn span').addClass('hidden');
        $('.loginbtn').removeClass('btn-warning').removeClass('btn-danger').html('Login');
      }, 2500);

    break;

  }
}



function loadTrades(displaysymbols, guest) {
 $('.hook').html('');
  
  var html = '<div class="container" style="padding: 4px 0px;">'+
  '<ul class="grid">';
    var row = 1;

      // Trade timer
        if (prefs["bigtimer"] == true) {
          html = html + '<li class="tradetimer" data-row="2" data-col="1" data-sizex="4" data-sizey="1">'+
            '<div class="header progress progress-striped" style="margin:0px;">'+
              '<div class="progress-bar tradeprogress" role="progressbar" aria-valuenow="'+percentagecomplete+'" aria-valuemin="0" aria-valuemax="100" style="width: '+percentagecomplete+'%;">'+
              '</div>'+
            '</div>'+
          '</li>';
        }

        // Active trade table container
        html = html + '<li class="tradestable" data-row="'+row+'" data-col="1" data-sizex="4" data-sizey="2"><div class="usertrades"><div class="header" data-translate="noactivetrades">No Active Trades</div></li>';

        if (prefs['statistics'] != false) {
            html = html + '<li class="xp" data-row="'+row+'" data-col="1" data-sizex="2" data-sizey="2"></li>';
        }
    
        if (prefs['chat'] != false) { 
            html = html + '<li class="chat" data-row="'+row+'" data-col="2" data-sizex="2" data-sizey="2"></li>';
        }
    
        
            
      html = html + '</ul>'+        // End .grid
      '<div class="clear"></div>';  // Clear floats
      html = html + '</div>';       // Close .container
    
    // Render the output
    $('.hook').html(html);

    // Update Chat messages and statistics
    if (prefs['chat'] != false && messages.length > 0) showChat(messages);
    if (prefs['statistics'] != false) displayxp();
  
    // Get the histroic data
    if (user && prefs['historictrades'] != false) {
        socket.emit('historictrades', { limit: 5, skip: 0 });
        socket.on('historictrades', function (data) {   
          //loadHistory(data);
          historicTrades(data);
          showhistoric(data);
        });
    }

    // Load the main options display
    displayOptions(displaysymbols);
    updateOption(displaysymbols);
    
}

if (!user) {

  var limittrades = 30;
  var skiptrades = 0;

//  setInterval( function() { socket.emit('publichistorictrades', { limit: limittrades, skip: skiptrades }); }, 1000);
//
//  var displayhistoric = true;
//
//  socket.on('publichistorictrades', function (trades) {
//    if (displayhistoric) {
//      showhistoric(trades);
//      displayhistoric = false;
//    }
//  });

//    showloginfield();
//    showGuest();
    
  socket.on('allactivetrades', function (data) {
    //showactive(data);
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

}

function loadDeposit() {
  $('.hook').html('');

  var page = '<div class="container"><div class="notif"></div>'+
    '<div class="wallet">'+
    '</div>'+
    '<div class="wallettx">'+
    '</div></div>';
  $('.hook').html(page);

  var lastdata = false;

   socket.emit('wallet');
   socket.on('wallet', function (data) {
    console.log(data);
    $.get('/view/wallet', function (data, status) {
      $('.wallet').html(data);
    });
    if (!data.error) {
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
    '<p class="preloader"><i class="fa fa-circle-o-notch fa-spin fa-2x fa-fw"></i></p>'+
    '</div>'+
  '</div>';
  $('.hook').html(page);

  if (activeTradeUpdater != null) clearInterval(activeTradeUpdater);
    
  historicTradeUpdater = setInterval( function() {
    socket.emit('historictrades', { limit: 25, skip: 0, historicTrades: true });
  }, 1000);

   socket.on('historictrades', function (data) {
       showhistoric(data);
   });

}

function loadProfile() {
  $.get('/view/profile', function (data, status) {
    $('.hook').html(data);
  })
}

// Page Changer
    socket.on('loadpage', function (data) {
      currentpage = data.page;
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
        case 'account':
          loadProfile();
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
      myName = data.hello;
      userid = data.id; //
      email = data.email; //
      currency = data.currency;
      userdeposit = data.btc;
      dualfactor = data.dualfactor;
      verified = data.verified;
      ratio = data.ratio;
      percentage = data.percentage;
      lastpass = data.lastpassword;
      if (percentage == null) percentage = 0;
      level = data.level;
      showloginfield(data.hello);
      currencysymbol = currencySwitch(data.currency);
      if (user) $('.applytrade').data('toggle','none').data('target','#blank');
    });
    // Logout
    socket.on('logout', function (data) {
      window.location = '/logout';
    });

    // Logging
    socket.on('log', function (data) {
      console.log(log);
    });

    socket.on('myName', function (data) {
        myName = data.name;
    });

    // Messages
    socket.on('messages', function (data) {
        messages = data;
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

    var percentage = 0, numerator = '';
    socket.on('percentage', function (data) {
      percentage = data;
      var percentagechange = '', color = '';
      if (percentage > 0) {
        numerator = '+';
        color = 'green';
      } else if (percentage < 0) {
        numerator = '-';
        color = 'red';
      }
      $('.percentage').html(percentage);
      $('.percentagestring').html('<span class="'+color+'">'+numerator+percentage+'%</span>');
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
       console.log(lastbal, data.balance)
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
            $('.'+symbol+' .action').val('none');
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
    $('.btnlogo').removeClass('check').addClass('open error');
    $('.btnlogo .label').html('Offline');
  });

  socket.on('reconnect', function () {
    status = true;
    $('.btnlogo').removeClass('open error').addClass('check');
    $('.btnlogo .label').html('Online');
    setTimeout(function(){
      $('.btnlogo').removeClass('check');
      $('.btnlogo .label').html('Options');
      if ( $('.menu').hasClass('open') ) $('.btnlogo').addClass('open');
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

var windowInFocus = true;
socket.on('tradeoutcome', function (data) {
  if (data.user == user) {
    showSplit(data.x, data.y, data.z, data.change);
    var windowAnnounceCheck = setInterval( function() {
      if (windowInFocus) {
        clearInterval(windowAnnounceCheck);
        setTimeout( function() {
          showXP(data.xp, data.lastxp, data.nextxp, data.change);
          setTimeout( function() {
            showSymbols();
          },data.change)
        }, data.change);
      }
    }, 500);
  }
  $('.trades li').css('left', '100%');
});

socket.on('chart', function (data) {
  //console.log(data);
  loadChart(data);
});

socket.on('flags', function (data) {
  console.log(data);
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
      newChat([{ from: data.from, to: data.to, message: data.message }]);
    });

    socket.on('message', function (data) {
      newChat([{ from: data.from, to: data.to, message: data.message }]);
    });

    function action(i) {
      socket.emit('action', i);
    }

    function chat(message) {
    var msg = { from: myName, to: null, message: message }
      socket.emit('chat', msg);
      newChat([msg]);
    }
    function message(to, message) {
      msg = new Array({
        from: user,
        to: to,
        message: message
      });
      socket.emit('message', msg);
      newChat(msg);
    }

function updateOption(symbol) {
    
        var time = 300000,
            historics = 5; 

        if ($('.chart-time.active').length > -1) time = $('.chart-time.active').attr('data-time');

        socket.emit('chart', {symbol: symbol, time: time});


        if (historicTradeUpdater != null) clearInterval(historicTradeUpdater);
        activeTradeUpdater = setInterval( function() {
            socket.emit('historictrades', {user: user, limit: historics});
        }, 1000);

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

      socket.on(symbol+'_updatedchart', function (data) {
        updateChart(symbol, data);
        // console.log('updating chart : '+symbol + ' : ' + data);
      });

}

// $("[data-translate]").jqTranslate('languages/index');
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
// String contain / find
if (!('contains' in String.prototype)) {
    String.prototype.contains = function (str, startIndex) {
        "use strict";
        return -1 !== String.prototype.indexOf.call(this, str, startIndex);
    };
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
