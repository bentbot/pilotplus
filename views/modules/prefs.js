
var tradestatus = false;
var chatstatus = false;

function showPrefs() {

  var account = '<div class="userprefs"><div class="header" data-translate="accountsettings">Account Settings</div>'+
  '<table class="table account-preferences table-hover">'+
    '<tbody>'+
      '<tr>'+
        '<td class="remember-me">Remember Me</td>'+
        '<td class="preferences">'+
          '<a href="#" class="preference" data-pref="rememberme" data-setting="true">Enable</a> / '+
          '<a href="#" class="preference enabled" data-pref="rememberme" data-setting="false">Disabled</a>'+
        '</td>'+
      '</tr>'+
      '<tr>'+
        '<td class="title-countdown">Window Title Countdown</td>'+
        '<td class="preferences">'+
          '<a href="#" class="preference" data-pref="titlecountdown" data-setting="true">Enable</a> / '+
          '<a href="#" class="preference enabled" data-pref="titlecountdown" data-setting="false">Disabled</a>'+
        '</td>'+
      '</tr>'+
    '</tbody>'+
  '</table>'+
  '</div>';

  var trading = '<div class="userprefs"><div class="header" data-translate="tradesettings">Trade Settings</div>'+
  '<table class="table trading-preferences table-hover trade-settings-table">'+
    '<tbody>'+
      '<tr>'+
        '<td>Visual Countdown Timer</td>'+
        '<td class="preferences">'+
          '<a href="#" class="preference enabled" data-pref="timer" data-setting="true">Enabled</a> / '+
          '<a href="#" class="preference" data-pref="timer" data-setting="false">Disable</a>'+
        '</td>'+
      '</tr>'+
      '<tr>'+
        '<td>Symbol Ratio Bar</td>'+
        '<td class="preferences">'+
          '<a href="#" class="preference enabled" data-pref="symbolratios" data-setting="true">Enabled</a> / '+
          '<a href="#" class="preference" data-pref="symbolratios" data-setting="false">Disable</a>'+
        '</td>'+
      '</tr>'+
      '<tr>'+
        '<td>Chat Window</td>'+
        '<td class="preferences">'+
          '<a href="#" class="preference enabled" data-pref="chat" data-setting="true">Enabled</a> / '+
          '<a href="#" class="preference" data-pref="chat" data-setting="false">Disable</a>'+
        '</td>'+
      '</tr>'+
      '<tr>'+
        '<td>Statistics</td>'+
        '<td class="preferences">'+
          '<a href="#" class="preference enabled" data-pref="statistics" data-setting="true">Enabled</a> / '+
          '<a href="#" class="preference" data-pref="statistics" data-setting="false">Disable</a>'+
        '</td>'+
      '</tr>'+
      '<tr>'+
        '<td>Last Trades</td>'+
        '<td class="preferences">'+
          '<a href="#" class="preference enabled" data-pref="lasttrades" data-setting="true">Enabled</a> / '+
          '<a href="#" class="preference" data-pref="lasttrades" data-setting="false">Disable</a>'+
        '</td>'+
      '</tr>'+
    '</tbody>'+
  '</table>'+
  '</div>';


  $(".prefs").html(account + trading);
  socket.emit('get-pref');
}



$(function() {

	$(".hook").on("click",".preference",function(e) {  
    e.preventDefault();
    var pref = $(this).data('pref');
    var setting = $(this).data('setting');
    socket.emit('set-pref', {pref: pref, setting: setting });
    if (pref == 'remember-me') $('.remember-me').html('Remember Me <span class="pref-info">Requires logout</span>');
  });

  socket.emit('get-pref', false);

  socket.on('get-pref', function(data) {
    $('a[data-pref="'+data.pref+'"]').each(function () {
      var setting = $(this).data('setting');
      if (setting == true && data.setting === false) $(this).removeClass('enabled').html('Enable');
      if (setting == true && data.setting === true) $(this).addClass('enabled').html('Enabled');
      if (setting == false && data.setting === true) $(this).removeClass('enabled').html('Disable');
      if (setting == false && data.setting === false) $(this).addClass('enabled').html('Disabled');
    });
    $('.userprefs').addClass('open');
  });

});