spqlib.graph = (function () {
	var my = { };
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. effettua il mapping dell'output e setta le impostazioni del grafo 
	 */
	my.graphImpl = function () {
		return spqlib.cytoscape();
	}
	
	my.exportAsImage = function(){
		spqlib.graph.graphImpl().exportAsImage();
	}
	
	my.toggleLegendExpansion = function(graphId){
		alert('ciao');
	}
	
	my.toggleFullScreen = function(graphId){
		var containerSelector = "#" + graphId + "-container";
		var legendSelector = "#" + graphId + "-legend-container";
		$(containerSelector).toggleClass('ii-container-graph-full-screen');
		$(legendSelector).find("i").toggleClass("glyphicon-resize-small");
		spqlib.graph.graphImpl().resize(graphId);
		centerGraphToNode(graphId, spqlib.graph.graphImpl().getGraph(graphId).config.rootElement);
	}
	
	my.preQuery = function(configuration){
		if (!configuration.divStyle){
        	    configuration.divStyle="";
        }
		//if (!loading){
			$("#"+configuration.divId+"-container").find(".ii-graph-legend-actions-list").hide();
			$("#"+configuration.divId+"-legend-container").attr("style",configuration.divStyle+" display:block; width:100%; border:none !important;");
			$("#"+configuration.divId+"-legend").attr("style",configuration.divStyle+" width:100% !important; text-align: center;");
			
			if (configuration.spinnerImagePath){
				$("#"+configuration.divId+"-legend").html("<img src='"+configuration.spinnerImagePath+"' style='vertical-align:middle;'>");
			} else {
				$("#"+configuration.divId+"-legend").html("Loading...");
			}
		//}
	}
	
	my.failQuery = function(configuration,jqXHR,textStatus){
		$("#"+configuration.divId+"-legend").html("");
		$("#"+configuration.divId+"-legend").html(generateErrorBox(textStatus));
		throw new Error("Error invoking sparql endpoint "+textStatus+" "+JSON.stringify(jqXHR));
	}
	
	function generateErrorBox(message) {
		var html = "<div class='alert alert-danger' role='alert'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span><span class='sr-only'>Error:</span>"
				+ message + "</div>";
		return html;
	}
	
	my.initHtml = function(config){
		var idContainer = config.divId+"-container";
		var idLegendContainer = config.divId+"-legend-container";
		var idLegendContainerLabel = config.divId+"-legend-container-label";
		var idLegendHeader = config.divId+"-legend-header";
		var idLegend = config.divId+"-legend";
		var idLegendActionList = config.divId+"-legend-actions-list";
		var actionFullScreen = "<a href='#' onclick=\"javascript:spqlib.graph.toggleFullScreen('"+config.divId+"');\"><i class='glyphicon glyphicon-fullscreen'></i><spac class='fullscreen-label' style='padding-left:10px;'>Go fullscreen</span></a>"
		$( "#"+idContainer).prepend("<div id='"+idLegendContainer+"' class='ii-graph-legend-container cytoscape-legend-container'></div>");
		$( "#"+idContainer).prepend("<div id='"+idLegendContainerLabel+"' class='ii-graph-legend-container cytoscape-legend-container-label'>Show legend</div>");
		$( "#"+idLegendContainer).append("<div id='"+idLegendHeader+"' class='ii-graph-legend-header'>"+createLegendHeader(config)+"</div> ");
		$( "#"+idLegendContainer).append("<div id='"+idLegend+"' class='ii-graph-legend'></div> ");
		$( "#"+idLegendContainer).append("<div id='"+idLegendActionList+"' class='ii-graph-legend-actions-list cytoscape-actions-list'></div> ");
		$( "#"+idLegendActionList).append("<div class='ii-graph-legend-action cytoscape-action'>"+actionFullScreen+"</div>");
		
		$( "#"+idContainer).after("<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='70' aria-valuemin='0' aria-valuemax='100' style='width:70%'>70%</div></div>");
	}
	
		
	function createLegendHeader(config){
		var html = "";
		if (config.legendConfiguration){
			var conf = config.legendConfiguration;
			if (conf.expandable=='true'){
				html +="<a href='#' onclick='javascript:spqlib.graph.toggleLegendExpansion('"+config.divId+"')'>Legend</a>"
			} else {
				
			}
			if (conf.expanded="true"){
				
			} else {
				
			}
		}
		return html;
	}
	
	
	my.render = function (json, config) {
		
		$("#"+config.divId+"-legend").html("");
		$("#"+config.divId+"-legend").attr("style","");
		$("#"+config.divId+"-container").find(".ii-graph-legend-actions-list").show();
		$("#"+config.divId+"-legend-container").attr("style","");
		var head = json.head.vars;
		var data = json.results.bindings;
		var edges = [];
		var nodes = [];
		var distinctNodes = [];
		var nodeIds = 1;

		/*var colorConf = [];
		var nodeConfiguration = config.nodeConfiguration;
		for (var i = 0; i < nodeConfiguration.length; i++) {
			var cat = nodeConfiguration[i];
			colorConf[cat.category] = cat.nodeColor;
		}
		var edgeConfiguration = config.edgeConfiguration;
		for (var i = 0; i < edgeConfiguration.length; i++) {
			var rel = edgeConfiguration[i];
			colorConf[rel.relation] = rel.edgeColor;
		}*/
		var colorConf = config.colorConf = createColorConf(config);
		if (data.length == 0 && config.rootElement) {
			nodes.push({
				data : {
					label : config.rootElement,
					id : config.rootElement,
					color : "#000"
				},
				classes : "background"
			});
		}

		for (var i = 0; i < data.length; i++) {
			var parent = getSparqlFieldValue(data[i]["parent_name"]); // data[i]["parent_name"].value;
			var parentURI = getSparqlFieldValue(data[i]["parent_uri"]);
			var parentType = getSparqlFieldValue(data[i]["parent_type"]);
			var parentTypeURI = getSparqlFieldValue(data[i]["parent_type_uri"]);
			var child = getSparqlFieldValue(data[i]["child_name"]); //data[i]["child_name"].value;
			var childURI = getSparqlFieldValue(data[i]["child_uri"]);
			var childType = getSparqlFieldValue(data[i]["child_type"]);
			var childTypeURI = getSparqlFieldValue(data[i]["child_type_uri"]);
			var property = getSparqlFieldValue(data[i]["relation_name"]);
			var propertyURI = getSparqlFieldValue(data[i]["relation_uri"]);
			if (!distinctNodes[parentURI]) {
				var color = mapTypeToColor(parentType, colorConf,
						config.defaultNodeColor);
				var node = createNode(parentURI,parent,parentType,parentTypeURI, color, config.maxLabelLength, config.maxWordLength); 
				distinctNodes[parentURI] = parentURI;
				nodeIds++;
				nodes.push({
					data : node,
					classes : "background"
				});
			}
			if (!distinctNodes[childURI]) {
				var color = mapTypeToColor(childType, colorConf,
						config.defaultNodeColor);
				var node = createNode(childURI,child,childType,childTypeURI, color, config.maxLabelLength, config.maxWordLength); 
				
				distinctNodes[childURI] = childURI;
				nodeIds++;
				nodes.push({
					data : node,
					classes : "background"
				});
			}
			var edgeColor = mapTypeToColor(property, colorConf,
					config.defaultEdgeColor);
			var edge = createEdge(distinctNodes[parentURI], distinctNodes[childURI],property,propertyURI,edgeColor);
			edges.push({
				data : edge
			});
		}
		drawGraph(nodes, edges, config);
	}
	
	my.addNodes = function(json, config) {

		var head = json.head.vars;
		var data = json.results.bindings;
		var edges = [];
		var nodes = [];
		var colorConf = config.colorConf || createColorConf(config);
		for (var i = 0; i < data.length; i++) {
			var parent = getSparqlFieldValue(data[i]["parent_name"]); // data[i]["parent_name"].value;
			var parentURI = getSparqlFieldValue(data[i]["parent_uri"]);
			var parentType = getSparqlFieldValue(data[i]["parent_type"]);
			var parentTypeURI = getSparqlFieldValue(data[i]["parent_type_uri"]);
			var child = getSparqlFieldValue(data[i]["child_name"]); //data[i]["child_name"].value;
			var childURI = getSparqlFieldValue(data[i]["child_uri"]);
			var childType = getSparqlFieldValue(data[i]["child_type"]);
			var childTypeURI = getSparqlFieldValue(data[i]["child_type_uri"]);
			var property = getSparqlFieldValue(data[i]["relation_name"]);
			var propertyURI = getSparqlFieldValue(data[i]["relation_uri"]);
			
			var childColor = mapTypeToColor(childType, colorConf,
				config.defaultNodeColor);
			var childNode = createNode(childURI,child,childType,childTypeURI, childColor, config.maxLabelLength, config.maxWordLength);
			var parentColor = mapTypeToColor(parentType, colorConf,
				config.defaultNodeColor);
			var parentNode = createNode(parentURI,parent,parentType,parentTypeURI, parentColor, config.maxLabelLength, config.maxWordLength);
			/*var node = new Object();
			node.type = type;
			node.id = label;
			node.label = spqlib.util.cutLongLabel(label, config.maxLabelLength,
					config.maxWordLength);
			node.color = mapTypeToColor(type, config.colorConf,
					config.defaultNodeColor);*/
			nodes.push({
				data : childNode,
				classes : "background"
			});
			nodes.push({
				data : parentNode,
				classes : "background"
			});
			// per ogni nodo creo anche il relativo arco ma solo se non
			// esiste già
			var edge = new Object();
			edge.source = parentURI; //config.expandNodeInfo.source;
			edge.target = childURI;
			edge.property = property;
			edge.propertyURI = propertyURI;
			edge.color = mapTypeToColor(edge.property, colorConf,
					config.defaultEdgeColor);
			//if (!existEdge(config.divId,edge.source,edge.target)){
			edges.push({
				data : edge
			});
		}
		if (data.length > 0) {
			addNodesToGraph(config.divId, nodes);
			addEdgesToGraph(config.divId, edges);
			var layout = getSelectedLayout(config);
			setLayoutToGraph(config.divId, layout);
			enableTooltipOnNodes(config.divId);
			enableTooltipOnEdges(config.divId);
			assignBgImageToNodes(config);
		}

	}
	
	
	
	my.addNodesOut = function(json, config) {

		var head = json.head.vars;
		var data = json.results.bindings;
		var edges = [];
		var nodes = [];
		var colorConf = config.colorConf || createColorConf(config);
		for (var i = 0; i < data.length; i++) {
			var uri = getSparqlFieldValue(data[i]["child"]);
			var label = getSparqlFieldValue(data[i]["child_label"]);
			var type = getSparqlFieldValue(data[i]["child_type_label"]);
			var typeURI = getSparqlFieldValue(data[i]["child_type_uri"]);
			var relation = getSparqlFieldValue(data[i]["relation_label"]);
			var relationURI = getSparqlFieldValue(data[i]["relation_uri"]);
			var color = mapTypeToColor(type, colorConf,
					config.defaultNodeColor);
			var node = createNode(uri,label,type,typeURI, color, config.maxLabelLength, config.maxWordLength);
			/*var node = new Object();
			node.type = type;
			node.id = label;
			node.label = spqlib.util.cutLongLabel(label, config.maxLabelLength,
					config.maxWordLength);
			node.color = mapTypeToColor(type, config.colorConf,
					config.defaultNodeColor);*/
			nodes.push({
				data : node,
				classes : "background"
			});
			// per ogni nodo creo anche il relativo arco ma solo se non
			// esiste già
			var edge = new Object();
			edge.source = config.expandNodeInfo.source;
			edge.target = node.id;
			edge.property = relation;
			edge.propertyURI = config.expandNodeInfo.property;
			edge.color = mapTypeToColor(edge.property, colorConf,
					config.defaultEdgeColor);
			if (!existEdge(config.divId,edge.source,edge.target)){
				edges.push({
					data : edge
				});
			}
		}
		if (data.length > 0) {
			addNodesToGraph(config.divId, nodes);
			addEdgesToGraph(config.divId, edges);
			var layout = getSelectedLayout(config);
			setLayoutToGraph(config.divId, layout);
			enableTooltipOnNodes(config.divId);
			enableTooltipOnEdges(config.divId);
			assignBgImageToNodes(config);
			centerGraphToNode(config.divId, config.expandNodeInfo.source);
			setNodeExpandedForRelation(config.divId,
					config.expandNodeInfo.source,
					config.expandNodeInfo.property,
					config.expandNodeInfo.direction, true);
		}

	}
	
	
	/**
	 * ritorna il nome dell'oggetto e il tipo del nodo iniziale
	 */
	my.generateInitialQuery = function (label) {
		return "SELECT ?uri ?label ?type_uri ?type_label WHERE { { VALUES ?root_label {'"
				+ label
				+ "'}   ?uri rdfs:label ?label.   ?uri rdfs:label ?root_label.   ?uri rdf:type ?type_uri.   ?type_uri rdfs:label ?type_label.} }";
	}
	
	function generateExpandNodeQueryIn(label, property) {
		return "SELECT distinct ?parent_uri ?parent_label ?parent_type_uri ?parent_type_label ?relation_label WHERE { "
				+ "{  VALUES ?root_label {'"
				+ label
				+ "'} "
				+ "   ?parent_uri rdfs:label ?parent_label. "
				+ "   ?parent_uri "
				+ property
				+ " ?child. "
				+ "   ?child rdfs:label ?root_label. "
				+ "   ?parent_uri ?relation_uri ?child. "
				+ "   ?relation_uri rdfs:label ?relation_label. "
				+ "   ?parent_uri rdf:type ?parent_type_uri. ?parent_type_uri rdfs:label ?parent_type_label."
				+ "}  }";

	}

	function generateExpandNodeQueryOut(label, property, targetType) {
		return "SELECT distinct ?child_uri ?child_label ?child_type_uri ?child_type_label ?relation_uri ?relation_label WHERE { "
				+ "{  VALUES ?root_label {'"
				+ label
				+ "'} "
				+ "   ?s rdfs:label ?label. "
				+ "   ?s rdfs:label ?root_label. "
				+ "   ?s "
				+ property
				+ " ?child_uri. "
				+ "   ?s ?relation_uri ?child_uri. "
				+ "   ?relation_uri rdfs:label ?relation_label. "
				+ "   ?child_uri rdfs:label ?child_label. "
				+ "   ?child_uri rdf:type ?child_type_uri."
				+ "   ?child_type_uri rdfs:label ?child_type_label. " + "}  }";

	}
	
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint
	 * sparql. effettua il mapping dell'output e setta le impostazioni del
	 * grafo
	 */
	my.renderGraphExplorer = function renderGraphExplorer(json, config) {
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
		config.colorConf = colorConf;

		for (var i = 0; i < data.length; i++) {
			var uri = getSparqlFieldValue(data[i]["uri"]);
			var label = getSparqlFieldValue(data[i]["label"]);
			var type = getSparqlFieldValue(data[i]["type_label"]);
			var typeURI = getSparqlFieldValue(data[i]["type_uri"]);
			var color = mapTypeToColor(type, colorConf,
					config.defaultNodeColor);
			var node = createNode(uri,label,type,typeURI, color, config.maxLabelLength, config.maxWordLength);
			nodes.push({
				data : node,
				classes : "background"
			});
		}
		drawGraph(nodes, edges, config);
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
	
	function createEdge(source, target,prop,propURI,color){
		var edge = new Object();
		edge.source = source;
		edge.target = target;
		edge.property = prop;
		edge.uri=propURI;
		edge.color = color;
		return edge;
	}
	
	function createNode(uri,label,type,typeURI, color, maxLength, maxWordLength) {
		var node = new Object();
		node.uri = node.id = uri;
		//node.types = [];
		//node.types.push({type:type, typeURI:typeURI});
		node.type=type;
		node.typeURI=typeURI;
		node.fullLabel = label;
		node.label = spqlib.util.cutLongLabel(label,maxLength,maxWordLength);
		node.color = color;
		node.image = null;
		return node;
	}
	
	function drawGraph(nodes, edges, config){
		var divId = config.divId;
		var layout = getSelectedLayout(config);
		// add extra property to layout
		for ( var key in config.layoutOptions) {
			var value = config.layoutOptions[key];
			layout[key] = value;
		}
		var style = spqlib.graph.graphImpl().newDefaultStyleObject();
		if (config.nodeStyle) {
			for ( var key in config.nodeStyle) {
				var value = config.nodeStyle[key];
				style[0].style[key] = value;
			}
		}
		if (config.edgeStyle) {
			for ( var key in config.edgeStyle) {
				var value = config.edgeStyle[key];
				style[1].style[key] = value;
			}
		}
		var graph = spqlib.graph.graphImpl().drawGraph(config,nodes,edges,style,layout)
		$("#headertabs ul li a").on(
				'click',
				function(event, ui) {
					var tabDivId = $(this).attr("href");
					var t = $(tabDivId).find(
							".cytoscape-graph");
					t.each(function(){
						var id = $(this).attr("id");
						var graph = spqlib.getById(id);
						if (graph){
							graph.resize();
							graph.center();
						}
						//$(".cytoscape-graph-container").show();
						//centerGraphToNode(id,g[id].config.rootElement);
					});					
					/*.attr("id");
					if (t) {
						g[t].resize();
						$(".cytoscape-graph-container").show();
						centerGraphToNode(t,g[t].config.rootElement);
					}*/
		});
		if (config.showLegend == "true" || config.rootElement) {
			spqlib.graph.drawLegend(config);
		} else {
			hideLegend(config.divId + "-legend");
		}
		enableTooltipOnNodes(divId);
		enableTooltipOnEdges(divId);
		spqlib.addToRegistry(config.divId,graph);
		$( "#"+config.divId ).trigger( "done" );
	}
	
	function getGraphConfig(graphId){
		return spqlib.graph.graphImpl().getGraph(graphId).config;
	}
	
	my.collapseNode = function(graphId, label, property, direction){
		if (direction && direction == "IN") {
			spqlib.graph.graphImpl().collapseIncomers(graphId,label,property);
		} else {
			spqlib.graph.graphImpl().collapseIncomers(graphId,label,property);
		}
		setNodeExpandedForRelation(graphId, label, property, direction,
				false);
		//spqlib.graph.graphImpl().collapseNode(graphId, label, property, direction);
		
	}
	
	my.expandNode =	function (divId, label, property, direction) {
		var conf = getGraphConfig(divId); 
		conf.expandNodeInfo = {
			source : label,
			property : property,
			direction : direction
		};
		if (direction && direction == "IN") {
			var q = generateExpandNodeQueryIn(label, property);
			var qWithPrefixes = spqlib.util.addPrefixes(q,smwQueryPrefixes);
			spqlib.util.doQuery(conf.endpoint, qWithPrefixes, addNodesIn, conf,false);
		} else {
			var q = generateExpandNodeQueryOut(label, property, "");
			var qWithPrefixes = spqlib.util.addPrefixes(q,smwQueryPrefixes);
			spqlib.util.doQuery(conf.endpoint, qWithPrefixes, spqlib.graph.addNodesOut, conf,false);
		}
	}
	
	function addNodesIn(json, config) {
		var head = json.head.vars;
		var data = json.results.bindings;
		var edges = [];
		var nodes = [];
		for (var i = 0; i < data.length; i++) {
			var parentURI = getSparqlFieldValue(data[i]["parent_uri"]);
			var label = getSparqlFieldValue(data[i]["parent_label"]);
			var type = getSparqlFieldValue(data[i]["parent_type_label"]);
			var typeURI = getSparqlFieldValue(data[i]["parent_type_uri"]);
			var relation = getSparqlFieldValue(data[i]["relation_label"]);
			var relationURI = getSparqlFieldValue(data[i]["relation_uri"]);
			var color = mapTypeToColor(type, config.colorConf,
					config.defaultNodeColor);
			var node = createNode(parentURI,label,type,typeURI, color, config.maxLabelLength, config.maxWordLength);
			nodes.push({
				data : node,
				classes : "background"
			});
			// per ogni nodo creo anche il relativo arco ma solo se non
			// esiste già
			var edge = new Object();
			edge.source = node.uri;
			edge.target = config.expandNodeInfo.source;
			edge.property = relation;
			edge.propertyURI = relationURI;
			edge.color = mapTypeToColor(edge.property, config.colorConf,
					config.defaultEdgeColor);

			if (!existEdge(config.divId, edge.source, edge.target)) {
				edges.push({
					data : edge
				});
			}
		}
		if (data.length > 0) {
			addNodesToGraph(config.divId, nodes);
			addEdgesToGraph(config.divId, edges);
			setLayoutToGraph(config.divId, getSelectedLayout(config));
			enableTooltipOnNodes(config.divId);
			enableTooltipOnEdges(config.divId);
			assignBgImageToNodes(config);
			centerGraphToNode(config.divId, config.expandNodeInfo.source);
			setNodeExpandedForRelation(config.divId,
					config.expandNodeInfo.source,
					config.expandNodeInfo.property,
					config.expandNodeInfo.direction, true);
		}
	}
	
	
	function addNodesOut(json, config) {

		var head = json.head.vars;
		var data = json.results.bindings;
		var edges = [];
		var nodes = [];
		for (var i = 0; i < data.length; i++) {
			var uri = getSparqlFieldValue(data[i]["child"]);
			var label = getSparqlFieldValue(data[i]["child_label"]);
			var type = getSparqlFieldValue(data[i]["child_type_label"]);
			var typeURI = getSparqlFieldValue(data[i]["child_type_uri"]);
			var relation = getSparqlFieldValue(data[i]["relation_label"]);
			var relationURI = getSparqlFieldValue(data[i]["relation_uri"]);
			var color = mapTypeToColor(type, config.colorConf,
					config.defaultNodeColor);
			var node = createNode(uri,label,type,typeURI, color, config.maxLabelLength, config.maxWordLength);
			/*var node = new Object();
			node.type = type;
			node.id = label;
			node.label = spqlib.util.cutLongLabel(label, config.maxLabelLength,
					config.maxWordLength);
			node.color = mapTypeToColor(type, config.colorConf,
					config.defaultNodeColor);*/
			nodes.push({
				data : node,
				classes : "background"
			});
			// per ogni nodo creo anche il relativo arco ma solo se non
			// esiste già
			var edge = new Object();
			edge.source = config.expandNodeInfo.source;
			edge.target = node.id;
			edge.property = relation;
			edge.propertyURI = config.expandNodeInfo.property;
			edge.color = mapTypeToColor(edge.property, config.colorConf,
					config.defaultEdgeColor);
			if (!existEdge(config.divId,edge.source,edge.target)){
				edges.push({
					data : edge
				});
			}
		}
		if (data.length > 0) {
			addNodesToGraph(config.divId, nodes);
			addEdgesToGraph(config.divId, edges);
			var layout = getSelectedLayout(config);
			setLayoutToGraph(config.divId, layout);
			enableTooltipOnNodes(config.divId);
			enableTooltipOnEdges(config.divId);
			assignBgImageToNodes(config);
			centerGraphToNode(config.divId, config.expandNodeInfo.source);
			setNodeExpandedForRelation(config.divId,
					config.expandNodeInfo.source,
					config.expandNodeInfo.property,
					config.expandNodeInfo.direction, true);
		}

	}
	function setNodeExpandedForRelation(graphId, elementId, propertyURI,
			propertyDirection, value) {
		var exp = spqlib.graph.graphImpl().getGraphElementData(graphId, elementId, "nodeExpansion");
		if (!exp) {
			exp = [];
		}
		var prop = "";
		if (propertyDirection) {
			if (propertyDirection == "IN") {
				prop = "IN-" + propertyURI;
			} else {
				prop = "OUT-" + propertyURI;
			}
		} else {
			prop = "OUT-" + propertyURI;
		}
		exp[prop] = value;
		spqlib.graph.graphImpl().setGraphElementData(graphId, elementId, "nodeExpansion", exp);	
	}
	
	function centerGraphToNode(graphId,nodeId){
		spqlib.graph.graphImpl().centerGraphToNode(graphId,nodeId);
		
	}
	
	my.assignBgImageToNodes = function(conf){
		assignBgImageToNodes(conf);
	}
	
	function assignBgImageToNodes(conf) {

		if (conf.rootElementImage) {
			var legendDiv = $("#table-" + conf.divId
					+ "-legend div[type='rootElement']");
			legendDiv.css("background-color", "white");
			legendDiv.css("background-image", 'url("'
					+ conf.rootElementImage + '")');

		}
		for (var i = 0; i < conf.nodeConfiguration.length; i++) {
			var obj = conf.nodeConfiguration[i];
			// in caso di nodi con immagini devo aggiornare i nodi e la
			// legenda settando l'immagine di sfondo
			if (obj.image) {
				spqlib.graph.graphImpl().assignBackgrounImageToNodesByCategory(conf.divId,obj);
				
				// aggiorno anche la legenda
				var legendDiv = $("#table-" + conf.divId
						+ "-legend div[category-name='" + obj.category
						+ "']");
				legendDiv.css("background-color", "white");
				legendDiv.css("background-image", 'url("' + obj.image
						+ '")');
			}
		}
	}
	
	
	function enableTooltipOnNodes(graphId){
		spqlib.graph.graphImpl().enableTooltipOnNodes(graphId);
	}
	function enableTooltipOnEdges(graphId){
		spqlib.graph.graphImpl().enableTooltipOnEdges(graphId);
	}
	
	function getSelectedLayout(config){
		return spqlib.graph.graphImpl().getSelectedLayout(config);
	}
	
	function setLayoutToGraph(graphId, layout) {
		spqlib.graph.graphImpl().setLayoutToGraph(graphId,layout);
	}
	
	function addNodesToGraph(graphId, nodes) {
		spqlib.graph.graphImpl().addNodesToGraph(graphId,nodes); 
	}

	function addEdgesToGraph(graphId, edges) {
		spqlib.graph.graphImpl().addEdgesToGraph(graphId,edges); 
	}
	
	function existEdge(graphId,from,to){
		var ret = spqlib.graph.graphImpl().getElementsFromSourceAndTarget(graphId,from,to);
		if (ret.length==0){
			return false;
		} else {
			return true;
		}
	}
	
	my.createEdgeTooltip = function(obj){
		html = "" + obj.data("property") + "";
		/*if (obj.data("uri")){
			html+=" ("+obj.data("uri")+")";
		}*/
		return html;
	}
	
	my.createNodeTooltip = function(obj){

		var conf = obj.cy().config;
		var target = "_self";
		if (conf.tipLinkTarget) {
			target = conf.tipLinkTarget;
		}
		var pageLink = $("<a>").attr(
				"href",
				conf.linkBasePath
						+ obj.data("fullLabel")).attr(
				"target", "_blank");
		var uriLink ="";
		/*if (obj.data("uri")){
			var uriLink = "URI: <a href='" + obj.data("uri")
			+ "' target='" + target + "'>"
			+ obj.data("uri") + "</a></br>"
		}*/
		var pageCategory = $("<span>").addClass(
				"cytoscape-qtip-category");
		var linkHref = conf.linkBasePath
				+ ""
				+ spqlib.util.htmlEncode(obj.data("fullLabel"))
						.replace(/'/g, "&apos;");
		var tip = "<a href='" + linkHref
				+ "' target='" + target + "'>"
				+ obj.data("fullLabel") + "</a></br>";
		if (uriLink){
			tip+=uriLink;
		}
		tip += renderCategoryLink(obj.data("type"));
		if (conf.globalConfiguration) {
			if (conf.globalConfiguration[obj
					.data("type")]) {
				if (conf.globalConfiguration[obj
						.data("type")].explore) {
					extra = conf.globalConfiguration[obj
							.data("type")].explore;
					tip += renderExploreSection(
							extra, obj.data('id'),
									obj.cy().config.divId);
				}
			}
		}
		return tip;
		
	}
	function renderExploreSection(props, nodeLabel, divId) {
		var incomingHeader = "<div class='qtip-section'><b>Incoming connections</b></div>";
		var outgoingHeader = "<div class='qtip-section'><b>Outgoing connections</b></div>";
		var incomingLinks = "";
		var outgoingLinks = "";
		var output = "";
		for (var i = 0; i < props.length; i++) {
			if (props[i].property.direction == "IN") {
				incomingLinks += renderExpandNodeLink(props[i], nodeLabel,
						divId);
			} else {
				outgoingLinks += renderExpandNodeLink(props[i], nodeLabel,
						divId);
			}
		}
		if (incomingLinks != "") {
			output += incomingHeader + incomingLinks;
		}
		if (outgoingLinks != "") {
			output += outgoingHeader + outgoingLinks;
		}
		return output;
	}
	
	function isNodeExpandedForRelation(graphId, elementId, propertyURI,
			propertyDirection) {
		var exp = spqlib.graph.graphImpl().getGraphElementData(graphId, elementId, "nodeExpansion");
		var prop = "";
		if (propertyDirection) {
			if (propertyDirection == "IN") {
				prop = "IN-" + propertyURI;
			} else {
				prop = "OUT-" + propertyURI;
			}
		} else {
			prop = "OUT-" + propertyURI;
		}
		if (exp) {
			if (exp[prop] == true) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	

	function renderExpandNodeLink(prop, nodeLabel, divId) {
		var ICON_PLUS = "<span class='glyphicon glyphicon-plus-sign' style='margin-right:5px;'></span>";
		var ICON_MINUS = "<span class='glyphicon glyphicon-minus-sign' style='margin-right:5px;'></span>";
		var funcName = "";

		var linkLabel = prop.property.label;
		var icon = "";
		if (isNodeExpandedForRelation(divId, nodeLabel, prop.property.uri,
				prop.property.direction)) {
			icon = ICON_MINUS;
			funcName = "spqlib.graph.collapseNode";
		} else {
			icon = ICON_PLUS;
			funcName = "spqlib.graph.expandNode";
		}
		linkLabel = icon + linkLabel;
		linkLabel += "</a></br>";
		var aLink = "<a href='#' onclick='" + funcName + "(\"" + divId
				+ "\",\"" + nodeLabel + "\",\"" + prop.property.uri
				+ "\",\"" + prop.property.direction + "\")' >";
		return aLink + linkLabel;
	}

	function renderSingleCategoryLink(type) {
		return "<a href='./EAP:PageList?category=" + type
				+ "' target='_blank'>" + type + "</a>";
	}

	function renderCategoryLink(types) {
		var out = "";
		if (types instanceof Array) {
			for (var i = 0; i < types.length; i++) {
				out += renderSingleCategoryLink(types[i]);
				if (i < types.length - 1) {
					out += ",";
				}
			}
		} else {
			out = renderSingleCategoryLink(types);
		}
		return "Category: " + out + "</br>";
	}
	
	function createColorConf(config){
		var colorConf = new Object();
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
		return colorConf;
		
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
	my.drawLegend = function (config) {
		var divId = config.divId + "-legend";
		var table = $("<table>").attr("id", "table-" + divId);
		var showLegend = false;
		var nodeConfiguration = config.nodeConfiguration;
		var edgeConfiguration = config.edgeConfiguration;
		// aggiungo la voce per l'elemento root
		if (config.rootElement) {
			if (config.rootElementColor || config.rootElementImage) {
				showLegend = true;
				var colorDiv = $("<div>").addClass("legend-circle-node")
						.attr("type", "rootElement").attr(
								"style",
								"background:" + config.rootElementColor
										+ "; background-size:100% 100%;");
				var col1 = $("<td>").append(colorDiv);
				var col2 = $("<td>").append(
						"Current item (" + config.rootElement + ")");
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
			var colorDiv = $("<div>").addClass("legend-arrow-line").attr(
					"style",
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
			//Aggiungo eventi per show e hide della legenda
		var divLegendContainer = divId+"-container";
		var divLegendLabel= divId+"-container-label";

		//Aggiungo gli eventi
		$("#" + divLegendLabel).on("click", function(){
			var value = $("#" + divLegendLabel).text();
			if (value == "Show legend"){
				//$("#" + divLegendContainer).show();
				$("#" + divLegendContainer).slideDown("slow");
				$("#" + divLegendLabel).text("Hide legend");
			} else if (value == "Hide legend") {
				$("#" + divLegendContainer).slideUp("slow");
				//$("#" + divLegendContainer).hide();
				$("#" + divLegendLabel).text("Show legend");
			}
		});

		$("#" + divLegendContainer).on("mouseenter ", function(){
			$("#" + divLegendContainer).show();
			$("#" + divLegendLabel).text("Hide legend");
		});

		$("#" + divLegendContainer).on("mouseleave", function(){
			//$("#" + divLegendContainer).hide();
			$("#" + divLegendContainer).slideUp("slow");
			$("#" + divLegendLabel).text("Show legend");
		});
	}
	
	function getSparqlFieldValue(field){
		if (field){
			return field.value;
		} else {
			return "";
		}
	}
	
	
	

	return my;
}());