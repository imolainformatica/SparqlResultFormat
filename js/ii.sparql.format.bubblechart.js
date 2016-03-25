spqlib.bubblechart = (function () {
	var my = { };
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql.  
	 */
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
	
	my.render = function (json, config) {
		$("#"+config.divId+"-legend").show();
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

		
		spqlib.bubblechart.chartImpl().drawBubbleChart(labels,series,config);
	}
	

	return my;
}());