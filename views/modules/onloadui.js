// Sounds
var bottlePop = new buzz.sound( "/assets/ogg/pop.ogg");
var ircBloop = new buzz.sound( "/assets/ogg/ff.ogg");

var tr;
function bottlepop(tx, amount) {
  if (tx != tr) {
    bottlePop.play();
    showSuccess('<i class="fa fa-btc"></i>'+amount+' has been added to your account.', '', showSymbols) 
    tr = tx;
  }
}

// Emoji
emoji.include_title = true;
emoji.img_set = 'apple';
emoji.init_emoticons();
emoji.init_env();

// Trading
$(function() {

  $(".grid").gridster({
    selector: 'li',
    min_cols: 2,
    widget_margins: [10, 10],
    widget_base_dimensions: [585, 585],
    draggable: {
      handle: '.header'
    }
  });

  $('.linktray container').mousewheel(function(e, delta) {
      this.scrollLeft -= (delta * 40);
      e.preventDefault();
  });

  var tradesymbol = new Array();
  if (document.location.hash) {
    var hash = document.location.hash.replace('#','');
    tradesymbol = new Array( hash );
    lastitem = hash;
    page('trade', tradesymbol);
  } else {
    tradesymbol = new Array( defaultsymbol );
    lastitem = defaultsymbol;
    page('trade', tradesymbol)
  }


  $(window).on('scroll', function() {
    var top = $(window).scrollTop();
    var height = $('.globalheader').height();
    if ( top < height ) {
       var padding = height-top;
    } else {
      var padding = 0
    }
    $('.menu').css('padding-top', padding);
  });


  if (window.location.pathname == '/tos') page('terms');


var element = document.getElementById('keystones');

var options = {
  dragLockToAxis: true,
  dragBlockHorizontal: true
};


$('.slider').fractionSlider({
  'slideTransition' : 'fade', // default slide transition
  'slideTransitionSpeed' : 1000, // default slide transition time
  'slideEndAnimation' : true, // if set true, objects will transition out before next slide moves in      
  'position' : '0,0', // default position | should never be used
  'transitionIn' : 'left', // default in - transition
  'transitionOut' : 'left', // default out - transition
  'fullWidth' : false, // transition over the full width of the window
  'delay' : 0, // default delay for elements
  'timeout' : 2000, // default timeout before switching slides
  'speedIn' : 2500, // default in - transition speed
  'speedOut' : 1000, // default out - transition speed
  'easeIn' : 'easeOutExpo', // default easing in
  'easeOut' : 'easeOutCubic', // default easing out
  'controls' : true, // controls on/off
  'pager' : true, // pager inside of the slider on/off OR $('someselector') for a pager outside of the slider
  'responsive' : true, // responsive slider (see below for some implementation tipps)
});


// $("[data-translate]").jqTranslate('trans',{defaultLang: 'es'});
$(".hook").on("mousedown",".reveal",function(e) {
    $(".pwd").replaceWith($('.pwd').clone().attr('type', 'text'));
});
$(".hook").on("mouseup",".reveal",function(e) {
    $(".pwd").replaceWith($('.pwd').clone().attr('type', 'password'));
});



$(".globalheader").on("click",".keystones li a",function(e) {
  e.preventDefault();
  var symbol = [$(this).parent().attr('data-symbol')];
  if (lastitem != symbol) {
    page('trade',symbol);
    lastitem = symbol;
    selectedsymbol = symbol;
    location.hash = symbol;
  }
});

$(".menu").on("click",".keystonesidebar",function(e) {
  e.preventDefault();
  $(".keystonesidebar").removeClass('selected');
  $(this).addClass('selected');
  var symbol = [$(this).attr('data-symbol')];
  if (lastitem != symbol) {
    page('trade',symbol);
    showSymbols();
    lastitem = symbol;
    selectedsymbol = symbol;
    location.hash = symbol;
  }
});

var scroll;
$('.scroller').mouseover( function() {
  
  if ( $(this).hasClass('left') ) {
    scroll = setInterval( function() {
      var left = $('.keystones').css('left').replace('px', ''); 
      if (left < 0) $('.keystones').css('left', '+=10'); 
    }, 100 );
  } else if ( $(this).hasClass('right') ) {
    scroll = setInterval( function() { 
      var left = $('.keystones').css('left').replace('px', ''); 
      $('.keystones').css('left', '-=10'); 
    }, 100 );
  }

  $(this).mouseout( function() { clearInterval(scroll); });
});


var allopen = false;
$(".globalheader").on("click",".keystones .seeall",function(e) {
  e.preventDefault();
  if (allopen == false) {
  $('.linktray').css('height', '60px');
  $(this).css('bottom', '-12px').html('Less');
  allopen = true;
  } else if (allopen == true) {
    $('.linktray').css('height', '30px');
    $(this).css('bottom', '-3px').html('More');
    allopen = false;
  }
});



//console.log('loaded ui jquery');
  $(".right").on("keyup","#username",function(e) {
    if(e.keyCode == 13) {
      $('.loginbtn').html('Working');
      login();
    }
  });
  $(".right").on("keyup","#password",function(e) {
    if(e.keyCode == 13) {
      $('.loginbtn').html('Working');
      login();
    }
  });

  $(".right").on("click",".loginbtn",function(e) {
    login();
  });

  var showlogin = false;
   var showfinances = false;
  $(".right").on("click",".username",function(e) {
    if (showlogin == false) {
      showAccount();
      page('security');
      showAccount();
      showlogin = true;
      lastitem = 'account';
    } else {
      showSymbols();
      showlogin = false;
    }
  });
 
  $(".right").on("click",".userbal",function(e) {
    
    if (showfinances == false) {
      showFinances();
      page('deposit');
      showfinances = true;
      lastitem = 'finances';
    } else {
      showSymbols();
      showfinances = false;
    }
    
  }); 

  function login () {
        var email = $("#email").val();
    var password = $("#password").val();
    if (email && password) {
    var url = "/login/" + email + "/" + password;
    $.ajax({
      url: url,
      cache: false
    }).done(function( html ) {
      if (html == "Too many requests.") {
        $('.loginbtn').removeClass('btn-warning').addClass('btn-danger').html(html);
      } else if (html == "Invalid username or password."){
        $('.loginbtn').removeClass('btn-success').addClass('btn-warning').html('Try again');
      } else if (html == "OK") {
        $('.loginbtn').removeClass('btn-warning').addClass('btn-success').html('Logged in');
        setTimeout( function() { document.location.reload(); }, 750);
      }
    });
  }
  }

  
  $('.hook').on('click', '.trade-switch', function (e) {
   var symbol = $(this).parent().data('symbol');
    if (autotrader[symbol]) {
      $(this).removeClass('fa-toggle-on').addClass('fa-toggle-off');
      $('.trademode').html('Manual').css('opacity', 1);
      setTimeout( function() { $('.trademode').css('opacity', 0); }, 2500);
      $('.auto').addClass('hide');
      $('.manual').removeClass('hide');
      $('.callbtn').addClass('btn-success').removeClass('btn-default');
      $('.putbtn').addClass('btn-danger').removeClass('btn-default');
      $('.keystone-btn').addClass('btn-default').removeClass('btn-yellow');
      $('.applyautotrade').addClass('btn-warning').removeClass('btn-success').addClass('btn-success').html('Apply');
      autotrader[symbol] = false;
    } else {
      $(this).removeClass('fa-toggle-off').addClass('fa-toggle-on');
      $('.trademode').html('Automatic').css('opacity', 1);
      setTimeout( function() { $('.trademode').css('opacity', 0); }, 2500);
      $('.auto').removeClass('hide');
      $('.manual').addClass('hide');
      $('.callbtn').addClass('btn-success').removeClass('btn-default');
      $('.putbtn').addClass('btn-danger').removeClass('btn-default');
      $('.keystone-btn').removeClass('btn-default').addClass('btn-yellow');
      $('.applyautotrade').removeClass('btn-warning').removeClass('btn-success').addClass('btn-success').html('Start');
      uitradeico(symbol,2);
      autotrader[symbol] = true;
    }
  });

  $('.hook').on('click', '.chart-time', function (e) {
    var time = $(this).data('time');
    var symbol = $(this).parent().data('symbol');
    socket.emit('chart', { symbol: symbol, time: time });
    $('.chart-time').removeClass('active');
    $(this).addClass('active');
  });

  var expanded = false;
  $('.hook').on('click', '.chart-expand', function (e) {
    e.preventDefault();
    if (expanded != true) {
      expanded = true;
      $(this).addClass('active');
      
      $('.numbotron').height(400).css('opacity', 0);
      setTimeout( function () {
        $('.highcharts-container').height(400);
        var time = $('.chart-time.active').data('time');
        var symbol = $('.chart-time.active').parent().data('symbol');
        socket.emit('chart', { symbol: symbol, time: time });
        setTimeout( function () { 
          $('.numbotron').css('opacity', 1); 
          if ($(document).width() > 720) $('.controls').css('top', 93);
        }, 400);
      }, 300);

    } else {
      expanded = false;
      $(this).removeClass('active');
      $('.numbotron').height(220).css('opacity', 0);
      $('.controls').css('top', 0);
      setTimeout( function () {
        $('.highcharts-container').height(220);
        var time = $('.chart-time.active').data('time');
        var symbol = $('.chart-time.active').parent().data('symbol');
        socket.emit('chart', { symbol: symbol, time: time });
        setTimeout( function () { 
          $('.numbotron').css('opacity', 1);
        }, 500);
      }, 300);
    }
  });

  $('.hook').on('click', '.chart-ellipsis', function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
    $('.chart-time.active').removeClass('downplay');
    $('.chart-time.downplay').toggleClass('vanish');
  });

  var applyingtrade, applyingtrade = false;
  $(".hook").on("click",".applytrade",function(e) {
      if (applyingtrade==false) {
        var symbol = $(this).attr('data-symbol');
        var direction = $('.'+symbol+' .action').val();
        var amount = Number($('.'+symbol+' .info .amount .amountfield').val());
        amount = amount.toFixed(2);
        //user = userid;
        if (symbol && direction && amount) {
          socket.emit('trade', {
            symbol : symbol,
            amount : amount,
            direction : direction,
            user : user
          });
          applyingtrade = true;
        }
      } 
      setTimeout(function () { applyingtrade = false; }, 700);
  });

  var applyingtrade, applyingtrade = false;
  $(".hook").on("click",".applyautotrade",function(e) {
      if (applyingtrade==false) {
        var symbol = $(this).attr('data-symbol');
        var direction = $('.'+symbol+' .action').html();
        var repeat = Number($('#'+symbol+' .info .repeat .repeatfield').val());
        var amount = Number($('#'+symbol+' .info .amount .repeatamountfield').val());
        amount = amount.toFixed(2);
        //user = userid;
        socket.emit('autotrade', {
          symbol : symbol,
          amount : amount,
          repeat : repeat,
          direction : direction,
          user : user
        });
        applyingtrade = true;
      } 
      setTimeout(function () { applyingtrade = false; }, 700);
  });
    $(".hook").on("keyup",".applyautotrade",function(e) {
      if (applyingtrade==false && e.keyCode == 13) {
        var symbol = $(this).attr('data-symbol');
        var direction = $('.'+symbol+' .action').html();
        var repeat = Number($('#'+symbol+' .info .repeat .repeatfield').val());
        var amount = Number($('#'+symbol+' .info .amount .repeatamountfield').val());
        amount = amount.toFixed(2);
        //user = userid;
        socket.emit('autotrade', {
          symbol : symbol,
          amount : amount,
          repeat : repeat,
          direction : direction,
          user : user
        });
        applyingtrade = true;
      } 
      setTimeout(function () { applyingtrade = false; }, 700);
  });

  $(".hook").on("change",".amountfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var amount = $('.'+symbol+' .info .trader .amount .amountfield').val();
    if (amount > 0) {
      amount = 1;
      var possiblewin = (+amount+(amount*offer));
      $('.'+symbol+' .info .manual .details h1').html(currencysymbol + possiblewin.toFixed(2));
    } else { // keep amount above zero
      $('.'+symbol+' .info .trader .amount .amountfield').val(0);
      $('.'+symbol+' .info .manual .details h1').html(offer * 100 + "%");
    }
  });  $(".hook").on("keyup",".amountfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var amount = $('.'+symbol+' .info .trader .amount .amountfield').val();
    if (amount > 0) {
      amount = 1;
      var possiblewin = (+amount+(amount*offer));
      $('.'+symbol+' .info .manual .details h1').html(currencysymbol + possiblewin.toFixed(2));
    } else { // keep amount above zero
      //$('.'+symbol+' .info .trader .amount .amountfield').val(0);
      $('.'+symbol+' .info .manual .details h1').html(offer * 100 + "%");
    }
  });

  $(".hook").on("change",".repeatamountfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var repeat = $('.'+symbol+' .info .trader .repeat .repeatfield').val();
    var amount = $('.'+symbol+' .info .trader .amount .repeatamountfield').val();
    if (amount > 0) {
      if (!repeat || repeat <= 0) {
        repeat = 1;
        $('.'+symbol+' .info .trader .repeat .repeatfield').val(1);
      }
      var possiblewin = (+amount+(amount*offer))*repeat;
      $('.'+symbol+' .info .auto .details h1').html(currencysymbol + possiblewin.toFixed(2));
    } else { // keep amount above zero
      $('.'+symbol+' .info .trader .amount .repeatamountfield').val(0);
      $('.'+symbol+' .info .auto .details h1').html(offer * 100 + "%");
    }
  });
  $(".hook").on("keyup",".repeatamountfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var repeat = $('.'+symbol+' .info .trader .repeat .repeatfield').val();
    var amount = $('.'+symbol+' .info .trader .amount .repeatamountfield').val();
    if (amount > 0) {
      if (!repeat || repeat <= 0) {
        repeat = 1;
        $('.'+symbol+' .info .trader .repeat .repeatfield').val(1);
      }
      var possiblewin = (+amount+(amount*offer))*repeat;
      $('.'+symbol+' .info .auto .details h1').html(currencysymbol + possiblewin.toFixed(2));
    } else { // keep amount above zero
      $('.'+symbol+' .info .trader .amount .repeatamountfield').val(0);
      $('.'+symbol+' .info .auto .details h1').html(offer * 100 + "%");
    }
  });

  $(".hook").on("change",".repeatfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var repeat = $('.'+symbol+' .info .trader .repeat .repeatfield').val();
    var amount = $('.'+symbol+' .info .trader .amount .repeatamountfield').val();
    if (repeat > 0) {
      if (!amount || amount <= 0) {
        amount = 1;
        $('.'+symbol+' .info .trader .amount .repeatamountfield').val(1);
      }
      var possiblewin = (+amount+(amount*offer))*repeat;
      $('.'+symbol+' .info .auto .details h1').html(currencysymbol + possiblewin.toFixed(2));
    } else { // keep amount above zero
      $('.'+symbol+' .info .trader .repeat .repeatfield').val(0);
      $('.'+symbol+' .info .auto .details h1').html(offer * 100 + "%");
    }
  });
  $(".hook").on("keyup",".repeatfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var repeat = $('.'+symbol+' .info .trader .repeat .repeatfield').val();
    var amount = $('.'+symbol+' .info .trader .amount .repeatamountfield').val();
    if (!repeat || repeat > 0) {
      if (!amount || amount <= 0) {
        amount = 1;
        $('.'+symbol+' .info .trader .amount .repeatamountfield').val(1);
      }
      var possiblewin = (+amount+(amount*offer))*repeat;
      $('.'+symbol+' .info .auto .details h1').html(currencysymbol + possiblewin.toFixed(2));
    } else { // keep amount above zero
      $('.'+symbol+' .info .trader .repeat .repeatfield').val(0);
      $('.'+symbol+' .info .auto .details h1').html(offer * 100 + "%");
    }
  });


  $(".hook").on("click",".callbtn",function() {
    var symbol = $(this).attr('data-symbol');
    $('.apply'+symbol).removeClass('btn-danger').removeClass('btn-default').addClass('btn-warning').html('Apply');
    $('.put'+symbol).removeClass('btn-danger').addClass('btn-default');
    $('.call'+symbol).removeClass('btn-default').addClass('btn-success');
    $('.keystone-btn').addClass('btn-default').removeClass('btn-yellow');
    uitradeico(symbol, 1, 1);
    $('.'+symbol+' .action').val('Call');
    //$('.controls .price .lock').html('<span class="glyphicon glyphicon-lock"></span>');
    var autocolor = 0;
    var direction = 'call';
  });
  $(".hook").on("click",".putbtn",function() {
    var symbol = $(this).attr('data-symbol');
    $('.apply'+symbol).removeClass('btn-default').removeClass('btn-danger').addClass('btn-warning').html('Apply');
    $('.put'+symbol).addClass('btn-danger').removeClass('btn-default');
    $('.call'+symbol).addClass('btn-default').removeClass('btn-success');
    $('.keystone-btn').addClass('btn-default').removeClass('btn-yellow');
    uitradeico(symbol, 0, 1);
    $('.'+symbol+' .action').val('Put');
    //$('.controls .price .lock').html('<span class="glyphicon glyphicon-lock"></span>');
    var direction = 'put';
  });

  $(".hook").on("click",".keystone-btn",function() {
    var symbol = $(this).attr('data-symbol');
    uitradeico(symbol, 2);
    if (autotrader[symbol]) {
      updatekeystones = false;
      $(this).removeClass('btn-default').addClass('btn-yellow').html('Auto');
      setTimeout( function() { updatekeystones = true; }, 1000)
    }
    $('.put'+symbol).removeClass('btn-default').addClass('btn-danger');
    $('.call'+symbol).removeClass('btn-default').addClass('btn-success');
    $('.'+symbol+' .action').val('Auto');
    $('.applyautotrade').removeClass('btn-warning').removeClass('btn-default').addClass('btn-success').html('Start');
    var direction = 'auto';
  });



  $(".globalheader").on("click","#account",function() {
    page('prefs');
    
  });

  $(".globalheader").on("click","#deposit",function() {
    page('deposit');
    
  });    

  $(".globalheader").on("click","#security",function() {
    page('security');
    
  });  
  
  $(".globalheader").on("click","#prefs",function() {
    page('prefs');

  });  

  $(".globalheader").on("click","#withdrawl",function() {
    page('send');
    
  });  
  $(".globalheader").on("click","#history",function() {
    page('history');
    
  });   
  $(".globalheader").on("click","#referrals",function() {
    page('referrals');
    
  });  
  $(".hook").on("click","#terms",function() {
    page('terms');
    
  });
  $(".hook").on("click","#adminpage",function() {
    page('admin');
    
  });
