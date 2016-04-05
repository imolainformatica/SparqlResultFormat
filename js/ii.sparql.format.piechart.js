spqlib.piechart = (function () {
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

	}
	
	my.PROP = {
		PROP_CHART_SERIE_LABEL : "chart.serie.label",
		PROP_CHART_TOOLTIP_SHOW_LINK : "chart.tooltip.label.link.show",
		PROP_CHART_TOOLTIP_LABEL_LINK_PATTERN : "chart.tooltip.label.link.pattern",
		PROP_CHART_TOOLTIP_LABEL_PATTERN : "chart.tooltip.label.pattern",
		PROP_CHART_TOOLTIP_VALUE_PATTERN : "chart.tooltip.value.pattern",
	}
	
	
	my.render = function (json, config) {
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
		var chart =  spqlib.piechart.chartImpl().drawPieChart(labels,series,config);
		spqlib.addToRegistry(chartId,chart);
	}
	
	my.defaultPieChartTooltipContent = function(label,value,config){
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
		if (op[this.PROP.PROP_CHART_TOOLTIP_VALUE_PATTERN]){
			value = spqlib.util.formatString(op[this.PROP.PROP_CHART_TOOLTIP_VALUE_PATTERN],value);
		}
		var html = "<span class=\"jqplot-tooltip-label\">"+spanLabel+"</span></br>";
		html+="<span class=\"jqplot-tooltip-serie-label\">"+seriesLabel+"</span>";
		html+="<span class=\"jqplot-tooltip-value\">"+value+"</span>";
		return html;
	}
	
	

	return my;
}());