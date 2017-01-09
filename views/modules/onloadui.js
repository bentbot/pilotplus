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
// if (emoji) {
//   emoji.include_title = true;
//   emoji.img_set = 'apple';
//   emoji.init_emoticons();
//   emoji.init_env();
// }

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

  var windowInFocus;
  $(window).focus(function() {
    windowInFocus = true;
  }).blur( function () {
    windowInFocus = false;
  })

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
    var header = $('.globalheader .header').height();
    if ( top < height ) {
        var padding = height-top;
        if ( top < height-header ) {
          $('.announcesplit').removeClass('fixed')
        }
    } else {
      $('.announcesplit').addClass('fixed')
    }
    $('.menu').css('padding-top', padding);
  });
  
  $( window ).resize(function() {
    // async.each(selectedsymbol, function (i, data){ 
    //   h[data].redraw;
    // });
    setTimeout(function () {
      for (var i = selectedsymbol.length - 1; i >= 0; i--) {
        socket.emit('chart', { symbol: selectedsymbol[i] });
      };
    }, 750);
    
  });

  if (window.location.pathname == '/tos') page('terms');

var element = document.getElementById('keystones');

var options = {
  dragLockToAxis: true,
  dragBlockHorizontal: true
};



// $('.slider').fractionSlider({
//   'slideTransition' : 'fade', // default slide transition
//   'slideTransitionSpeed' : 1000, // default slide transition time
//   'slideEndAnimation' : true, // if set true, objects will transition out before next slide moves in      
//   'position' : '0,0', // default position | should never be used
//   'transitionIn' : 'left', // default in - transition
//   'transitionOut' : 'left', // default out - transition
//   'fullWidth' : false, // transition over the full width of the window
//   'delay' : 0, // default delay for elements
//   'timeout' : 2000, // default timeout before switching slides
//   'speedIn' : 2500, // default in - transition speed
//   'speedOut' : 1000, // default out - transition speed
//   'easeIn' : 'easeOutExpo', // default easing in
//   'easeOut' : 'easeOutCubic', // default easing out
//   'controls' : true, // controls on/off
//   'pager' : true, // pager inside of the slider on/off OR $('someselector') for a pager outside of the slider
//   'responsive' : true, // responsive slider (see below for some implementation tipps)
// });


// $("[data-translate]").jqTranslate('trans',{defaultLang: 'es'});
$(".hook").on("mousedown",".reveal",function(e) {
    $(".pwd").replaceWith($('.pwd').clone().attr('type', 'text'));
});
$(".hook").on("mouseup",".reveal",function(e) {
    $(".pwd").replaceWith($('.pwd').clone().attr('type', 'password'));
});

$(".menu").on("click", ".sidebar-search .fa-search", function (e) {
  e.preventDefault();
  $('.symbolsearch').focus();
});



$(".globalheader").on("click",".keystones li a",function(e) {
  e.preventDefault();
  var symbol = $(this).parent().attr('data-symbol');
  if ( selectedsymbol.indexOf(symbol) < 0 ) {
    page('trade',symbol);
    lastitem = symbol;
    selectedsymbol.push(symbol);
    location.hash = symbol;
  }
});

$(".menu").on("click",".keystonesidebar",function(e) {
  e.preventDefault();
  var symbol = $(this).attr('data-symbol');
  if ( selectedsymbol.indexOf(symbol) < 0 ) {
    $(this).addClass('selected');
    page('trade',symbol);
    showSymbols();
    lastitem = symbol;
    selectedsymbol.push(symbol);
    location.hash = symbol;
  } else if (selectedsymbol.length > 1) {
    $(this).removeClass('selected');
     if (selectedsymbol.length > 1) {
      selectedsymbol = $.grep(selectedsymbol, function(value) {
        return value != symbol;
      });
    }
    $('.chart-'+symbol).remove();
  }
});


