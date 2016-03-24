
(function(spqlib, $) {

	var g = [];
	
	spqlib.jqplot = (function(){

	     var defaultBarChartOptions = {
				// Only animate if we're not using excanvas (not in IE 7 or IE 8)..
				title: {text:'',show:true},
				animate: true,
				seriesDefaults:{
					renderer:$.jqplot.BarRenderer,
					rendererOptions: {
						showDataLabels: true
					},
					pointLabels: { show: false }
				},
				axesDefaults: {
					tickRenderer: $.jqplot.CanvasAxisTickRenderer ,
					tickOptions: {
					  angle: -30,
					  fontSize: '10pt'
					}
				},
				axes: {
					xaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						//ticks: ticks
					}
				},
				highlighter: { show: true,tooltipLocation:'n',useAxesFormatters: true  },
				legend: {
					show: true,
					location: 'ne',
					placement: 'inside'
				}      
			}
			
			var defaultPieChartOptions = {
				title: {text:'',show:true},
				  seriesDefaults: {
					// Make this a pie chart.
					renderer: jQuery.jqplot.PieRenderer, 
					rendererOptions: {
					  // Put data labels on the pie slices.
					  // By default, labels show the percentage of the slice.
					  showDataLabels: true,
					  sliceMargin: 0, 
					}
				  }, 
				  highlighter: { show: true,tooltipLocation:'n',useAxesFormatters: false,formatString:'%s, %P'  },
				  legend: { show:true, location: 'e' }
				}
				
			var defaultDonutChartOptions = {
				title: {text:'',show:true},
				seriesDefaults: {
				  // make this a donut chart.
				  renderer:$.jqplot.DonutRenderer,
				  rendererOptions:{
					// Donut's can be cut into slices like pies.
					sliceMargin: 3,
					// Pies and donuts can start at any arbitrary angle.
					startAngle: -90,
					showDataLabels: true,
					// By default, data labels show the percentage of the donut/pie.
					// You can show the data 'value' or data 'label' instead.
					dataLabels: 'value',
				  }
				},
				highlighter: { show: true,tooltipLocation:'n',useAxesFormatters: false,formatString:'%s, %P'  },
				legend: { show:true, location: 'e' }
			  }
	
	     /**
		 *  label - array di stringhe
		 *  series - array di array
		 **/
	    function drawBarChart(label,series,config){
			var s = createSeries(label,series);		
		    var options= getBarChartOptions(config);	
			options.seriesDefaults.renderer=$.jqplot.BarRenderer;
			var plot1 = $.jqplot(config.divId, s,options );

				
		}
		
		 /**
		 *  label - array di stringhe
		 *  series - array di array
		 **/
	    function drawPieChart(label,series,config){
			  var options= getPieChartOptions(config);
			  var data = createSeries(label,series);
			  var plot1 = jQuery.jqplot (config.divId, [data], options);
		}
		
		
		/**
		 *  label - array di stringhe
		 *  series - array di array
		 **/
	    function drawDonutChart(label,series,config){
			  var options= getDonutChartOptions(config);
			  var data = createSeries(label,series);
			  var plot1 = jQuery.jqplot (config.divId, [data], options);
		}
		
		function createSeries(label,series){
			var s = [];
			if (series.length==1){
				for (var i=0;i<series[0].length;i++){
					var lab = label[i];
					var value = series[0][i];
					s.push([lab,value]);
				}
			} else {
				for (var i=0;i<series.length;i++){
					for (var j=0;j<series[i].length;j++){
						var value = series[i][j];
						series[i][j]=[label[j],value];
					}
				}
				for (var i=0;i<series.length;i++){
					s.push(series[i]);
				}
			}
			return s;
		}
			
		function getBarChartOptions(config){
			var options = spqlib.util.cloneObject(defaultBarChartOptions);
			if (config.seriesConfiguration){
				var sc = config.seriesConfiguration;
				for (var i=0;i<sc.length;i++){
					var label = sc[i].label;
					var color = sc[i].color;
					if (!options.series){
						options.series = [];
					}
					options.series[i] = {};
					options.series[i].label = label;
					options.series[i].color = color;
				}				
			}	
			if (config.chartTitle){
				options.title.text=config.chartTitle;
			}
			return options;
		}
		
		function getPieChartOptions(config){
			var options = spqlib.util.cloneObject(defaultPieChartOptions);
			if (config.seriesConfiguration){
				var sc = config.seriesConfiguration;
				for (var i=0;i<sc.length;i++){
					var label = sc[i].label;
					var color = sc[i].color;
					if (!options.series){
						options.series = [];
					}
					options.series[i] = {};
					options.series[i].label = label;
					options.series[i].color = color;
				}				
			}	
			if (config.chartTitle){
				options.title.text=config.chartTitle;
			}
			return options;
		}
		
		function getDonutChartOptions(config){
			var options = spqlib.util.cloneObject(defaultDonutChartOptions);
			if (config.seriesConfiguration){
				var sc = config.seriesConfiguration;
				for (var i=0;i<sc.length;i++){
					var label = sc[i].label;
					var color = sc[i].color;
					if (!options.series){
						options.series = [];
					}
					options.series[i] = {};
					options.series[i].label = label;
					options.series[i].color = color;
				}				
			}	
			if (config.chartTitle){
				options.title.text=config.chartTitle;
			}
			return options;
		}
		
		return { 
		     drawBarChart:drawBarChart,
			 drawPieChart:drawPieChart,
			 drawDonutChart:drawDonutChart
		}

	});

}(spqlib, jQuery));