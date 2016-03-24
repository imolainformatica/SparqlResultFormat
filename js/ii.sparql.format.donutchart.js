spqlib.donutchart = (function () {
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
			labels.push(getSparqlFieldValue(data[i][field_label]));
			for (var j=0;j<numSeries;j++){
				if (!series[j]){
					series[j] = [data.length];
				}
				series[j][i]=getSparqlFieldValueToNumber(data[i][head[j+1]]);
			}
		}

		
		spqlib.donutchart.chartImpl().drawDonutChart(labels,series,config);
	}

	
	function getSparqlFieldValue(field){
		if (field){
			return field.value;
		} else {
			return "";
		}
	}
	
	function getSparqlFieldValueToNumber(field){
		if (field){
			return Number(field.value);
		} else {
			return "";
		}
	}
	
	

	return my;
}());