$(".menu").on("keyup",".symbolsearch", function(e) {
  e.preventDefault();
  var s = $(this).val();
  if (s.length > 0) {
    $('.sidebar-symbols .sidebar-title').slideUp();
  } else {
    $('.sidebar-symbols .sidebar-title').slideDown();
  }
  $('.sidebar-symbols .keystone').find(".name:not(:contains(" + s + "))").parent().slideUp();
  $('.sidebar-symbols .keystone').find(".name:contains(" + s + ")").parent().slideDown();
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
    $('.linktray').css('height', '45px');
    $(this).css('bottom', '-3px').html('More');
    allopen = false;
  }
});

$(".globalheader").on("click",".centerlogo",function(e) {
  e.preventDefault();
  page('trade', symbol);
});



//console.log('loaded ui jquery');
  $(".topright").on("keyup","#username",function(e) {
    if(e.keyCode == 13) {
      $('.loginbtn').html('<i class="fa fa-spin fa-cog"></i>');
      login();
    }
  });
  $(".topright").on("keyup","#password",function(e) {
    if(e.keyCode == 13) {
      $('.loginbtn').html('<i class="fa fa-spin fa-cog"></i>');
      login();
    }
  });

  $(".topright").on("keyup","#authy",function(e) {
    if(e.keyCode == 13) {
      $('.loginbtn').html('<i class="fa fa-spin fa-cog"></i>');
      login();
    }
  });

  $(".topright").on("click",".loginbtn",function(e) {
    $('.loginform').addClass('open');
    $('.headerusername').focus();
    login();
  });

  var showlogin = false;
   var showfinances = false;
  $(".topright").on("click keypress",".username",function(e) {
    if (showlogin == false) {
      showAccount();
      page('account');
      showlogin = true;
      lastitem = 'account';
      $(this).addClass('btn-success');
      $('.userbal').removeClass('btn-success').removeClass('btn-warning').removeClass('btn-blue');
    } else {
      $(this).removeClass('btn-success');
      showSymbols();
      showlogin = false;
    }
  });
 
  $(".topright").on("click keypress",".userbal",function(e) {
    e.preventDefault();
    if (showfinances == false) {
      showFinances();
      page('deposit');
      showfinances = true;
      lastitem = 'finances';
      $(this).addClass('btn-blue');
      $('.btnuser').removeClass('btn-success').removeClass('btn-warning').removeClass('btn-blue');
    } else {
      showSymbols();
      showfinances = false;
      $(this).removeClass('btn-blue');
    }
    
  }); 

  function login () {
    
    var email = $("#email").val();
    var password = $("#password").val();
    var authy = $("#authy").val();
    
    if (email.length > 0 && password.length > 0) {
    
      if (authy.length > 0) {
        var url = "/login/" + email + "/" + password + '/' + authy;
      } else {
        var url = "/login/" + email + "/" + password + '/false';
      } 

    $.ajax({
      url: url,
      cache: false
    }).done(function( html ) {
      console.log(html);
        
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
            setTimeout( function() { $('.loginbtn span').addClass('hidden'); }, 2500);

          break;

        }

    });
  }
  }

  
  $('.hook').on('click', '.trade-switch', function (e) {
   var symbol = $(this).parent().data('symbol');
    if (autotrader[symbol]) {
      $(this).removeClass('fa-toggle-on').addClass('fa-toggle-off');
      $('.chart-'+symbol+' .trademode').html('Manual').css('opacity', 1);
      setTimeout( function() { $('.chart-'+symbol+' .trademode').css('opacity', 0); }, 2500);
      $('.chart-'+symbol+' .auto').addClass('hide');
      $('.chart-'+symbol+' .manual').removeClass('hide');
      $('.chart-'+symbol+' .callbtn').addClass('btn-success').removeClass('btn-default');
      $('.chart-'+symbol+' .putbtn').addClass('btn-danger').removeClass('btn-default');
      $('.chart-'+symbol+' .keystone-btn').addClass('btn-default').removeClass('btn-blue');
      autotrader[symbol] = false;
    } else {
      $(this).removeClass('fa-toggle-off').addClass('fa-toggle-on');
      $('.chart-'+symbol+' .trademode').html('Automatic').css('opacity', 1);
      setTimeout( function() { $('.chart-'+symbol+' .trademode').css('opacity', 0); }, 2500);
      $('.chart-'+symbol+' .auto').removeClass('hide');
      $('.chart-'+symbol+' .manual').addClass('hide');
      $('.chart-'+symbol+' .callbtn').addClass('btn-success').removeClass('btn-default');
      $('.chart-'+symbol+' .putbtn').addClass('btn-danger').removeClass('btn-default');
      $('.chart-'+symbol+' .keystone-btn').removeClass('btn-default').addClass('btn-blue');
      $('.chart-'+symbol+' .applyautotrade').removeClass('btn-warning').removeClass('btn-success').removeClass('btn-default').addClass('btn-success').html('Start');
      uitradeico(symbol,2);
      autotrader[symbol] = true;
    }
  });

  $('.hook').on('click', '.chart-time', function (e) {
    var time = $(this).data('time');
    var symbol = $(this).parent().data('symbol');
    socket.emit('chart', { symbol: symbol, time: time });
    $('.chart-'+symbol+' .chart-time').removeClass('active');
    $(this).addClass('active');
  });

  $('.hook').on('click', '.close-chart', function (e) {
    var symbol = $(this).parent().data('symbol');
    if (selectedsymbol.length > 1) {
      selectedsymbol = $.grep(selectedsymbol, function(value) {
        return value != symbol;
      });
    }
    $('.chart-'+symbol).remove();
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
      $('.controls').css('top', 40);
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

  var flagsenabled = true;
  $('.hook').on('click', '.chart-flags', function (e) {
    if (flagsenabled) {
      flagsenabled = false;
      $(this).removeClass('active');
    } else {
      flagsenabled = true;
      $(this).addClass('active');
    }
  });

  $('.hook').on('click', '.chart-ellipsis', function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
    var symbol = $(this).data('symbol');
    $('.'+symbol+' .chart-time.active').removeClass('downplay');
    $('.'+symbol+' .chart-time.downplay').toggleClass('vanish');
  });


  $(".hook").on("click",".applytrade",function(e) {
    var symbol = $(this).attr('data-symbol');
    var direction = $('.'+symbol+' .action').val();
    var amount = Number($('.'+symbol+' .info .amount .amountfield').val());
    var tradetime = $('.'+symbol+' .time').val();
    amount = amount.toFixed(2);
    //user = userid;
    if (symbol && direction != 'none' && amount > 0) {
      socket.emit('trade', {
        symbol : symbol,
        amount : amount,
        direction : direction,
        time : tradetime,
        user : user
      });
    }
  });

  socket.on('newtrade', function (trade) {
    if (trade) {
      setTimeout(function() {
        applyingtrade = false;
      }, 500);
    }
    console.log(trade);
  });


  $(".hook").on("click",".applyautotrade",function(e) {
      // if (applyingtrade == false) {
        applyingtrade = true;
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
      // }
  });
  //   $(".hook").on("keyup",".applyautotrade",function(e) {
  //     if (applyingtrade==false && e.keyCode == 13) {
  //       var symbol = $(this).attr('data-symbol');
  //       var direction = $('.'+symbol+' .action').html();
  //       var repeat = Number($('#'+symbol+' .info .repeat .repeatfield').val());
  //       var amount = Number($('#'+symbol+' .info .amount .repeatamountfield').val());
  //       amount = amount.toFixed(2);
  //       //user = userid;
  //       socket.emit('autotrade', {
  //         symbol : symbol,
  //         amount : amount,
  //         repeat : repeat,
  //         direction : direction,
  //         user : user
  //       });
  //       applyingtrade = true;
  //     } 
  //     setTimeout(function () { applyingtrade = false; }, 700);
  // });

  $(".hook").on("change keyup",".amountfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var amount = $('.'+symbol+' .info .manual .amountfield').val();
    var action = $('.'+symbol+' .action').val();
    amount = amount.replace(/^0+/, '');
    if (amount > 0) {
      var possiblewin = (+amount+(amount*offer));
      $('.'+symbol+' .info .manual .amountfield').val(amount);
      if (action != 'none') $('.apply'+symbol).removeClass('btn-default').removeClass('btn-danger').removeClass('btn-blue').addClass('btn-warning').html('Apply');
      $('.'+symbol+' .info .manual .details h1').html(currencysymbol + possiblewin.toFixed(2)).addClass('estimate');
    } else { // keep amount above zero
      $('.'+symbol+' .info .manual .amountfield').val(0);
      $('.apply'+symbol).removeClass('btn-warning').addClass('btn-default');
      $('.'+symbol+' .info .manual .details h1').html(offer * 100 + "%").removeClass('estimate');
    }
  });  


  $(".hook").on("change keyup",".repeatamountfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var repeat = $('.'+symbol+' .info .trader .repeat .repeatfield').val();
    var amount = $('.'+symbol+' .info .trader .amount .repeatamountfield').val();
    var action = $('.'+symbol+' .action').val();
    amount = amount.replace(/^0+/, '');
    if (amount > 0) {
      $('.'+symbol+' .info .trader .amount .repeatamountfield').val(amount);
      if (!repeat || repeat <= 0) {
        repeat = 1;
        $('.'+symbol+' .info .trader .repeat .repeatfield').val(1);
      }
      var possiblewin = (+amount+(amount*offer))*repeat;
      $('.'+symbol+' .info .auto .details h1').html(currencysymbol + possiblewin.toFixed(2)).addClass('estimate');
    } else { // keep amount above zero
      $('.'+symbol+' .info .trader .amount .repeatamountfield').val(0);
      $('.'+symbol+' .info .auto .details h1').html(offer * 100 + "%").removeClass('estimate');
    }
  });
 

  $(".hook").on("change keyup",".repeatfield",function() {
    var symbol = $(this).attr('data-symbol');
    var offer = $('.'+symbol+' .info .details .rawoffer').html();
    var repeat = $('.'+symbol+' .info .trader .repeat .repeatfield').val();
    var amount = $('.'+symbol+' .info .trader .amount .repeatamountfield').val();
    repeat = repeat.replace(/^0+/, '');
    if (repeat > 0) {
      $('.'+symbol+' .info .trader .repeat .repeatfield').val(repeat);
      if (!amount || amount <= 0) {
        amount = 1;
        $('.'+symbol+' .info .trader .amount .repeatamountfield').val(1);
      }
      var possiblewin = (+amount+(amount*offer))*repeat;
      $('.'+symbol+' .info .auto .details h1').html(currencysymbol + possiblewin.toFixed(2)).css('font-weight', '500');
    } else { // keep amount above zero
      $('.'+symbol+' .info .trader .repeat .repeatfield').val(0);
      $('.'+symbol+' .info .auto .details h1').html(offer * 100 + "%").css('font-weight', '300');
    }
  });
  


  // $(".hook").on("click",".callbtn, .putbtn",function() {
  //   $('.controls .info .amount').css('display', 'block');
  //   $('.controls .info .details .expires').css('display', 'block');
  //   $('.controls .info .applytrade').css('display', 'block');
  // });



  $(".hook").on("click",".callbtn",function() {
    var symbol = $(this).attr('data-symbol');
    var amount = $('.'+symbol+' .amountfield').val();
    if ( amount > 0 ) $('.apply'+symbol).removeClass('btn-danger').removeClass('btn-default').removeClass('btn-blue').addClass('btn-warning').html('Apply');
    $('.put'+symbol).removeClass('btn-danger').addClass('btn-default');
    $('.call'+symbol).removeClass('btn-default').addClass('btn-success');
    $('.keystone-btn').addClass('btn-default').removeClass('btn-blue');
    uitradeico(symbol, 1, 1);
    $('.'+symbol+' .action').val('Call');
    //$('.controls .price .lock').html('<span class="glyphicon glyphicon-lock"></span>');
    var autocolor = 0;
    var direction = 'call';
  });
  $(".hook").on("click",".putbtn",function() {
    var symbol = $(this).attr('data-symbol');
    var amount = $('.'+symbol+' .amountfield').val();
    if ( amount > 0 ) $('.apply'+symbol).removeClass('btn-default').removeClass('btn-danger').removeClass('btn-blue').addClass('btn-warning').html('Apply');
    $('.put'+symbol).addClass('btn-danger').removeClass('btn-default');
    $('.call'+symbol).addClass('btn-default').removeClass('btn-success');
    $('.keystone-btn').addClass('btn-default').removeClass('btn-blue');
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
      $(this).removeClass('btn-default').addClass('btn-blue').html('Auto');
      setTimeout( function() { updatekeystones = true; }, 1000);
      $('.'+symbol+' .action').val('Auto');
    } else {
      $('.'+symbol+' .action').val('none');
    }
    $('.'+symbol+' .put'+symbol).removeClass('btn-default').addClass('btn-danger');
    $('.'+symbol+' .call'+symbol).removeClass('btn-default').addClass('btn-success');
    $('.'+symbol+' .applytrade').removeClass('btn-warning').removeClass('btn-default').removeClass('btn-default').removeClass('btn-success').addClass('btn-default').html('Apply');
    $('.'+symbol+' .applyautotrade').removeClass('btn-warning').removeClass('btn-default').addClass('btn-success').html('Start');
  });

