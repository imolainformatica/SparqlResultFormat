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
	   var colTitles = config.columnTitles || config.columnConfiguration;
	   var colTitleMapping = {};
	   if (colTitles){
		   for (var i = 0; i < colTitles.length; i++) {
			   colTitleMapping[colTitles[i].queryField] = {
				   label:colTitles[i].label,
				   showLink:colTitles[i].showLink,
				   cellValuePattern:colTitles[i].cellValuePattern,
				   cellLinkPattern:colTitles[i].cellLinkPattern,
			   };
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
					if (mappedColumnInfo.showLink == 'true'){
						linkCellValue = getCellLinkValue(config,cellValue,mappedColumnInfo); 
					} else {
						linkCellValue = getCellValue(cellValue,mappedColumnInfo);
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
		var csvExport = config.csvExport || false;
		if (window.exportTableToCSV && csvExport){
			//aggiungo il link per l'export csv delle pagine
			var filename = config.csvFileName || 'export.csv';
			var label = config.csvLinkLabel || 'Export as CSV';
			var csvFormAction = config.csvFormAction;
			if (!csvFormAction){
				throw ("csvFormAction vuota -> l'export pdf non funzionerà");
			}
			var tableContainer = $("#"+config.divId).find("table");
			tableContainer.after("<span class='export-table-csv'><a class='export'>"+label+"</a><form action='"+csvFormAction+"' method ='post' ><input type='hidden' id='csv_text' name='csv_text' /><input type='hidden' id='csv_file_name' name='csv_file_name' value='"+filename+"'/></form></span>");
			window.exportTableToCSVClickHandler();
		}	
        $( "#"+config.divId ).trigger( "done" );		
	}
	
	function getCellLinkValue(config,cellValue,columnConfiguration){
		
		var link = "";
		if (columnConfiguration.cellLinkPattern){
			link = formatString(columnConfiguration.cellLinkPattern,cellValue);
		} else {
			link = config.linkBasePath+cellValue;
		}
		var formattedCellValue = getCellValue(cellValue,columnConfiguration);
		return "<a href='"+spqlib.util.htmlEncode(link).replace(/'/g, "&apos;")+"'>"+formattedCellValue+"</a>";
	}
	
	function getCellValue(cellValue,columnConfiguration){
		if (columnConfiguration.cellValuePattern){
			return formatString(columnConfiguration.cellValuePattern,cellValue)
		}
		return cellValue;
	}
	
	function formatString(format,param){
		 var formatted = format.replace("{%s}", param);
		 return formatted;
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