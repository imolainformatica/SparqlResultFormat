/**
 * 
 */
 
 /*(function (window, undefined) {
	S = {}
	
    S.core = (function () {
        // global public constants
        var
            VERSION = "0.0.1",
			//max length of a word inside a label
            DEFAULT_WORD_MAX_LENGTH = 12,
			//max length of a label
			DEFAULT_LABEL_MAX_LENGTH = 30;
			
        return {
            VERSION: VERSION,
			CONSTANTS: {DEFAULT_WORD_MAX_LENGTH,
						DEFAULT_LABEL_MAX_LENGTH},
        };
    }());
	
	S.util = (function () {
		
	}());
	
	if (window.sparqlLib) {
        throw new Error("Javascript module 'sparqlLib' already exists.");
    }
	window.sparqlLib = {
		VERSION:S.core.VERSION,
		CONSTANTS:S.core.CONSTANTS
	}
	
}(window));*/
 
 
/**
 * aggiunge in testa i prefissi con i vari namespace in modo che non debbano essere ripetuti in ogni query
 */
function addPrefixes(sparql) {
	var prefs = "";
    var globalPrefixes = window.smwQueryPrefixes;
	for (var i = 0; i < globalPrefixes .length; i++) {
		var obj = globalPrefixes [i];
		prefs += "prefix " + obj.pre + ":<" + obj.ns + ">\n";
	}
	return prefs + "\n" + sparql;
}

window.renderGraph = function (config) {
	query(config.endpoint,config.sparql,render,config);
}

/**
 * effettua la chiamata asincrona all'endpoint sparql. al termine viene richiamata la funzione di callback passata come parametro
 */
