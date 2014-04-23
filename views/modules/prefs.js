function showPrefs() {
  var html = '';
  $(".prefs").html(html);

    html = html + '<div class="alert alert-info">';
    html = html + '<a href="#" style="margin-right: 10px;"><i class="fa fa-check-circle-o fa-lg"></i></a> <strong>Trade Timer</strong> Visually countdown the number of seconds until the next trade.';
    html = html + '</div>';

    html = html + '<div class="alert alert-info">';
    html = html + '<a href="#" style="margin-right: 10px;"><i class="fa fa-check-circle-o fa-lg"></i></a> <strong>Chat Box</strong> Show the chat box on the trade page.';
    html = html + '</div>';


  $(".prefs").html(html);
}