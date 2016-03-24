spqlib.table = (function () {
	var my = { };
	
	 /**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. effettua il mapping dell'output e setta le impostazioni del grafo 
	 */
	my.renderTable = function(json, config) {
		var head = json.head.vars;
		var data = json.results.bindings;
		//hide legend div
		$("#"+config.divId+"-legend-container").hide();
		
	   if (data.length==0 ){
			$("#"+config.divId).html("<div class'warning'>"+config.noResultMessage+"</div>");	
			return;
	   }
	   var colTitles = config.columnTitles;
	   var colTitleMapping = {};
	   if (colTitles){
		   for (var i = 0; i < colTitles.length; i++) {
			   colTitleMapping[colTitles[i].queryField] = {label:colTitles[i].label,showLink:colTitles[i].showLink};
		   }
	   }
		   
		//tableHeader
		var headers=[];
		var thead="<thead>";
		for (var i = 0; i < head.length; i++) {
			headers.push(head[i]);
			var mappedColumnInfo = mapColumnTitle(head[i],colTitleMapping);
			var colTitle="";
			if (mappedColumnInfo==null){
				colTitle = head[i];
			} else {
				colTitle = mappedColumnInfo.label;
			}	
			thead += "<th>"+colTitle+"</th>";
		}
		thead+="</thead>";

		//tableRows
		var tbody = "<tbody>";
		for (var i = 0; i < data.length; i++) {
			var row = "<tr class='"+assignRowCssClass(i,config)+"'>";
			for (var j=0;j<headers.length;j++){
				var cellValue = "";
				if (data[i][headers[j]]){
					cellValue = data[i][headers[j]].value;
				}
				var mappedColumnInfo = mapColumnTitle(headers[j],colTitleMapping);
				var linkCellValue = "";
				if (mappedColumnInfo){
					if (mappedColumnInfo.showLink = 'true'){
						linkCellValue = "<a href='"+spqlib.util.htmlEncode(config.linkBasePath).replace(/'/g, "&apos;")+cellValue+"'>"+cellValue+"</a>";
					} else {
						linkCellValue = cellValue;
					}
				} else {
					linkCellValue = cellValue;
				}
				var cell = "<td class='"+assignCellCssClass(i,config)+"'>"+linkCellValue+"</td>";
				row += cell;
			}
			row+="</tr>";
			tbody+=row;
		}
		tbody+="</tbody>";
		var table = "<table class='"+config.tableClass+"'>"+thead+tbody+"</table>";
		$("#"+config.divId).html(table);	
	}

	function isEven(i){
		return (i%2==0);
	}
	function assignRowCssClass(i, config){
		if (isEven(i)){
			if (config.cssEvenRowClass){
				return config.cssEvenRowClass;
			}
		} else {
			if (config.cssOddRowClass){
				return config.cssOddRowClass;
			}
		}
		return "";
	}

	function assignCellCssClass(i, config){
		if (isEven(i)){
			if (config.cssEvenTdClass){
				return config.cssEvenTdClass;
			}
		} else {
			if (config.cssOddTdClass){
				return config.cssOddTdClass;
			}
		}
		return "";
	}

	function mapColumnTitle(field,mapping){
		if (!mapping){
			return null;
		} else {
			if (mapping[field]){
				return mapping[field];
			} else {
				return null;
			}
		}
	}
	
	

	return my;
}());