// UI Stuff
// Animated header strip

  // $('.header').click(function(e) {
  //   //e.preventDefault();
  //   $(this).disableSelection();
  //   $(this).next().toggleClass('hideme');
  // });

var currentsymbol, sidebarpin;
$('.btnlogo').click(function() {
  showSymbols();
  if ($('.menu').hasClass('open')  && !sidebarpin) {
    $('.menu').removeClass('open');
    $('.hook').removeClass('open');
  } else {
    $('.menu').addClass('open');
    $('.hook').addClass('open');
  }
  if (selectedsymbol != currentsymbol) {
    page('trade', [selectedsymbol]);
    currentsymbol = selectedsymbol;
  }
});

$(".menu").on('click', '.sidebar-pin', function (e) {
  e.preventDefault();

  if (sidebarpin == true) {
    sidebarpin = false;
    $(this).find('i').addClass('fa-toggle-off').removeClass('fa-toggle-on');
    $('.menu').removeClass('open');
    $('.hook').removeClass('open');
  } else {
    sidebarpin = true;
    $(this).find('i').addClass('fa-toggle-on').removeClass('fa-toggle-off');
  }

});

$('.hook').click(function() {
  if ( $('.menu').hasClass('open') && !sidebarpin ) {
    $('.menu').removeClass('open');
    $('.hook').removeClass('open');
  }
});

    //showloginfield();
    $('.info .details h1').html(offer*100+'%');

