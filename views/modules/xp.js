function displayxp() {
var html = '<div class="xpblock">'+
  '<div class="row-fluid">'+
  '<div class="span12">'+
  '<div class="header capitalize">'+user+'<span class="yellow" style="float:right;"><i class="fa fa-star"></i> Level <span class="userlevel">'+level+'</span></span></div>'+
  '<table class="xp table" id="usertable">'+
    '<tbody>'+
      '<tr>'+
        '<td style="width: 33%;">'+
          '<div class="ratio"><div class="percentage" style="50%">'+ratio+'</div></div>'+
          '<div class="userxp"><div class="percentage" style="50%">'+experience+'</div></div>'+
          '<div class="percentage"><div class="percentage" style="50%">'+percentage+'%</div></div>'+
        '</td>'+
        '<td style="width: 66%">'+
            '<div style="height: 100px">'+
              '<table class="xp table" id="usertable">'+
                '<tbody>'+
                  '<tr>'+
                    '<td>Hogan</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td>Liam</td>'+
                  '</tr>'+
                '</tbody>'+
              '</table>'+
          '</td>'+
        '</tr>'+
    '</tbody>'+
  '</table>'+
'</div>'+
'</div>'+
'</div>';
$('.xp').html(html);
}