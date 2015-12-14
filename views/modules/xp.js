function displayxp() {
var html = '<div class="userblock">'+
  '<div class="row-fluid">'+
 '<div class="span12">'+
  '<div class="header">'+user+'<span class="yellow" style="float:right;"><i class="fa fa-star"></i> Level <span class="userlevel">'+level+'</span></span></div>'+
  '<table class="table" id="alltrades">'+
    '<tbody>'+
      '<tr>'+
        '<td style="width: 33%;"><i class="fa fa-adjust"></i> Ratio: <span class="green ratio">'+ratio+'</span></td>'+
        '<td style="width: 33%;"><i class="fa fa-tasks"></i> Percentage: <span class="green percentage">'+percentage+'%</span></td>'+
        '<td style="width: 33%;"><i class="fa fa-star-half-o"></i> Experience: <span class="orange userxp">'+experience+'</span></td>'+
      '</tr>'+
  '</tbody>'+
'</table>'+
'</div>'+
'</div>'+
'</div>';
$('.xp').html(html);
}