// Proto chat

    $('#chattext').keyup(function(event) {
      if(event.keyCode == 13) {
       if ($chatInput.val()) {
        //event.preventDefault();
        chat($chatInput.val());
        $chatInput.val('');
       }
      }
    });

    $('#messages form').submit(function (event) {
      //event.preventDefault();
      message(users[target], $messagesInput.val());
      $messagesInput.val('');
    });


//Uncaught ReferenceError: $users is not defined
    // $users.on('click', 'li', function (event) {
    //   var $user = $(this);
    //   target = $user.index();
    //   $users.find('li').removeClass('selected');
    //   $user.addClass('selected');
    // });

// onload
});

// Ui functions

function isOdd(num) { return num % 2;}

function hideAllPanels() {
  $(".financestray").css('height', '0px');
  $(".accounttray").css('height', '0px');
  $(".announcesuccess").css('height', '0px');
  $(".announcedanger").css('height', '0px');
  $(".announcesplit").css('height', '0px');
  $(".announcexp").css('height', '0px');
  $(".linktray").css('height', '0px');
}

function showSuccess(msg, xp, next) {
  hideAllPanels();
  $(".announcesuccess").css('height', 30);
  $(".announcesuccess .container ul li a").html(msg);
  $(".announcesuccess .container span").html(xp);
  setTimeout(function(){
    hideAllPanels();next();
  },6500);
}
function showDanger(msg, xp, next) {
  hideAllPanels();
  $(".announcedanger").css('height', 30);
  $(".announcedanger .container ul li a").html(msg);
  $(".announcedanger .container span").html(xp);
  setTimeout(function(){
    hideAllPanels();next();
  },6500);
}