function query(endpoint, sparql, callback, configuration) {
	
	sparql = addPrefixes(sparql);
	
	var mime = "application/sparql-results+json";
	//mettere loading
	if (!configuration.divStyle){
	    configuration.divStyle="";
	}
    $("#"+configuration.divId+"-container").find(".cytoscape-actions-list").hide();
	$("#"+configuration.divId+"-legend-container").attr("style",configuration.divStyle+" display:block; width:100%; border:none !important;");
	$("#"+configuration.divId+"-legend").attr("style",configuration.divStyle+" width:100% !important; text-align: center;");
	
	if (configuration.spinnerImagePath){
		$("#"+configuration.divId+"-legend").html("<img src='"+configuration.spinnerImagePath+"' style='vertical-align:middle;'>");
	} else {
		$("#"+configuration.divId+"-legend").html("Loading...");
	}
	var jqxhr = $.post(endpoint, {
		query : sparql
	}, function() {
	}).done(function(json) {
		//togliere loading
		$("#"+configuration.divId+"-legend").html("");
		$("#"+configuration.divId+"-legend").attr("style","");
		$("#"+configuration.divId+"-container").find(".cytoscape-actions-list").show();
		$("#"+configuration.divId+"-legend-container").attr("style","");
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

function printErrorBox(message){
	var html="<div class='alert alert-danger' role='alert'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span><span class='sr-only'>Error:</span>"+message+"</div>";
	return html;
	
}

/*
 function saveAsFile(fileNameToSaveAs, textToWrite) {  
 var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
 ie11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
 ieEDGE = navigator.userAgent.match(/Edge/g),
 ieVer=(ie ? ie[1] : (ie11 ? 11 : (ieEDGE ? 12 : -1)));

 if (ie && ieVer<10) {
 console.log("No blobs on IE ver<10");
 return;
 }

 var textFileAsBlob = new Blob([textToWrite]);

 if (ieVer>-1) {
 window.navigator.msSaveBlob(textFileAsBlob, fileNameToSaveAs);

 } else {
 var downloadLink = document.createElement("a");
 downloadLink.download = fileNameToSaveAs;
 downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
 downloadLink.onclick = function(e) { document.body.removeChild(e.target); };
 downloadLink.style.display = "none";
 document.body.appendChild(downloadLink);
 downloadLink.click();
 }
 }*/

var defaultCytoscapeStyle = [ // the stylesheet for the graph
{
	selector : 'node',
	style : {
		'width' : 40,
		'height' : 40,
		/*'shape':'rectangle',*/
		'background-fit' : 'contain',
		'background-color' : 'data(color)',
		'background-image' : null,
		'label' : 'data(label)',
		'labelFontSize' : 10
	}
}, {
	selector : 'edge',
	style : {
		'width' : 5,
		//'label': 'data(property)',
		'line-color' : 'data(color)',
		'target-arrow-color' : 'data(color)',
		'target-arrow-shape' : 'triangle'
	}
}, {
	selector : '.multiline-auto',
	style : {
		'text-wrap' : 'wrap',
		'text-max-width' : 80,
	}
}, {
	selector : '.background',
	style : {
		/*'text-background-opacity' : 1,
		'text-background-color' : '#fff',*/
		'text-background-shape' : 'roundrectangle',
		/*'text-border-color' : '#ccc',
		'text-border-width' : 1,*/
		'text-border-opacity' : 1,
		'text-wrap' : 'wrap',
		'text-max-width' : 100,
		/*'text-valign': 'center',
        'text-halign': 'center'*/
	}
} ];

var layouts = [];
layouts['dagre'] = {
	name : 'dagre',
	padding : 50
};
layouts['random'] = {
	name : 'random',
	padding : 50
};
layouts['preset'] = {
	name : 'preset',
	padding : 50
};
layouts['grid'] = {
	name : 'grid',
	padding : 50
};
layouts['circle'] = {
	name : 'circle',
	padding : 50
};
layouts['concentric'] = {
	name : 'concentric',
	padding : 50
};
layouts['breadthfirst'] = {
	name : 'breadthfirst',
	padding : 50
};
layouts['cose'] = {
	name : 'cose',
	padding : 50
};

//array che conterrà tutti i grafici generati in pagina
var g = [];

/**
* simple function for cloning objects
*/
function cloneObject(obj) {
    var clone = {};
    for(var i in obj) {
        if(typeof(obj[i])=="object" && obj[i] != null)
            clone[i] = cloneObject(obj[i]);
        else
            clone[i] = obj[i];
    }
	return clone;
}


function exportAsImage(divId) {
	var png64 = g[divId].png({
		full : true
	});
	var hiddenElement = document.createElement('a');
	hiddenElement.href = png64;//'data:attachment/text,' + encodeURI(textToSave);
	hiddenElement.target = '_blank';
	//non funziona in IE
	hiddenElement.download = 'export.png';
	hiddenElement.click();
}

/**
 * attiva/disattiva la modalità schermo intero per un determinato grafo
 */
window.toggleFullScreen = function(divId) {
	if (g[divId].isfullScreen) {
		g[divId].isFullScreen = false;
	}
	var containerSelector = "#" + divId + "-container";
	var graphSelector = "#" + divId + "";
	var legendSelector = "#" + divId + "-legend-container";
	if (g[divId].isFullScreen == true) {
		$(containerSelector).toggleClass('container-cytoscape-full-screen');
		$(legendSelector).toggleClass('legend-cytoscape-full-screen');
		$(graphSelector).toggleClass('graph-cytoscape-full-screen');
		$(graphSelector).css("height", g[divId].normalGraphHeight);
		g[divId].isFullScreen = false;
		$(legendSelector).find(".fullscreen-label").text("Go fullscreen");
		$(legendSelector).find("i.glyphicon-resize-small").removeClass(
				"glyphicon-resize-small").addClass("glyphicon-fullscreen");
		$(".cytoscape-graph-container").show();
		$(window).scrollTop($("#" + divId).offset().top);
	} else {
		$(".cytoscape-graph-container").hide();
		$(containerSelector).show();
		$(containerSelector).toggleClass('container-cytoscape-full-screen');
		$(legendSelector).toggleClass('legend-cytoscape-full-screen');
		$(graphSelector).toggleClass('graph-cytoscape-full-screen');
		g[divId].normalGraphHeight = $(graphSelector).css("height");
		$(graphSelector).css("height", "100%");
		$(legendSelector).find(".fullscreen-label").text("Exit fullscreen");
		g[divId].isFullScreen = true;
		$(legendSelector).find("i.glyphicon-fullscreen").addClass(
				"glyphicon-resize-small").removeClass("glyphicon-fullscreen");
	}
	g[divId].resize();
	centerGraphToNode(divId,g[divId].config.rootElement);
}


/**
 * nasconde il div container della legenda
 */
function hideLegend(divId) {
	$("#" + divId).hide();
}

/**
 * genera il codice html della legenda
 */
function drawLegend(config) {
    var divId = config.divId+"-legend";
	var table = $("<table>").attr("id", "table-" + divId);
	var showLegend = false;
       var nodeConfiguration=config.nodeConfiguration;
       var edgeConfiguration=config.edgeConfiguration;
       //aggiungo la voce per l'elemento root
       if (config.rootElement){
           if (config.rootElementColor || config.rootElementImage){
			   showLegend = true;
		var colorDiv = $("<div>").addClass("legend-circle-node").attr("type","rootElement").attr(
				"style",
				"background:" + config.rootElementColor
						+ "; background-size:100% 100%;");
		var col1 = $("<td>").append(colorDiv);
		var col2 = $("<td>").append("Current item ("+config.rootElement+")");
		var row = $("<tr>").append(col1).append(col2);
		table.append(row);
           }
       }
	for (var i = 0; i < nodeConfiguration.length; i++) {
		var colorDiv = $("<div>").addClass("legend-circle-node").attr(
				"category-name", nodeConfiguration[i].category).attr(
				"style",
				"background:" + nodeConfiguration[i].nodeColor
						+ "; background-size:100% 100%;");
		var col1 = $("<td>").append(colorDiv);
		var col2 = $("<td>").append(nodeConfiguration[i].category);
		var row = $("<tr>").append(col1).append(col2);
		table.append(row);
		showLegend = true;
	}
	for (var i = 0; i < edgeConfiguration.length; i++) {
		var colorDiv = $("<div>").addClass("legend-arrow-line").attr("style",
				"background:" + edgeConfiguration[i].edgeColor + "");
		var col1 = $("<td>").append(colorDiv);
		var col2 = $("<td>").append(edgeConfiguration[i].relation);
		var row = $("<tr>").append(col1).append(col2);
		table.append(row);
		showLegend = true;
	}
	if (showLegend) {
		$("#" + divId).append(table);
	} else {
		hideLegend(divId);
	}
}

/**
 * ritona il colore associato ad un determinato valore in input. se non esiste ritorna il colore di default
 */
function mapTypeToColor(type, colorConf, defaultColor) {
	if (colorConf[type]) {
		return colorConf[type];
	} else {
		return defaultColor;
	}
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

/**
 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. effettua il mapping dell'output e setta le impostazioni del grafo 
 */
function render(json, config) {
	var head = json.head.vars;
	var data = json.results.bindings;
	var edges = [];
	var nodes = [];
	var distinctNodes = [];
	var nodeIds = 1;

	var colorConf = [];
	var nodeConfiguration = config.nodeConfiguration;
	for (var i = 0; i < nodeConfiguration.length; i++) {
		var cat = nodeConfiguration[i];
		colorConf[cat.category] = cat.nodeColor;
	}
	var edgeConfiguration = config.edgeConfiguration;
	for (var i = 0; i < edgeConfiguration.length; i++) {
		var rel = edgeConfiguration[i];
		colorConf[rel.relation] = rel.edgeColor;
	} 
       if (data.length==0 && config.rootElement){
            nodes.push({data:{label:config.rootElement,id:config.rootElement,color:"#000"},classes:"background"});
       }

	for (var i = 0; i < data.length; i++) {
		var parent = data[i]["parent_name"].value;
		var child = data[i]["child_name"].value;
		if (!distinctNodes[parent]) {
			var node = new Object();
			type = data[i]["parent_type"].value;
			node.type = type;
			distinctNodes[parent] = node.id = parent;
			nodeIds++;
			node.label = cutLongLabel(parent,config.maxLabelLength,config.maxWordLength);
			node.color = mapTypeToColor(type, colorConf,
					config.defaultNodeColor);
			nodes.push({
				data : node,
				classes : "background"
			});
		}
		if (!distinctNodes[child]) {
			var node = new Object();
			type = data[i]["child_type"].value;
			node.type = type;
			distinctNodes[child] = node.id = child;
			nodeIds++;
			node.label = cutLongLabel(child,config.maxLabelLength,config.maxWordLength);
			node.color = mapTypeToColor(type, colorConf,
					config.defaultNodeColor);
			node.image = null;
			nodes.push({
				data : node,
				classes : "background"
			});
		}
		var edge = new Object();
		edge.source = distinctNodes[parent];
		edge.target = distinctNodes[child];
		edge.property = data[i]["relation_name"].value;
		edge.color = mapTypeToColor(edge.property, colorConf,
				config.defaultEdgeColor);
		edges.push({
			data : edge
		});
	}
	drawGraph(nodes, edges, config);
}

function cutLongLabel(value,maxLength, maxWordLength){
	if (!maxLength){
		maxLength = 30; //sparqlLib.CONSTANTS.DEFAULT_LABEL_MAX_LENGTH;
	}
	if (value){
		value = splitLongWords(value,maxWordLength);
		if (value.length>maxLength){
				return value.substring(0,maxLength)+"...";
		} else {
			return value;
		}
	}
}

function splitLongWords(value, maxWordLength){
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
}


function renderExploreSection(props,nodeLabel,divId){
	var incomingHeader="<div class='qtip-section'><b>Incoming connections</b></div>";
	var outgoingHeader="<div class='qtip-section'><b>Outgoing connections</b></div>";
	var incomingLinks = "";
	var outgoingLinks = "";
	var output="";
	for (var i = 0; i < props.length; i++) {
		if (props[i].property.direction=="IN"){
			incomingLinks += renderExpandNodeLink(props[i],nodeLabel,divId);
		} else {
			outgoingLinks += renderExpandNodeLink(props[i],nodeLabel,divId);
		}
	}
	if (incomingLinks!=""){
		output+=incomingHeader+incomingLinks;
	}
	if (outgoingLinks!=""){
		output+=outgoingHeader+outgoingLinks;
	}
	return output;
}

function renderExpandNodeLink(prop,nodeLabel,divId){
	var ICON_PLUS = "<span class='glyphicon glyphicon-plus-sign' style='margin-right:5px;'></span>";
	var ICON_MINUS = "<span class='glyphicon glyphicon-minus-sign' style='margin-right:5px;'></span>";
	var funcName = "";
   
   var linkLabel=prop.property.label;
   var icon = "";
    if (isNodeExpandedForRelation(divId,nodeLabel,prop.property.uri,prop.property.direction)){
		icon =  ICON_MINUS;
		funcName="collapseNode";
	} else {
		icon =  ICON_PLUS;
		funcName="expandNode";
	}
   linkLabel=icon+linkLabel;
   linkLabel+="</a></br>";
   var aLink = "<a href='#' onclick='"+funcName+"(\""+ divId+ "\",\""+ nodeLabel+ "\",\""
													+ prop.property.uri
													+ "\",\""
													+ prop.property.direction 
													+ "\")' >";
   return aLink+linkLabel;
}

function renderSingleCategoryLink(type){
	return "<a href='./EAP:PageList?category="+ type + "' target='_blank'>"+ type + "</a>";
}

function renderCategoryLink(types){
	var out = "";
	if (types instanceof Array) {
		for (var i = 0; i < types.length; i++) {
			out+=renderSingleCategoryLink(types[i]);
		    if (i<types.length-1){
				out+=",";
			}
		}
	} else {
		out = renderSingleCategoryLink(types);
	}	
	return "Category: "+out+"</br>";
}

function enableTooltipOnNodes(divId) {

	// just use the regular qtip api but on cy elements
	g[divId]
			.elements()
			.nodes()
			.qtip(
					{
						content : function() {
							var conf = this.cy().config;
                                                 var pageLink = $("<a>").attr("href",conf.linkBasePath+this.data("label")).attr("target","_blank");
                                                 var pageCategory = $("<span>").addClass("cytoscape-qtip-category");
							var target = "_self";
							if (conf.tipLinkTarget){
								target = conf.tipLinkTarget;
							}
                            var linkHref = conf.linkBasePath+ "" + htmlEncode(this.data("id")).replace(/'/g, "&apos;");
							var tip = "<a href='"
									+ linkHref
									+ "' target='"+target+"'>"
									+ this.data("id")
									+ "</a></br>";
							tip+=renderCategoryLink(this.data("type"));
							if (conf.globalConfiguration) {
								if (conf.globalConfiguration[this.data("type")]) {
									if (conf.globalConfiguration[this
											.data("type")].explore) {
										extra = conf.globalConfiguration[this
												.data("type")].explore;
										tip += renderExploreSection(extra,this.data('label'),this.cy().config.divId);
									}
								}
							}
							return tip;
						},
						position : {
							my : 'top center',
							at : 'bottom center'
						},
						style : {
							classes : 'qtip-bootstrap',
							tip : {
								width : 16,
								height : 8
							}
						}
					});

}
function enableTooltipOnEdges(divId) {

	// just use the regular qtip api but on cy elements
	g[divId].elements().edges().qtip({
		content : function() {
			return "" + this.data("property") + ""
		},
		position : {
			my : 'top center',
			at : 'bottom center'
		},
		style : {
			classes : 'qtip-bootstrap',
			tip : {
				width : 16,
				height : 8
			}
		}
	});

}

/**
* copia l'oggetto stile
*/
function newDefaultStyleObject(){
	var newStyle = [];
	for (var j = 0; j < defaultCytoscapeStyle.length; j++) {
		newStyle[j] = cloneObject(defaultCytoscapeStyle[j]);		
	}
	return newStyle;
}

/**
 * funzione che si occupa di inizializzare il grafo cytoscape
 */
function drawGraph(nodes, edges, config) {

	var divId = config.divId;
	var layout = getSelectedLayout(config);
	//add extra property to layout
	for ( var key in config.layoutOptions) {
		var value = config.layoutOptions[key];
		layout[key] = value;
	}
	var style = newDefaultStyleObject(); 
	if (config.nodeStyle){
		for ( var key in config.nodeStyle) {
			var value = config.nodeStyle[key];
			style[0].style[key] = value;
		}
	}
	if (config.edgeStyle){
		for ( var key in config.edgeStyle) {
			var value = config.edgeStyle[key];
			style[1].style[key] = value;
		}
	}
	
	g[divId] = cytoscape({
		container : document.getElementById(config.divId), // container to render in
		elements : {
			nodes : nodes,
			edges : edges
		},
		style : style,

		layout : layout,
		motionBlur : true,
		selectionType : 'single',
		boxSelectionEnabled : false,
		/*autoungrabify: true,*/
		zoom : 0.9,
		minZoom : config.minZoom,
		maxZoom : config.maxZoom,
		wheelSensitivity : 0.1,
		pan : {
			x : 0,
			y : 0
		},

		// interaction options:
		zoomingEnabled : true,
		userZoomingEnabled : true,
	});
       if (config.showLegend=="true" || config.rootElement){
             drawLegend(config);
       } else {
              hideLegend(config.divId+"-legend");
       }

	enableTooltipOnNodes(divId);
	enableTooltipOnEdges(divId);

	g[divId].config = config;
	g[divId].on('select', 'node', function(e) {
	});

	g[divId].on('ready', function(e) {
		var conf = e.cy.config;
		var divIdentifier = conf.divId;

		assignBgImageToNodes(conf);
		if (conf.rootElement) {
			if (conf.rootElementColor) {
				var el = e.cy.getElementById(conf.rootElement);
				el.style('background-color', conf.rootElementColor);
			}
			if (conf.rootElementImage) {
				var el = e.cy.getElementById(conf.rootElement);
                            if (el.length>0){
				    el.style('background-color', "white");
                                el.style('background-image', conf.rootElementImage);
                            }

			}
                     
		}

		centerGraphToNode(divIdentifier,conf.rootElement);
		$("#headertabs ul li a").on(
				'click',
				function(event, ui) {
					var tabDivId = $(this).attr("href");
					var t = $(tabDivId).find(
							".cytoscape-graph-container div.cytoscape-graph").attr("id");
					if (t) {
						g[t].resize();
						$(".cytoscape-graph-container").show();
						centerGraphToNode(t,g[t].config.rootElement);
					}
				});

	});
}

function assignBgImageToNodes(conf) {

       if (conf.rootElementImage){
             var legendDiv = $("#table-" + conf.divId
					+ "-legend div[type='rootElement']");
		legendDiv.css("background-color", "white");
		legendDiv.css("background-image", 'url("' + conf.rootElementImage+ '")');


       }
	for (var i = 0; i < conf.nodeConfiguration.length; i++) {
		var obj = conf.nodeConfiguration[i];
		//in caso di nodi con immagini devo aggiornare i nodi e la legenda settando l'immagine di sfondo
		if (obj.image) {
			var eles = g[conf.divId].elements('node[type="' + obj.category
					+ '"]');
			for (var j = 0; j < eles.length; j++) {
				var ele = eles[j];
				ele.style('background-image', obj.image);
				ele.style('background-opacity', 0);
			}
			//aggiorno anche la legenda
			var legendDiv = $("#table-" + conf.divId
					+ "-legend div[category-name='" + obj.category + "']");
			legendDiv.css("background-color", "white");
			legendDiv.css("background-image", 'url("' + obj.image + '")');
		}
	}
}

     function collapseNode(graphId,label,property,direction){

		if (direction && direction=="IN"){
			getGraphElementById(graphId,label).incomers("edge[propertyURI='"+property+"']").forEach(function( ele ){
				ele.source().successors().remove();
				ele.source().remove();
				ele.remove();
			});
		} else {
			getGraphElementById(graphId,label).outgoers("edge[propertyURI='"+property+"']").forEach(function( ele ){
				ele.target().successors().remove();
				ele.target().remove();
				ele.remove();
			});
		}
		setNodeExpandedForRelation(graphId,label,property,direction,false);
     }
     function expandNode(divId,label,property,direction){
         var conf = g[divId].config;
         conf.expandNodeInfo = {source:label, property:property,direction:direction};
		 if (direction && direction=="IN"){
			 var q = generateExpandNodeQueryIn(label, property);
			 var qWithPrefixes = addPrefixes(q);
			 query(conf.endpoint, qWithPrefixes , addNodesIn, conf);
		 }else {
			var q = generateExpandNodeQueryOut(label, property,"");
			var qWithPrefixes = addPrefixes(q);
			query(conf.endpoint, qWithPrefixes , addNodesOut, conf);
		 }
    }
	
	function addNodesIn(json,config){
        var head = json.head.vars;
        var data = json.results.bindings;
        var edges = [];
        var nodes = [];
        for (var i = 0; i < data.length; i++) {
            var label = data[i]["parent_label"].value;
	    var node = new Object();
	    type = data[i]["parent_type_label"].value;
            var relation= data[i]["relation_label"].value;
	    node.type = type;
	    node.id = label;
	    node.label = cutLongLabel(label,config.maxLabelLength,config.maxWordLength);
	    node.color = mapTypeToColor(type, config.colorConf,config.defaultNodeColor);
	    nodes.push({
	        data: node,
	        classes: "background"
	      });
            //per ogni nodo creo anche il relativo arco ma solo se non esiste già             
			var edge = new Object();
            edge.source = node.label;
            edge.target = config.expandNodeInfo.source;
            edge.property = relation;
			edge.propertyURI = config.expandNodeInfo.property;
            edge.color= mapTypeToColor(edge.property, config.colorConf,config.defaultEdgeColor); 
			
            if (!existEdge(config.divId,edge.source,edge.target)){
                edges.push({
                    data: edge
                });
            }
       }
       if (data.length>0){
			addNodesToGraph(config.divId,nodes);
			addEdgesToGraph(config.divId,edges);
			setLayoutToGraph(config.divId,getSelectedLayout(config));
			enableTooltipOnNodes(config.divId);
			enableTooltipOnEdges(config.divId);
			assignBgImageToNodes(config);
			centerGraphToNode(config.divId,config.expandNodeInfo.source);
			setNodeExpandedForRelation(config.divId,config.expandNodeInfo.source,config.expandNodeInfo.property,config.expandNodeInfo.direction,true);
	   }
	}
     
    function addNodesOut(json,config){

        var head = json.head.vars;
        var data = json.results.bindings;
        var edges = [];
        var nodes = [];
        for (var i = 0; i < data.length; i++) {
            var label = data[i]["child_label"].value;
			type = data[i]["child_type_label"].value;
			var relation= data[i]["relation_label"].value;
			var color = mapTypeToColor(type, config.colorConf,config.defaultNodeColor);
			var node = new Object();
			node.type = type;
			node.id = label;
			node.label = cutLongLabel(label,config.maxLabelLength,config.maxWordLength);
			node.color = mapTypeToColor(type, config.colorConf,config.defaultNodeColor);
			nodes.push({
				data: node,
				classes: "background"
			  });
			//per ogni nodo creo anche il relativo arco ma solo se non esiste gi�
			  var edge = new Object();
			edge.source = config.expandNodeInfo.source;
			edge.target = node.id;
			edge.property = relation;
			edge.propertyURI = config.expandNodeInfo.property;
			edge.color= mapTypeToColor(edge.property, config.colorConf,config.defaultEdgeColor); 
			if (g[config.divId].elements("edge[source='"+edge.source+"'][target='"+edge.target+"']").length==0 ){
				edges.push({
					data: edge
				});
			}
       }
       if (data.length>0){
			addNodesToGraph(config.divId,nodes);
			addEdgesToGraph(config.divId,edges);
			setLayoutToGraph(config.divId,getSelectedLayout(config));
			enableTooltipOnNodes(config.divId);
			enableTooltipOnEdges(config.divId);
			assignBgImageToNodes(config);
			centerGraphToNode(config.divId,config.expandNodeInfo.source);
			setNodeExpandedForRelation(config.divId,config.expandNodeInfo.source,config.expandNodeInfo.property,config.expandNodeInfo.direction,true);
	   }

   }

	function createNode(id,label,type,color,maxLength,maxWordLength){
		var node = new Object();
		node.type = [];
		node.type.push(type);
		node.id = id;
		node.label = cutLongLabel(label,maxLength,maxWordLength);
		node.color = color;
		return node;	
	}
	
	
    /**
    * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. effettua il mapping dell'output e setta le impostazioni del grafo 
    */
    function renderInitialNode(json, config) {
        var head = json.head.vars;
        var data = json.results.bindings;
        var edges = [];
        var nodes = [];
        var distinctNodes = [];
        var nodeIds = 1;

        var colorConf = [];
        var nodeConfiguration=config.nodeConfiguration;
        for (var i = 0; i < nodeConfiguration.length; i++) {
            var cat = nodeConfiguration[i];
            colorConf[cat.category] = cat.nodeColor;
        }
        var edgeConfiguration=config.edgeConfiguration;
        for (var i = 0; i < edgeConfiguration.length; i++) {
            var rel = edgeConfiguration[i];
            colorConf[rel.relation] = rel.edgeColor;
        }
        config.colorConf=colorConf;

        for (var i = 0; i < data.length; i++) {
            var label = data[i]["label"].value;
			type = data[i]["type_label"].value;
			var color = mapTypeToColor(type, colorConf,config.defaultNodeColor);
			var node = createNode(label,label,type,color,config.maxLabelLength,config.maxWordLength);
			nodes.push({
				data: node,
				classes: "background"
			});
            }
        drawGraph(nodes, edges,config);
    }
	
	
	
	
	 /**
	 * ritorna il nome dell'oggetto e il tipo del nodo iniziale
	 */
     function generateInitialQuery(label){
         return "SELECT ?label ?type_label WHERE { { VALUES ?root_label {'"+label+"'}   ?s rdfs:label ?label.   ?s rdfs:label ?root_label.   ?s rdf:type ?type.   ?type rdfs:label ?type_label.} }"; 
     }
	 
	 function generateExpandNodeQueryIn(label, property){
        return "SELECT distinct ?parent_label ?parent_type_label ?relation_label WHERE { "+
                 "{  VALUES ?root_label {'"+label+"'} "+
"   ?parent rdfs:label ?parent_label. "+
"   ?parent "+property+" ?child. "+
"   ?child rdfs:label ?root_label. "+
"   ?parent ?relation ?child. "+
"   ?relation rdfs:label ?relation_label. "+
"   ?parent rdf:type ?parent_type. ?parent_type rdfs:label ?parent_type_label."+  
"}  }"; 

    }

    function generateExpandNodeQueryOut(label, property,targetType){
        return "SELECT distinct ?child_label ?child_type_label ?relation_label WHERE { "+
                 "{  VALUES ?root_label {'"+label+"'} "+
"   ?s rdfs:label ?label. "+
"   ?s rdfs:label ?root_label. "+
"   ?s "+property+" ?child. "+
"   ?s ?relation ?child. "+
"   ?relation rdfs:label ?relation_label. "+
"   ?child rdfs:label ?child_label. "+
"   ?child rdf:type ?child_type. ?child_type rdfs:label ?child_type_label."+
"   ?child_type rdfs:label ?child_type_label. "+    
"}  }"; 

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
					linkCellValue = "<a href='"+htmlEncode(config.linkBasePath).replace(/'/g, "&apos;")+cellValue+"'>"+cellValue+"</a>";
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
	


function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

/*SET DI FUNZIONI PER DISACCOPPIARE DALL'INTERFACCIA DI CYTOSCAPE*/
	function getGraphElementById(graphId,elementId){
		return g[graphId].getElementById(elementId);
	}
	
	function getGraphElementData(graphId,elementId,attribute){
		return getGraphElementById(graphId,elementId).data(attribute);
	}
	
	function setGraphElementData(graphId,elementId,attribute,value){
		getGraphElementById(graphId,elementId).data(attribute,value);
	}
	
	function setNodeExpandedForRelation(graphId,elementId,propertyURI,propertyDirection,value){
		var exp = getGraphElementData(graphId,elementId,"nodeExpansion");
		if (!exp){
			exp=[];
		}
		var prop = "";
		if (propertyDirection){
			if (propertyDirection=="IN"){
				prop = "IN-"+propertyURI;
			} else {
				prop = "OUT-"+propertyURI;
			}
		}else {
			prop = "OUT-"+propertyURI;
		}
		exp[prop]=value;
		setGraphElementData(graphId,elementId,"nodeExpansion",exp);
	}
	
	function isNodeExpandedForRelation(graphId,elementId,propertyURI,propertyDirection){
		var exp = getGraphElementData(graphId,elementId,"nodeExpansion");
		var prop = "";
		if (propertyDirection){
			if (propertyDirection=="IN"){
				prop = "IN-"+propertyURI;
			} else {
				prop = "OUT-"+propertyURI;
			}
		}else {
			prop = "OUT-"+propertyURI;
		}
        if (exp){
	       if (exp[prop]==true){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	
    function addNodesToGraph(graphId,nodes){
		g[graphId].add(nodes);
	}
	
	function addEdgesToGraph(graphId,edges){
		g[graphId].add(edges);
	}
	
	function getSelectedLayout(config){
	    if (!layouts[config.layout]) {
			alert('layout ' + config.layout + ' not supported');
			throw "layout not supported";
		}
		return cloneObject(layouts[config.layout]);
	}
	
    function setLayoutToGraph(graphId,layout){
        g[graphId].layout(layout);
	}
	
	function existEdge(graphId,sourceNodeId, targetNodeId){
		 if (g[graphId].elements("edge[source='"+sourceNodeId+"'][target='"+targetNodeId+"']").length==0)
			 return false;
		 else 
			 return true;
	}
	
	
/**
 * centra il grafo sull'elemento root (se è stato definito nella configurazione oppure su tutto il grafo
 */
function centerGraphToNode(graphId,nodeId) {
	if (nodeId && nodeId != "null") {
		g[graphId].center(g[graphId]
				.getElementById(g[graphId].config.rootElement));
		var pos = g[graphId].pan();
		var newPos = {
			x : pos.x,
			y : 45
		};
		g[graphId].pan(newPos);
	} else {
		g[graphId].center();
	}
}