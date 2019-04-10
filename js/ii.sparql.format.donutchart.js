spqlib.donutchart = (function () {
	/**
	* Entry point
	*/
	spqlib.sparql2DonutChart = function(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		spqlib.util.parseExtraOptions(config);
		this.util.doQuery(config.endpointName, config.sparqlWithPrefixes, spqlib.donutchart.render, config,spqlib.donutchart.preQuery,spqlib.donutchart.failQuery);
	}
	
	
	var my = { };

	my.chartImpl = function () {
		return spqlib.jqplot();
	}
	
	my.exportAsImage = function(){
		
	}
	
	my.toggleFullScreen = function(graphId){

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
	
	my.PROP = {
		PROP_CHART_SERIE_LABEL : "chart.serie.label",
		PROP_CHART_TOOLTIP_SHOW_LINK : "chart.tooltip.label.link.show",
		PROP_CHART_TOOLTIP_LABEL_LINK_PATTERN : "chart.tooltip.label.link.pattern",
		PROP_CHART_TOOLTIP_LABEL_PATTERN : "chart.tooltip.label.pattern",
		PROP_CHART_TOOLTIP_VALUE_PATTERN : "chart.tooltip.value.pattern",
		PROP_CHART_SERIES_COLOR : "chart.series.color"
	}
	
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. 
	 */
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
		var chart = spqlib.donutchart.chartImpl().drawDonutChart(labels,series,config);
		spqlib.addToRegistry(chartId,chart);
	}
	
	my.defaultDonutChartTooltipContent = function(label,value,config){
		var op = config.extraOptions;
		var spanLabel = "";
		var textLabel = "";
		var labelPattern = op[this.PROP.PROP_CHART_TOOLTIP_LABEL_PATTERN];
		if (labelPattern){
			textLabel = spqlib.util.formatString(labelPattern,label);
		} else {
			textLabel = label;
		}
		if (op[this.PROP.PROP_CHART_TOOLTIP_SHOW_LINK]=="true"){
			var linkPattern = op[this.PROP.PROP_CHART_TOOLTIP_LABEL_LINK_PATTERN];
			var url = "#";
			if (linkPattern){
				url = spqlib.util.formatString(linkPattern,label);
			}
			spanLabel = "<a href='"+url+"'>"+textLabel+"</a>";
		} else {
			spanLabel = textLabel;
		}
		var seriesLabel = op[this.PROP.PROP_CHART_SERIE_LABEL] || "";
		var valuePattern =op[this.PROP.PROP_CHART_TOOLTIP_VALUE_PATTERN]; 
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