function showSplit(x, y, z, change) {
  if (x||y||z) {
    hideAllPanels();
    $(".announcesplit").css('height', 30);

    var total = x+y+z;

    $(".announcesplit .x").html('');
    $(".announcesplit .y").html('');
    $(".announcesplit .z").html('');

    $(".announcesplit .x").css('width', (x/total)*100+'%');
    if (((x/total)*100) > 10) { $(".announcesplit .x").html('Won for '+currencysymbol+' '+x.toFixed(2));  }

    $(".announcesplit .y").css('width', (y/total)*100+'%').css('left', (x/total)*100+'%');
    if (((y/total)*100) > 10) { $(".announcesplit .y").html('Pushed for '+currencysymbol+' '+y.toFixed(2)); }

    $(".announcesplit .z").css('width', (z/total)*100+'%');
    if (((z/total)*100) > 10) {  $(".announcesplit .z").html('Lost for '+currencysymbol+' '+z.toFixed(2)); }

    $(".announcesplit div").removeClass('applyspotlight');

    if ( x > z && x > y || x == y && x == z || x == z && x > y || x == y && x > z ) { 
      $(".announcesplit .x").addClass('applyspotlight'); 
      document.title = sitetitle + ' - Won for '+currency+' '+x.toFixed(2); specialtitle = true;
      specialtitle = true;
    } else if (y > x && y > z) {  
      $(".announcesplit .y").addClass('applyspotlight'); 
      document.title = sitetitle + ' - Pushed for '+currency+' '+y.toFixed(2); specialtitle = true;
      specialtitle = true;
    } else if (z > x && z > y || y == z) { 
      $(".announcesplit .z").addClass('applyspotlight'); 
      document.title = sitetitle + ' - Lost for '+currency+' '+z.toFixed(2); specialtitle = true;
      specialtitle = true;
    }

    var windowrun = false;
      setTimeout(function(){
        if (!windowrun) {
          hideAllPanels();
          document.title = sitetitle;
          specialtitle = false;
          showSymbols();
          windowrun = true;
        }
      },change); 

  } else {
    showSymbols();
  }
}

