spqlib.barchart = (function () {
	/**
	* Entry point
	*/
	spqlib.sparql2BarChart = function(config){
		var chartId = config.divId;
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		spqlib.util.parseExtraOptions(config);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.barchart.render, config,spqlib.barchart.preQuery,spqlib.barchart.failQuery);
	}
	
	
	
	var my = { };
	 
	 my.DEFAULT_AXIS_LABEL_MAX_LENGTH = 15;
	 
	 
	my.chartImpl = function () {
		return spqlib.jqplot();
	}
	
	my.exportAsImage = function(){
		
	}
	
	my.toggleFullScreen = function(graphId){
		var graphDiv = $("#"+graphId+"-container");
		var cssClass= this.config.divCssClass ;
		var cssClassFullScreen = this.config.divCssClassFullScreen;
		graphDiv.toggleClass(cssClass);
		graphDiv.toggleClass(cssClassFullScreen);
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
		var chart =  spqlib.barchart.chartImpl().drawBarChart(labels,series,config);
		chart.toggleFullScreen = my.toggleFullScreen;
		spqlib.addToRegistry(chartId,chart);
		$( "#"+chartId ).trigger( "done" );
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