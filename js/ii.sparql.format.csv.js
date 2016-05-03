spqlib.csv = (function () {
	/**
	* Entry point
	*/
	spqlib.sparql2CSV = function(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.csv.render, config);
	}
	
	var my = { };
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql.
	 */
	my.render = function (json, config) {
		var csvAction = config.csvDownloadAction;
		var fileName = config.filename || 'export.csv';
		var csv = createCSVString(json,config);
		var form = $("#"+config.divId+"-form");
		form.find("input[name='csv_text']").attr('value',csv);
		form.find("input[name='csv_file_name']").attr('value',fileName);
		form.submit();
	}
	
	function createCSVString(json,config){
		
		var sep = config.separator || ';';
		var head = json.head.vars;
		var data = json.results.bindings;
		var rowDelim = '\r\n';
		var str = "";
		var line = "";
		for (var i=0;i<head.length;i++){
			var colonna = head[i];
			var label = mapColonnaToLabel(colonna,config);
			line+=convertCell(label)+sep;
		}
		line = line.slice(0, -1);
		str+=line+rowDelim;
		for (var i = 0; i < data.length; i++) {
			var line = "";
			for (var j=0;j<head.length;j++){
				var colonna = head[j];
				line+=convertCell(spqlib.util.getSparqlFieldValue(data[i][colonna]))+sep;
			}
			line = line.slice(0, -1);
			str+=line+rowDelim;
		}
		
		return str;
	}
	
	function mapColonnaToLabel(colonna,config){
		if (config.headerMapping){
			if (config.headerMapping[colonna]){
				return config.headerMapping[colonna];
			} else {
				return colonna;
			}			
		}
		return colonna;
	}
	
	function convertCell(cell){
		return "\""+cell.replace(/"/g, '""')+"\"";
	}
	

	return my;
}());