function showXp(data, change) {
  hideAllPanels();
  $(".announcexp").css('height', 30);
l;

  var lastpercentage = Number((data.xp-data.lastlevel)/(data.nextlevel-data.lastlevel)*100);
  if (lastpercentage > 100) lastpercentage = 100;
  

  $(".announcexp .xp .x").css('width', percentage+'%').html(experience+'/'+data.nextlevel);
  
  setTimeout(function() {
    hideAllPanels();
  }, change);
}

function showSymbols() {
  hideAllPanels();
  $(".linktray").css('height', 30);
}
function showAccount() {
  hideAllPanels();
  $(".accounttray").css('height', 30);
}
function showFinances() {
  hideAllPanels();
$(".financestray").css('height', 30);
}
function uitradeico(symbol, direction, manual) {
    switch (direction) {
      case 0:
        $(".icon"+symbol).removeClass('orange').removeClass('green').removeClass('glyphicon-arrow-up').addClass('red').addClass('glyphicon-arrow-down');
      break;
      case 1:
        $(".icon"+symbol).removeClass('orange').removeClass('red').removeClass('glyphicon-arrow-down').addClass('green').addClass('glyphicon-arrow-up');
      break;
      case 2:
        $(".firsttradeicon").removeClass('red').removeClass('green').removeClass('glyphicon-arrow-down').addClass('orange').addClass('glyphicon-arrow-up');
        $(".lasttradeicon").removeClass('red').removeClass('green').removeClass('glyphicon-arrow-up').addClass('orange').addClass('glyphicon-arrow-down');
      break;
    }
}