var lasttime;
var last;

$(".hook").on("click",".expires .add",function() {
  var symbol = $(this).attr('data-symbol');
  var selected = $('.'+symbol+' .time').val();
console.log(last)
    for (var i = 0; i <= tradeevery.length - 1; i++) {
    if ( tradeevery[i].time > selected ) {
      if ( tradeevery[i].time != last ) { 
        last = tradeevery[i].time;
        $('.'+symbol+' .time').val(tradeevery[i].time);
        $('.'+symbol+'_tradetimes').html('<li data-time='+tradeevery[i].time+'" data-seconds="'+tradeevery[i].string+'">'+tradeevery[i].string+'</li>');
        return;
      }
    } 
  };
  
});

$(".hook").on("click",".expires .subtract",function() {
  var symbol = $(this).attr('data-symbol');
  var selected = $('.'+symbol+' .time').val();
console.log(last)
  for (var i = tradeevery.length - 1; i >= 0; i--) {
    if ( tradeevery[i].time < selected ) {
      if ( tradeevery[i].time != last ) { 
        last = tradeevery[i].time;
        $('.'+symbol+' .time').val(tradeevery[i].time);
        $('.'+symbol+'_tradetimes').html('<li data-time='+tradeevery[i].time+'" data-seconds="'+tradeevery[i].string+'">'+tradeevery[i].string+'</li>');
        return;
      }
    } 
  };

});

