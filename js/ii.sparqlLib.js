var spqlib = ( function ( $, undefined ) {
	'use strict';
	
	var S = {};
    var VERSION = "0.0.1";
	
	S.util = (function () {
        // global public constants
			
        return {
        	/**
        	 * aggiunge in testa i prefissi con i vari namespace in modo che non debbano essere ripetuti in ogni query
        	 */
			        	addPrefixes : function (sparql, prefixes) {
				if (prefixes) {
					var prefs = "";
					for (var i = 0; i < prefixes.length; i++) {
						var obj = prefixes[i];
						prefs += "prefix " + obj.pre + ":<" + obj.ns + ">\n";
					}
					return prefs + "\n" + sparql;
				} else {
					return sparql;
				}
			},
			
			htmlEncode : function (value){
				  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
				  //then grab the encoded contents back out.  The div never exists on the page.
				  return $('<div/>').text(value).html();
				},
			cutLongLabel: function (value,maxLength, maxWordLength){
					if (!maxLength){
						maxLength = 30; //sparqlLib.CONSTANTS.DEFAULT_LABEL_MAX_LENGTH;
					}
					if (value){
						value = this.splitLongWords(value,maxWordLength);
						if (value.length>maxLength){
								return value.substring(0,maxLength)+"...";
						} else {
							return value;
						}
					}
				},

				splitLongWords:	function (value, maxWordLength){
					if (value){
							if (!maxWordLength){
								maxWordLength=12; //sparqlLib.CONSTANTS.DEFAULT_WORD_MAX_LENGTH;
							}
							var words = value.split(" ");
							var res = "";
							for (var i = 0; i < words.length; i++) {
									if (words[i].length > maxWordLength){
										var n = words[i].length / maxWordLength;
										var a = words[i];
										var b = '\n';
										for (var j = 0; j < n; j++) {	
											a = [a.slice(0, maxWordLength*(j+1)+j), b, a.slice(maxWordLength*(j+1)+j)].join('');
										}
										res+=a+" ";
									} else {
										res +=words[i]+" ";
									}					
							}
							return res.trim();
					}	
				},
				/**
				 * simple function for cloning objects
				 */
				cloneObject: function(obj) {
					var clone = {};
					for ( var i in obj) {
						if (typeof (obj[i]) == "object" && obj[i] != null)
							clone[i] = this.cloneObject(obj[i]);
						else
							clone[i] = obj[i];
					}
					return clone;
				},

        	
        
        /**
		 * effettua la chiamata asincrona all'endpoint sparql. al termine viene
		 * richiamata la funzione di callback passata come parametro
		 */
        doQuery: function query(endpoint, sparql, callback, configuration,loading) {
        	
        	//sparql = this.addPrefixes(sparql);
        	
        	var mime = "application/sparql-results+json";
        	//mettere loading
        	if (!configuration.divStyle){
        	    configuration.divStyle="";
        	}
        	if (loading==undefined || loading==true){
	            $("#"+configuration.divId+"-container").find(".ii-graph-legend-actions-list").hide();
	        	$("#"+configuration.divId+"-legend-container").attr("style",configuration.divStyle+" display:block; width:100%; border:none !important;");
	        	$("#"+configuration.divId+"-legend").attr("style",configuration.divStyle+" width:100% !important; text-align: center;");
	        	
	        	if (configuration.spinnerImagePath){
	        		$("#"+configuration.divId+"-legend").html("<img src='"+configuration.spinnerImagePath+"' style='vertical-align:middle;'>");
	        	} else {
	        		$("#"+configuration.divId+"-legend").html("Loading...");
	        	}
        	}
        	var jqxhr = $.post(endpoint, {
        		query : sparql
        	}, function() {
        	}).done(function(json) {
        		//togliere loading
        		if (loading==undefined || loading==true){
	        		$("#"+configuration.divId+"-legend").html("");
	        		$("#"+configuration.divId+"-legend").attr("style","");
	        		$("#"+configuration.divId+"-container").find(".ii-graph-legend-actions-list").show();
	        		$("#"+configuration.divId+"-legend-container").attr("style","");
        		}
        		callback(json, configuration);
        	}).fail(function(jqXHR, textStatus, errorThrown) {
        		$("#"+configuration.divId+"-legend").html("");
        		$("#"+configuration.divId+"-legend").html(printErrorBox(textStatus));
        		throw new Error("Error invoking sparql endpoint "+textStatus+" "+JSON.stringify(jqXHR));
        	}).always(function() {
        	});
        	// Set another completion function for the request above
        	jqxhr.always(function() {
        	});
        }
        
        };
    }());
	
	
	function sparql2Table(config){
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, renderTable, config);
	}
	
	 /**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. effettua il mapping dell'output e setta le impostazioni del grafo 
	 */
	function renderTable(json, config) {
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
				var cellValue = data[i][headers[j]].value;
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
	
	function sparql2GraphExplorer(config){
		initHtml(config);
		if (config.rootElement && !config.sparql){
			config.sparql=spqlib.graph.generateInitialQuery(config.rootElement);
		}
	    config.globalConfiguration=createColorConfiguration(config.nodeConfiguration,config.edgeConfiguration);
		config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,smwQueryPrefixes);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.graph.renderGraphExplorer, config);
	}
	
	function sparql2Graph(config){
		initHtml(config);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.graph.render, config);
	}
	
	
	
	function initHtml(config){
		var idContainer = config.divId+"-container";
		var idLegendContainer = config.divId+"-legend-container";
		var idLegend = config.divId+"-legend";
		var idLegendActionList = config.divId+"-legend-actions-list";
		var actionFullScreen = "<a href='#' onclick=\"javascript:toggleFullScreen('"+config.divId+"');\"><i class='glyphicon glyphicon-fullscreen'></i><spac class='fullscreen-label' style='padding-left:10px;'>Go fullscreen</span></a>"
		$( "#"+config.divId ).wrap( "<div id='"+idContainer+"' class='ii-graph-container'></div>" );
		$( "#"+idContainer).prepend("<div id='"+idLegendContainer+"' class='ii-graph-legend-container'></div>");
		$( "#"+idLegendContainer).append("<div id='"+idLegend+"' class='ii-graph-legend'></div> ");
		$( "#"+idLegendContainer).append("<div id='"+idLegendActionList+"' class='ii-graph-legend-actions-list'></div> ");
		$( "#"+idLegendActionList).append("<div class='ii-graph-legend-action'>"+actionFullScreen+"</div>");
	}
	
	function createColorConfiguration(nodeConfiguration, edgeConfiguration) {

		var colorConf = [];
		for (var i = 0; i < nodeConfiguration.length; i++) {
			var cat = nodeConfiguration[i];
			colorConf[cat.category] = {
				name : cat.category,
				group : 'node',
				color : cat.nodeColor
			};
			if (cat.explore) {
				colorConf[cat.category].explore = cat.explore;
			}
		}
		for (var i = 0; i < edgeConfiguration.length; i++) {
			var rel = edgeConfiguration[i];
			colorConf[rel.relation] = {
				name : rel.relation,
				group : 'edge',
				color : rel.edgeColor
			};
		}
		return colorConf;
	}
	
	function printErrorBox(message) {
		var html = "<div class='alert alert-danger' role='alert'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span><span class='sr-only'>Error:</span>"
				+ message + "</div>";
		return html;

	}
	
	
	

	
	

		return {
		VERSION : VERSION,
		util : S.util,
		sparql2Table : sparql2Table,
		sparql2Graph : sparql2Graph,
		sparql2GraphExplorer : sparql2GraphExplorer
		//...other kind of output format here
	};
	
}( jQuery ) );
	



//Alias $j to jQuery for backwards compatibility
window.$j = jQuery;

//Attach to window and globally alias
window.spqlib = spqlib;