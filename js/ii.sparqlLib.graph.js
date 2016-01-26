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
	
	my.render = function (json, config) {
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
				var type = data[i]["parent_type"].value;
				node.type = type;
				distinctNodes[parent] = node.id = parent;
				nodeIds++;
				node.label = spqlib.util.cutLongLabel(parent,config.maxLabelLength,config.maxWordLength);
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
				node.label = spqlib.util.cutLongLabel(child,config.maxLabelLength,config.maxWordLength);
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
	
	
	/**
	 * ritorna il nome dell'oggetto e il tipo del nodo iniziale
	 */
	my.generateInitialQuery = function (label) {
		return "SELECT ?label ?type_label WHERE { { VALUES ?root_label {'"
				+ label
				+ "'}   ?s rdfs:label ?label.   ?s rdfs:label ?root_label.   ?s rdf:type ?type.   ?type rdfs:label ?type_label.} }";
	}
	
	function generateExpandNodeQueryIn(label, property) {
		return "SELECT distinct ?parent_label ?parent_type_label ?relation_label WHERE { "
				+ "{  VALUES ?root_label {'"
				+ label
				+ "'} "
				+ "   ?parent rdfs:label ?parent_label. "
				+ "   ?parent "
				+ property
				+ " ?child. "
				+ "   ?child rdfs:label ?root_label. "
				+ "   ?parent ?relation ?child. "
				+ "   ?relation rdfs:label ?relation_label. "
				+ "   ?parent rdf:type ?parent_type. ?parent_type rdfs:label ?parent_type_label."
				+ "}  }";

	}

	function generateExpandNodeQueryOut(label, property, targetType) {
		return "SELECT distinct ?child_label ?child_type_label ?relation_label WHERE { "
				+ "{  VALUES ?root_label {'"
				+ label
				+ "'} "
				+ "   ?s rdfs:label ?label. "
				+ "   ?s rdfs:label ?root_label. "
				+ "   ?s "
				+ property
				+ " ?child. "
				+ "   ?s ?relation ?child. "
				+ "   ?relation rdfs:label ?relation_label. "
				+ "   ?child rdfs:label ?child_label. "
				+ "   ?child rdf:type ?child_type. ?child_type rdfs:label ?child_type_label."
				+ "   ?child_type rdfs:label ?child_type_label. " + "}  }";

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
			var label = data[i]["label"].value;
			var type = data[i]["type_label"].value;
			var color = mapTypeToColor(type, colorConf,
					config.defaultNodeColor);
			var node = createNode(label, label, type, color,
					config.maxLabelLength, config.maxWordLength);
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
	
	function createNode(id, label, type, color, maxLength, maxWordLength) {
		var node = new Object();
		node.type = [];
		node.type.push(type);
		node.id = id;
		node.label = spqlib.util.cutLongLabel(label, maxLength, maxWordLength);
		node.color = color;
		return node;
	}
	
	function drawGraph(nodes, edges, config){
		spqlib.graph.graphImpl().drawGraph(nodes,edges,config);
	}
	
	function getGraphConfig(graphId){
		return spqlib.graph.graphImpl().graphs(graphId).config;
	}
	
	my.collapseNode = function(graphId, label, property, direction){
		spqlib.graph.graphImpl().collapseNode(graphId, label, property, direction);
		
	}
	
	my.expandNode =	function (divId, label, property, direction) {
		var conf = getGraphConfig(divId); //g[divId].config;
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
			spqlib.util.doQuery(conf.endpoint, qWithPrefixes, addNodesOut, conf,false);
		}
	}
	
	function addNodesOut(json, config) {

		var head = json.head.vars;
		var data = json.results.bindings;
		var edges = [];
		var nodes = [];
		for (var i = 0; i < data.length; i++) {
			var label = data[i]["child_label"].value;
			type = data[i]["child_type_label"].value;
			var relation = data[i]["relation_label"].value;
			var color = mapTypeToColor(type, config.colorConf,
					config.defaultNodeColor);
			var node = new Object();
			node.type = type;
			node.id = label;
			node.label = spqlib.util.cutLongLabel(label, config.maxLabelLength,
					config.maxWordLength);
			node.color = mapTypeToColor(type, config.colorConf,
					config.defaultNodeColor);
			nodes.push({
				data : node,
				classes : "background"
			});
			// per ogni nodo creo anche il relativo arco ma solo se non
			// esiste gi�
			var edge = new Object();
			edge.source = config.expandNodeInfo.source;
			edge.target = node.id;
			edge.property = relation;
			edge.propertyURI = config.expandNodeInfo.property;
			edge.color = mapTypeToColor(edge.property, config.colorConf,
					config.defaultEdgeColor);
			//if (g[config.divId].elements("edge[source='" + edge.source
			//		+ "'][target='" + edge.target + "']").length == 0) {
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
		spqlib.graph.graphImpl().setNodeExpandedForRelation(graphId, elementId, propertyURI,
				propertyDirection, value);		
	}
	
	function centerGraphToNode(graphId,nodeId){
		spqlib.graph.graphImpl().centerGraphToNode(graphId,nodeId);
		
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
		spqlib.graph.graphImpl().addNodesToGraph(graphId,nodes); //g[graphId].add(nodes);
	}

	function addEdgesToGraph(graphId, edges) {
		spqlib.graph.graphImpl().addEdgesToGraph(graphId,edges); //g[graphId].add(edges);
	}
	
	function existEdge(graphId,from,to){
		var ret = spqlib.graph.graphImpl().getElementsFromSourceAndTarget(graphId,from,to);
		if (ret.length==0){
			return false;
		} else {
			return true;
		}
	}
	

	return my;
}());