// Change the amount in the price selector by adding/subtracting 1 or 10 or 100 units...
amountchange = 10;

$(".hook").on("click",".amountup",function(e) {
  var symbol = $(this).attr('data-symbol');
  var amount = Number($('.'+symbol+' .amountfield').val());
  if ( !amount || amount < amountchange ) {
    amount = amountchange;
  } else {
    amount = Number(amount+amountchange);
  }
  if ( amount >= 0 ) {
    $('.'+symbol+' .amountfield').val(amount).trigger('change');
  }
});


$(".hook").on("click",".amountdown",function(e) {
  var symbol = $(this).attr('data-symbol');
  var amount = Number($('.'+symbol+' .amountfield').val());
  if ( !amount || amount < amountchange ) {
    amount = 0;
  } else {
    amount = Number(amount-amountchange);
  }
  if ( amount >= 0 ) {
    $('.'+symbol+' .amountfield').val(amount).trigger('change');
  }
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

  $(".globalheader").on("click","#account",function() {
    page('account');

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
$('.btnlogo').on('click keypress', function(e) {
  e.preventDefault();
  showSymbols();
  if ($('.menu').hasClass('open')  && !sidebarpin) {
    $('.btnuser').removeClass('btn-success').removeClass('btn-warning').removeClass('btn-blue');
    $('.btnfinance').removeClass('btn-success').removeClass('btn-warning').removeClass('btn-blue');
    $('.menu').removeClass('open');
    $('.hook').removeClass('open');
    $(this).removeClass('open');
  } else {
    $('.btnuser').removeClass('btn-success').removeClass('btn-warning').removeClass('btn-blue');
    $('.btnfinance').removeClass('btn-success').removeClass('btn-warning').removeClass('btn-blue');
    $('.menu').addClass('open');
    $('.hook').addClass('open');
    $(this).addClass('open');
  }
});

$(".menu").on('click', '.sidebar-pin', function (e) {
  e.preventDefault();

  if (sidebarpin == true) {
    sidebarpin = false;
    $(this).find('i').addClass('fa-toggle-off').removeClass('fa-toggle-on');
    $('.menu').removeClass('open');
    $('.hook').removeClass('open');
    $('.btnlogo').removeClass('open');
  } else {
    sidebarpin = true;
    $(this).find('i').addClass('fa-toggle-on').removeClass('fa-toggle-off');
  }

});

$('.hook').click(function() {
  if ( $('.menu').hasClass('open') && !sidebarpin ) {
    $('.menu').removeClass('open');
    $('.hook').removeClass('open');
    $('.btnlogo').removeClass('open');
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

  $('.announcesplit, .announcexp').on('click', function (e) {
      e.preventDefault();
      hideAllPanels();
      showSymbols();
  }); 
  

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
  $(".announcesuccess").css('height', 45);
  $(".announcesuccess .container ul li a").html(msg);
  $(".announcesuccess .container span").html(xp);
  setTimeout(function(){
    hideAllPanels();next();
  },6500);
}
function showDanger(msg, xp, next) {
  hideAllPanels();
  $(".announcedanger").css('height', 45);
  $(".announcedanger .container ul li a").html(msg);
  $(".announcedanger .container span").html(xp);
  setTimeout(function(){
    hideAllPanels();next();
  },6500);
}


function showSplit(x, y, z, change) {
  if (x||y||z) {
    hideAllPanels();
    $(".announcesplit").css('height', 45);

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


    // Set the window title
    var divider = ' - ';
    if (sitetitle == 'Pilot+') divider = ' ';

    if ( x > z && x > y || x == y && x == z || x == z && x > y || x == y && x > z ) { 
      $(".announcesplit .x").addClass('applyspotlight'); 
      document.title = sitetitle + divider + 'Won for '+currency+' '+x.toFixed(2); specialtitle = true;
      specialtitle = true;
    } else if (y > x && y > z) {  
      $(".announcesplit .y").addClass('applyspotlight'); 
      document.title = sitetitle + divider + 'Pushed for '+currency+' '+y.toFixed(2); specialtitle = true;
      specialtitle = true;
    } else if (z > x && z > y || y == z) { 
      $(".announcesplit .z").addClass('applyspotlight'); 
      document.title = sitetitle + divider + 'Lost for '+currency+' '+z.toFixed(2); specialtitle = true;
      specialtitle = true;
    }

    var windowrunning = false;
    setTimeout(function(){

      if (!windowrunning) {

        hideAllPanels();
        showSymbols();

        document.title = sitetitle;
        specialtitle = false;
        windowrunning = true;

      } else {
        windowrunning = false;
      }

    }, change);

  } else { // No Data, Skip
    showSymbols();
  }
}

function showXP(experience, lastxp, nextxp, change) {
  hideAllPanels();
  $(".announcexp").css('height', 45);

  var lastpercentage = Number((experience-lastxp)/(nextxp-lastxp)*100);
  if (lastpercentage > 100) lastpercentage = 100;
  

  $(".announcexp .xp .x").css('width', percentage+'%').html(experience+'/'+nextxp);
  
  setTimeout(function() {
    hideAllPanels();
  }, change);
}

function showSymbols() {
  hideAllPanels();
  $(".linktray").css('height', 45);
}
function showAccount() {
  hideAllPanels();
  $(".accounttray").css('height', 45);
}
function showFinances() {
  hideAllPanels();
$(".financestray").css('height', 45);
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
