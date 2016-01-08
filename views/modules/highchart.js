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
			h[symbol].series[0].addPoint(data);
			// Currently this code can only handle the display of one live chart at a time
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
	// 				text: '<span style="color:#14b200;font-weight: bold;">Call</span> on <span style="color:#e96d01;">BTCUSD</span>: <b>432.58</b><br /><span style="color: #298fc5;">USD</span>: <b>1.00</b> and <span style="color:#CA2121;">Lost</span>: <b>1.00</b>'
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

	var container = symbol + "_container";
	h[data.symbol] = new Highcharts.Chart({
			chart: {
				animation: true,
				renderTo: container,
				zoomType: 'x',
				panning: true,
				panKey: 'shift',
					resetZoomButton: {
							theme: {
									fill: 'rgba(238, 238, 238, 0.3)',
									stroke: 'rgba(238, 238, 238, 0.7)',
									style: {
										color: 'rgba(0, 0, 0, 0.5)'
									},
									r: 0,
									states: {
											hover: {
													fill: '#eee',
													stroke: '#adadad',
													style: {
															color: 'black',
													}
											}
									}
							}
					},
					style: {
					 fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
						fontSize: '15px'
					}
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
					animation: false
				},
				series: {
					lineWidth: data.properties.lineWidth,
					states: {
						hover: {
							enabled: true,
							lineWidth: data.properties.lineWidthHover
						}
					},
					marker: {
						enabled: false,
						radius: 2,
						states: {
							hover: {
								enabled: true,
								lineWidth: data.properties.lineWidth
							}
						}
					},
				},
			},
			series : [
				{
					type : data.properties.type,
					color: data.properties.lineColor,
					turboThreshold: 10000,
					name : data.symbol,
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