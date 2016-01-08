var charts = new Array();

function loadChart(data) {
	console.log(data);
	symbol = symbolSwitch(data.symbol);

	var canvas = document.getElementById(data.symbol+"_chart");
	var ctx = canvas.getContext("2d");

	var linechartData = {
		"datasets": [{
			"data": data.chart,
			"pointStrokeColor": "#fff",
            "fillColor": "rgba(220,220,220,0.5)",
            "pointColor": "rgba(220,220,220,1)",
            "strokeColor": "rgba(220,220,220,1)"
		}]
	};

	charts[data.symbol] = new Chart(ctx, { type: 'line', data: linechartData, animationSteps: 15 });
}