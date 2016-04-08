spqlib.barchart = (function () {
	var my = { };
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. effettua il mapping dell'output e setta le impostazioni del grafo 
	 */
	my.chartImpl = function () {
		return spqlib.jqplot();
	}
	
	my.exportAsImage = function(){
		
	}
	
	my.toggleFullScreen = function(graphId){
		//$("#"+graphId).toggleClass("ii-sparql-chart-full-screen");
		var className = "ii-sparql-chart-full-screen";
		var graphDivBox = $("#"+graphId+"-box");
		var graphDiv = $("#"+graphId);
		if (!graphDivBox.hasClass(className)){
			graphDivBox.addClass(className);
			this.isFullScreen = true;
			this.originalHeight = graphDiv.css("height");
			graphDiv.css('height',800+'px !important');
		} else {
			graphDivBox.removeClass(className);
			this.isFullScreen = false;
			graphDiv.css('height',this.originalHeight+'px !important');
		}
		
		//$("#"+graphId+"-box").toggleClass("ii-sparql-chart-full-screen");
		//graphDiv.css('height',700+'px !important');
		this.replot(this.options);
	}
	
	my.preQuery = function(configuration){
		$("#"+configuration.divId+"-legend").hide();
		if (configuration.spinnerImagePath){
			$("#"+configuration.divId).html("<div class='loader'><img src='"+configuration.spinnerImagePath+"' style='vertical-align:middle;'></div>");
		} else {
			$("#"+configuration.divId).html("Loading...");
		}
	}
	
	my.failQuery = function(configuration,jqXHR,textStatus){
		$("#"+configuration.divId).html("");
		$("#"+configuration.divId).html(spqlib.util.generateErrorBox(textStatus));
		throw new Error("Error invoking sparql endpoint "+textStatus+" "+JSON.stringify(jqXHR));
	}
	
	
	my.render = function (json, config) {
		$("#"+config.divId).html("");
		var head = json.head.vars;
		var data = json.results.bindings;
		if (!head || head.length<2){
			throw "Too few fields in sparql result. Need at least 2 columns";
		}
		var field_label = head[0];
		var numSeries = head.length-1;
		var labels = [];
		var series = [];
		for (var i = 0; i < data.length; i++) {
			labels.push(spqlib.util.getSparqlFieldValue(data[i][field_label]));
			for (var j=0;j<numSeries;j++){
				if (!series[j]){
					series[j] = [data.length];
				}
				series[j][i]=spqlib.util.getSparqlFieldValueToNumber(data[i][head[j+1]]);
			}
		}
		var chartId = config.divId;
		var chart =  spqlib.barchart.chartImpl().drawBarChart(labels,series,config);
		chart.toggleFullScreen = my.toggleFullScreen;
		spqlib.addToRegistry(chartId,chart);
	}
	
	my.defaultBarChartTooltipContent = function(label,value,config,seriesIndex){
		var op = config.extraOptions || {};
		var spanLabel = "";
		var textLabel = "";
		var labelPattern = config.seriesConfiguration[seriesIndex].assetPattern;
		var linkPattern = config.seriesConfiguration[seriesIndex].assetLinkPattern;
		var showLink = config.seriesConfiguration[seriesIndex].showLink;
		var seriesLabel = config.seriesConfiguration[seriesIndex].label;
		var valuePattern = config.seriesConfiguration[seriesIndex].valuePattern;
		if (labelPattern){
			textLabel = spqlib.util.formatString(labelPattern,label);
		} else {
			textLabel = label;
		}
		if (showLink=="true"){
			var url = "#";
			if (linkPattern){
				url = spqlib.util.formatString(linkPattern,label);
			}
			spanLabel = "<a href='"+url+"'>"+textLabel+"</a>";
		} else {
			spanLabel = textLabel;
		}
		value = " "+value;
		if (valuePattern){
			value = spqlib.util.formatString(valuePattern,value,"{%d}");
		}
		var html = "<span class='close' onclick='javascript:$(this).parent().hide();'>x</span><span class=\"jqplot-tooltip-label\">"+spanLabel+"</span></br>";
		html+="<span class=\"jqplot-tooltip-serie-label\">"+seriesLabel+"</span>";
		html+="<span class=\"jqplot-tooltip-value\">"+value+"</span>";
		return html;
	}
	

	return my;
}());