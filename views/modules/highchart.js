var h = new Array();
var chartinit = {};
var chartbusy = false;

function updateChart(symbol, data) {
	symbol = symbolSwitch(symbol);
	if($("#" + symbol + "_container").length == 1 && !chartbusy) {
		if (h[symbol]) {
			var time = $('.chart-time.active').data('time');
			if ( Number( date.getTime() - h[symbol].series[0].data[0].x ) > time ) {
				//h[symbol].series[0].data[0].remove(false, false);
			}
			
			var type = $('#'+symbol+'_container').attr('highchart-type');

			// Adding a new point to a line chart
			if (type == 'line') h[symbol].series[0].addPoint(data);
			if (type == 'candlestick') {
				// Add a candlestick or update existing onscreen candle ohlc
			}

		}
	} 
}

function loadFlags(data) {
	console.log(data);
	// $.each(data, function (i, flag) {
	//	var title;
	//	if ( flag.direction == 'Call' ) title = '⬆';
	//	if ( flag.direction == 'Put' ) title = '⬇';
	// 	h[data.symbol].addSeries({
	// 		type: 'flags',
	// 		data: [{
	// 				x: 1450657966685,
	// 				y: 432.58,
	// 				title: title,
	// 				text: '<span style="color:#14b200;font-weight: bold;">'+flag.direction+'</span> on <span style="color:#e96d01;">BTCUSD</span>: <b>432.58</b><br /><span style="color: #298fc5;">USD</span>: <b>1.00</b> and <span style="color:#CA2121;">Lost</span>: <b>1.00</b>'
	// 		}],
	// 		onSeries: 'dataseries',
	// 		shape: 'flag',
	// 		width: 16,
	// 		height: 16,
	// 		showInLegend: false,
	// 		color: '#1FC908',
	// 		fillColor: 'white',
	// 		'border-radius': '3px',
	// 		style: {
	// 			color: '#14b200',
	// 			cursor: 'default',
	// 			'border-radius': '3px'
	// 		},
	// 		states: {
	// 		 hover: {
				
	// 			 fillColor: 'white',
	// 			 color: '#14b200'
	// 		 }
	// 		}
	// 	}, false);

	// 	h[data.symbol].redraw();
	// });
}

function loadChart(data) {
	// create the chart
// she can not be tamed

var chartbusy = true;
var marginRight;

symbol = symbolSwitch(data.symbol);
if($("#" + symbol + "_container").length == 1) {
	
	var timeoffset = 5*60; // 5 hour offset
	if (prefs.timezone) timeoffset = prefs.timezone;

//console.log(symbol);
	Highcharts.setOptions({
		global: {
			useUTC: true,
			timezoneOffset: timeoffset
		}
	});

// Load the fonts
Highcharts.createElement('link', {
   href: '//fonts.googleapis.com/css?family=Signika:400,700',
   rel: 'stylesheet',
   type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);

// Add the background image to the container
Highcharts.wrap(Highcharts.Chart.prototype, 'getContainer', function (proceed) {
   proceed.call(this);
   this.container.style.background = 'url(https://pilot.plus/assets/img/sandtoss.jpg)';
});

if ( $( '#'+data.symbol+'_container' ).width() > 420 ) {
	rightMargin = 140;	
} else {
	rightMargin = 10;
}


Highcharts.theme = {
   chart: {
      backgroundColor: null,
      style: {
         fontFamily: "Helvetica"
      },
      marginRight: rightMargin
   },
   title: {
      style: {
         color: 'black',
         fontSize: '16px',
         fontWeight: 'bold'
      }
   },
   subtitle: {
      style: {
         color: 'black'
      }
   },
   tooltip: {
      borderWidth: 0
   },
		xAxis: {
				type: 'datetime',
				tickPixelInterval: 150,
				lineColor: '#eee'
		},
		yAxis : {
			title : {
				text : ' '
			},
			gridLineColor: '#eee'
		},
		title : {
			text : ' '
		},
		legend: {
				enabled: false
		},
   plotOptions: {
    	line: {
    		color: '#3da4be',
    		lineColor: '#3da4be',
				animation: false,
				lineWidth: 2,
				states: {
					hover: {
						enabled: true,
						lineWidth: 2
					}
				},
			},
			candlestick: {
         lineColor: '#555',
         lineWidth: 1,
         color: '#EC1F1F',
         upColor: '#14b200',
         states: {
					hover: {
						enabled: true,
						lineWidth: 2,
						lineColor: '#000'
					}
				},
      },
			series: {
				shadow: false,
				marker: {
					color: '#3da4be',
					enabled: false,
					radius: 1,
					states: {
						hover: {
							enabled: true,
							lineWidth: 2
						}
					}
				},
			},
      map: {
         shadow: false
      }
   },

   // Highstock specific
   navigator: {
      xAxis: {
         gridLineColor: '#D0D0D8'
      }
   },
   rangeSelector: {
      buttonTheme: {
         fill: 'white',
         stroke: '#C0C0C8',
         'stroke-width': 1,
         states: {
            select: {
               fill: '#D0D0D8'
            }
         }
      }
   },
   scrollbar: {
      trackBorderColor: '#C0C0C8'
   },

   // General
   background2: '#E0E0E8'
   
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);

	var container = symbol + "_container";
	$('#'+container).attr('highchart-type', data.type);
	h[data.symbol] = new Highcharts.Chart({
			chart: {
				animation: true,
				renderTo: container,
				zoomType: 'x',
				panning: true,
				panKey: 'shift',

			},
			series : [
				{
					type : data.type,
					turboThreshold: 10000,
					name : data.symbol,
	        data: 'ohlc',
	        dataGrouping: {
	            units: 'groupingUnits'
	        },
					data : data.chart
				}
			//  ,{
			//   type : 'flags',
			//   data : [{
			//     x : 1393696469543,
			//     y : 568.12,
			//     title : " ",
			//     shape : "url(http://64.90.187.148/assets/img/down.png)",
			//     text : 'Put at 568.12'
			//   }, {
			//     x : 1393696359543,
			//     y : 568.6,
			//     title : " ",
			//     shape : "url(http://64.90.187.148/assets/img/up.png)",
			//     text : 'Call at 568.6'
			//   }],
			//   color : '#5F86B3',
			//   fillColor : '#5F86B3',
			//   onSeries : 'dataseries',
			//   width : 1,
			//   style : {// text style
			//     color : 'white'
			//   },
			//   states : {
			//     hover : {
			//       fillColor : '#395C84' // darker
			//     }
			//   }
			// }
			]
	});
	chartinit[symbol] = true;
}
chartbusy = false;
}