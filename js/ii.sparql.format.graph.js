spqlib.graph = (function () {
	/**
	* Entry point
	*/
	 spqlib.sparql2Graph = function(config){
		spqlib.graph.initHtml(config);
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		var splitQueryByUnion = config.splitQueryByUnion || false;
		if (splitQueryByUnion==true || splitQueryByUnion.toLowerCase()=="true") {
			var queries = spqlib.util.splitQueryByUnion(config.sparqlWithPrefixes);
			var step = 100/(queries.length);
			config.step = step;
			
			$( "#"+config.divId).on( "done", function() {
				var progress = 0 + step;
				var idContainer = config.divId+"-container";
				var progressBar = $( "#"+idContainer).next().find(".progress-bar");
				var currentProgress = parseInt(progressBar.attr("aria-valuenow"));
				var newProgress = currentProgress + parseInt(config.step);
				if (100 - newProgress < config.step){
					newProgress = 100;
				}
				progressBar.attr("aria-valuenow",newProgress);
				var perc = newProgress+"%";
				progressBar.css("width",perc);
				progressBar.text(perc);
				var i=1; 
				if (queries[i]){
					spqlib.util.doQuery(config.endpointName, queries[i], spqlib.graph.addNodes, config,null,spqlib.graph.failQuery);
				} else {
					$( "#"+ config.divId+"-container").next().hide();
				}
				//serializzo le chiamate 
				$( "#"+config.divId).on( "singleQueryDone", function() {
					i++;
					if (queries[i]){
						spqlib.util.doQuery(config.endpointName, queries[i], spqlib.graph.addNodes, config,null,spqlib.graph.failQuery);
					} else {
						//nascondo la progress bar
						$( "#"+ config.divId+"-container").next().hide();
					}
				});
			});
			if (queries.length>0){
				spqlib.util.doQuery(config.endpointName, queries[0], spqlib.graph.render, config,spqlib.graph.preQuery,spqlib.graph.failQuery);
			}
		} else {
			spqlib.util.doQuery(config.endpointName, config.sparqlWithPrefixes, spqlib.graph.render, config,spqlib.graph.preQuery,spqlib.graph.failQuery);
		}
	}
	 
	var my = { };
	 
	my.graphImpl = function () {
		return spqlib.cytoscape();
	}
	
	my.exportAsImage = function(){
		spqlib.graph.graphImpl().exportAsImage();
	}

	
	my.toggleFullScreen = function(graphId){
		var goFullscreenLabel=mw.message( 'sprf.js.graph.go.fullscreen' ).text();
		var exitFullscreenLabel=mw.message( 'sprf.js.graph.exit.fullscreen' ).text();
		var containerSelector = "#" + graphId + "-container";
		var legendSelector = "#" + graphId + "-legend-container";
		//$(containerSelector).toggleClass('ii-container-graph-full-screen');
		if (screenfull.enabled) {
				var el=document.getElementById(graphId + "-container");
				screenfull.toggle(el);
			}

		var icon = $(legendSelector).find("i");
		icon.toggleClass("fa-compress");
		icon.toggleClass("fa-expand");
		if (icon.hasClass("fa-expand")){
			$(legendSelector).find(".action-fullscreen").find("span").text(goFullscreenLabel);
		} else {
			$(legendSelector).find(".action-fullscreen").find("span").text(exitFullscreenLabel);
		}
		spqlib.graph.graphImpl().resize(graphId);
		centerGraphToNode(graphId, spqlib.graph.graphImpl().getGraph(graphId).config.rootElement);
	}
	
	my.preQuery = function(configuration){
		if (configuration.spinnerImagePath){
			$("#"+configuration.divId+"-loader").html("<img src='"+configuration.spinnerImagePath+"' style='vertical-align:middle;'>");
		} else {
			$("#"+configuration.divId+"-loader").html("Loading...");
		}
	}
	
	my.failQuery = function(configuration,jqXHR,textStatus){
		$("#"+configuration.divId+"-loader").html("");
		$("#"+configuration.divId+"-loader").show();
		$("#"+configuration.divId+"-legend-box").html("");
		$("#"+configuration.divId+"-loader").html(generateErrorBox(textStatus));
		throw new Error("Error invoking sparql endpoint "+textStatus+" "+JSON.stringify(jqXHR));
	}
	
	function generateErrorBox(message) {
		var html = "<div class='alert alert-danger' role='alert'><span class=' fas fa-exclamation' aria-hidden='true'></span><span class='sr-only'>Error:</span>"
				+ message + "</div>";
		return html;
	}
	
	my.initHtml = function(config){
		var goFullscreenLabel=mw.message( 'sprf.js.graph.go.fullscreen' ).text();
		var exitFullscreenLabel=mw.message( 'sprf.js.graph.exit.fullscreen' ).text();
		var idContainer = config.divId+"-container";
		var idLoader = config.divId+"-loader";
		var idLegendBox = config.divId+"-legend-box";
		var idLegendContainer = config.divId+"-legend-container";
		var idLegendContainerLabel = config.divId+"-legend-container-label";
		var idLegendHeader = config.divId+"-legend-header";
		var idLegend = config.divId+"-legend";
		var idLegendActionList = config.divId+"-legend-actions-list";
		var actionFullScreen = "<a href='#' onclick=\"javascript:spqlib.graph.toggleFullScreen('"+config.divId+"');\" class='action-fullscreen'><i class='fas fa-expand'> \
		</i><span class='fullscreen-label' style='padding-left:10px;'>"+goFullscreenLabel+"</span></a>";
		$( "#"+idContainer).before("<div id='"+idLoader+"' class='ii-graph-loader-box'></div>");
		$( "#"+idContainer).prepend("<div id='"+idLegendBox+"' class='ii-graph-legend-box'></div>");
		$( "#"+idLegendBox).prepend("<div id='"+idLegendContainer+"' class='ii-graph-legend-container cytoscape-legend-container'></div>");
		$( "#"+idLegendBox).prepend("<div id='"+idLegendContainerLabel+"' class='ii-graph-legend-container cytoscape-legend-container-label'><span>Show legend<span><!--i class='fas fa-chevron-down'></i--></div>");
		$( "#"+idLegendContainer).append("<div id='"+idLegendHeader+"' class='ii-graph-legend-header'>"+createLegendHeader(config)+"</div> ");
		$( "#"+idLegendContainer).append("<div id='"+idLegend+"' class='ii-graph-legend'></div> ");
		$( "#"+idLegendContainer).append("<div id='"+idLegendActionList+"' class='ii-graph-legend-actions-list cytoscape-actions-list'></div> ");
		$( "#"+idLegendActionList).append("<div class='ii-graph-legend-action cytoscape-action'>"+actionFullScreen+"</div>");
		if (config.splitQueryByUnion && config.splitQueryByUnion=="true"){
			$( "#"+idContainer).after("<div class='progress'><div class='progress-bar ii-graph-progress-bar ' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width:0%'>0%</div></div>");
		}
	}
	
		
	function createLegendHeader(config){
		var html = "";
		if (config.legendConfiguration){
			var conf = config.legendConfiguration;
			if (conf.expandable=='true'){
				html +="<a href='#' onclick='javascript:spqlib.graph.toggleLegendExpansion('"+config.divId+"')'>Legend</a>"
			} else {
				
			}
		}
		return html;
	}
	
	
	my.render = function (json, config) {
		var head = json.head.vars;
		var data = json.results.bindings;
		$("#"+config.divId+"-container").find(".ii-graph-legend-actions-list").show();
		$("#"+config.divId+"-legend-container").attr("style","");
		$("#"+config.divId+"-loader").html("Rendering...");

		var edges = [];
		var nodes = [];
		var distinctNodes = [];
		var distinctEdges = [];
		var colorConf = config.colorConf = createColorConf(config);
		config.globalConfiguration=spqlib.graph.createGlobalCategoryConfiguration(config.nodeConfiguration,config.edgeConfiguration);
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
			var parent = getSparqlFieldValue(data[i]["parent_name"]);
			var parentURI = getSparqlFieldValue(data[i]["parent_uri"]);
			var parentType = getSparqlFieldValue(data[i]["parent_type"]);
			var parentTypeURI = getSparqlFieldValue(data[i]["parent_type_uri"]);
			var child = getSparqlFieldValue(data[i]["child_name"]); 
			var childURI = getSparqlFieldValue(data[i]["child_uri"]);
			var childType = getSparqlFieldValue(data[i]["child_type"]);
			var childTypeURI = getSparqlFieldValue(data[i]["child_type_uri"]);
			var property = getSparqlFieldValue(data[i]["relation_name"]);
			var propertyURI = getSparqlFieldValue(data[i]["relation_uri"]);
			
			var parentID = parentURI || parent;
			var childID = childURI || child;
			if (!distinctNodes[parentID]) {
				var color = mapTypeToColor(parentType, colorConf,
						config.defaultNodeColor);
				var node = createNode(parentID,parent,parentType,parentTypeURI, color, config.maxLabelLength, config.maxWordLength); 
				distinctNodes[parentID] = node; //parentID;
			} else {
				//il nodo esiste già, dobbiamo aggiungere un'altra categoria alla lista?
				var actualNode = distinctNodes[parentID];
				if (actualNode.type.indexOf(parentType)==-1){ //il tipo non è tra quelli già presenti nel nodo
					actualNode.type.push(parentType);
					actualNode.typeURI.push(parentTypeURI);
				}
			}
			if (!distinctNodes[childID]) {
				var color = mapTypeToColor(childType, colorConf,
						config.defaultNodeColor);
				var node = createNode(childID,child,childType,childTypeURI, color, config.maxLabelLength, config.maxWordLength); 
				
				distinctNodes[childID] = node; //childID;
			} else {
				//il nodo esiste già, dobbiamo aggiungere un'altra categoria alla lista?
				var actualNode = distinctNodes[childID];
				if (actualNode.type.indexOf(childType)==-1){ //il tipo non è tra quelli già presenti nel nodo
					actualNode.type.push(childType);
					actualNode.typeURI.push(childTypeURI);
				}
			}
			var edgeColor = mapTypeToColor(property, colorConf,
					config.defaultEdgeColor);
			
			var edge = createEdge(distinctNodes[parentID].id, distinctNodes[childID].id,property,propertyURI,edgeColor);
			var edgeID = edge.source+"-"+edge.target+"-"+edge.uri+"-"+edge.property;
			if (!distinctEdges[edgeID]){ //per evitare di aggiungere lo stesso arco più volte. capita quando il parent o il child hanno più valori di category
				distinctEdges[edgeID] = edge;
				edges.push({
					data : edge
				});
			}	
		}
		//push all nodes
		for (var key in distinctNodes) {
			var n = distinctNodes[key];
			nodes.push({
				data : n,
				classes : "background"
			});
		}
		var maxNodes = config.maxNumNodes || 100;
		if (nodes.length>maxNodes){
			$("#"+config.divId+"-loader").html("");
			$("#"+config.divId+"-loader").html(generateErrorBox("Error: too much nodes to draw on the graph"));
			throw "Errore troppi nodi";			
		}
		drawGraph(nodes, edges, config);
	}
	
	my.addNodes = function(json, config,caller) {

		var head = json.head.vars;
		var data = json.results.bindings;
		var edges = [];
		var nodes = [];
		var colorConf = config.colorConf || createColorConf(config);
		for (var i = 0; i < data.length; i++) {
			var parent = getSparqlFieldValue(data[i]["parent_name"]); 
			var parentURI = getSparqlFieldValue(data[i]["parent_uri"]);
			var parentType = getSparqlFieldValue(data[i]["parent_type"]);
			var parentTypeURI = getSparqlFieldValue(data[i]["parent_type_uri"]);
			var child = getSparqlFieldValue(data[i]["child_name"]); 
			var childURI = getSparqlFieldValue(data[i]["child_uri"]);
			var childType = getSparqlFieldValue(data[i]["child_type"]);
			var childTypeURI = getSparqlFieldValue(data[i]["child_type_uri"]);
			var property = getSparqlFieldValue(data[i]["relation_name"]);
			var propertyURI = getSparqlFieldValue(data[i]["relation_uri"]);
			
			var parentID = parentURI || parent;
			var childID = childURI || child;
			
			var childColor = mapTypeToColor(childType, colorConf,
				config.defaultNodeColor);
			var childNode = createNode(childID,child,childType,childTypeURI, childColor, config.maxLabelLength, config.maxWordLength);
			var parentColor = mapTypeToColor(parentType, colorConf,
				config.defaultNodeColor);
			var parentNode = createNode(parentID,parent,parentType,parentTypeURI, parentColor, config.maxLabelLength, config.maxWordLength);
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
			edge.source = parentID;
			edge.target = childID;
			edge.property = property;
			edge.propertyURI = propertyURI;
			edge.color = mapTypeToColor(edge.property, colorConf,
					config.defaultEdgeColor);
			if (!existEdge(config.divId,edge.source,edge.target)){
				edges.push({
					data : edge
				});
			}
		}
		if (data.length > 0) {
			var n = addNodesToGraph(config.divId, nodes);
			var e = addEdgesToGraph(config.divId, edges);
			var layout = getSelectedLayout(config);
			setLayoutToGraph(config.divId, layout);
			enableTooltipOnNodes(config.divId,n);
			enableTooltipOnEdges(config.divId,e);
			assignBgImageToNodes(config,n);
		}
		if (caller){
			if (caller.propToExpand){
				var elementId = caller.nodeURI;
				var direction = caller.direction;
				var attrName = caller.propToExpand+"-"+direction
				spqlib.graph.graphImpl().setGraphElementData(config.divId, elementId, attrName, {expanded:true, numResult:data.length});	
			}
		}
		
		var idContainer = config.divId+"-container";
		var progressBar = $( "#"+idContainer).next().find(".progress-bar");
		var currentProgress = parseInt(progressBar.attr("aria-valuenow"));
		var newProgress = currentProgress + parseInt(config.step);
		if (100 - newProgress < config.step){
			newProgress = 100;
		}
		progressBar.attr("aria-valuenow",newProgress);
		var perc = newProgress+"%";
		progressBar.css("width",perc);
		progressBar.text(perc);
		$( "#"+config.divId ).trigger( "singleQueryDone" );

	}
	
	function generateExpandNodeQueryOut(nodeURI, property) {
		return "SELECT distinct ?parent_name ?child_name ?parent_type ?child_type ?relation_name ?parent_uri ?child_uri ?parent_type_uri ?child_type_uri ?relation_uri WHERE { "
				+ "{  <"+nodeURI+"> "+property+" ?child_uri;\
                           	rdfs:label ?parent_name.			\
				      OPTIONAL { ?child_uri rdfs:label ?child_name. \
								 ?child_uri rdf:type ?child_type_uri. \
								 ?child_type_uri rdfs:label ?child_type.\
								 } \
					   <"+nodeURI+"> rdf:type ?parent_type_uri. \
					   ?parent_type_uri rdfs:label ?parent_type. \
					   OPTIONAL { "+property+" rdfs:label ?relation_name.} \
					   BIND (<"+nodeURI+"> AS ?parent_uri) \
					   BIND (<"+property+"> AS ?relation_uri) \
				  }  }";
	}
	
	function generateExpandNodeQueryIn(nodeURI, property) {
		return "SELECT distinct ?parent_name ?child_name ?parent_type ?child_type ?relation_name ?parent_uri ?child_uri ?parent_type_uri ?child_type_uri ?relation_uri WHERE { "
				+ "{  ?parent_uri "+property+" <"+nodeURI+"> .\
				      OPTIONAL { ?parent_uri rdfs:label ?parent_name. \
					  <"+nodeURI+"> rdfs:label ?child_name. \
								 <"+nodeURI+"> rdf:type ?child_type_uri. \
								 ?child_type_uri rdfs:label ?child_type.\
								 } \
					   ?parent_uri rdf:type ?parent_type_uri. \
					   ?parent_type_uri rdfs:label ?parent_type. \
					   OPTIONAL { "+property+" rdfs:label ?relation_name.} \
					   BIND (<"+nodeURI+"> AS ?child_uri) \
					   BIND (<"+property+"> AS ?relation_uri) \
				  }  }";
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
		node.mainType = type; //il tipo principale, quello che da lo stile al nodo (colore/immagine)
		node.mainTypeURI = typeURI;
		node.type = [];
		node.type.push(type);
		node.typeURI = [];
		node.typeURI.push(typeURI);
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
					});					
		});
		enableTooltipOnNodes(divId);
		enableTooltipOnEdges(divId);
		spqlib.addToRegistry(config.divId,graph);
		if (config.showLegend == "true" || config.rootElement) {
			spqlib.graph.drawLegend(config);
		} else {
			hideLegend(config.divId + "-legend");
		}
		$( "#"+config.divId ).trigger( "done" );
	}
	
	function getGraphConfig(graphId){
		return spqlib.graph.graphImpl().getGraph(graphId).config;
	}
	
	function centerGraphToNode(graphId,nodeId){
		spqlib.graph.graphImpl().centerGraphToNode(graphId,nodeId);
	}
	
	my.assignBgImageToNodes = function(conf,nodes){
		assignBgImageToNodes(conf,nodes);
	}
	
	function assignBgImageToNodes(conf,nodes) {

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
				spqlib.graph.graphImpl().assignBackgrounImageToNodesByCategory(conf.divId,obj,nodes);
				
				// aggiorno anche la legenda
				var legendDiv = $("#table-" + conf.divId
						+ "-legend div[category-name='" + obj.category
						+ "']");
				legendDiv.css("background-color", "white");
				legendDiv.css("background-image", 'url("' + obj.image + '")');
			}
		}
	}
	
	function enableTooltipOnNodes(graphId, nodes){
		if (!nodes){
			spqlib.graph.graphImpl().enableTooltipOnNodes(graphId);
		} else {
			spqlib.graph.graphImpl().enableTooltipOnNodes(graphId,nodes);
		}
	}
	function enableTooltipOnEdges(graphId,edges){
		if (!edges){
			spqlib.graph.graphImpl().enableTooltipOnEdges(graphId);
		} else {
			spqlib.graph.graphImpl().enableTooltipOnEdges(graphId,edges);
		}
	}
	
	function getSelectedLayout(config){
		return spqlib.graph.graphImpl().getSelectedLayout(config);
	}
	
	function setLayoutToGraph(graphId, layout) {
		spqlib.graph.graphImpl().setLayoutToGraph(graphId,layout);
	}
	
	function addNodesToGraph(graphId, nodes) {
		return spqlib.graph.graphImpl().addNodesToGraph(graphId,nodes); 
	}

	function addEdgesToGraph(graphId, edges) {
		return spqlib.graph.graphImpl().addEdgesToGraph(graphId,edges); 
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
		var labelLinkPattern = conf.labelLinkPattern;
		var linkLabel = spqlib.util.formatString(labelLinkPattern,obj.data("fullLabel"));
		var pageLink = $("<a>").attr("href",linkLabel).attr(
				"target", "_blank");
		var uriLink ="";
		var linkHref = linkLabel.replace(/'/g, "&apos;");
		var tip = "";
		if (obj.data("fullLabel")){
			var tip = "<a href='" + linkHref
					+ "' target='" + target + "'>"
					+ obj.data("fullLabel") + "</a></br>";
		} else {
			if (obj.data("uri")){
				var uriLink = "URI: "+ obj.data("uri") + "</br>";
				tip+=uriLink;
			}	
		}
		var type = obj.data("type");
		tip += renderCategoryLink(type,conf);
		tip+="<div class='ii-graph-tooltip-extra-data-type-props-container'>";
		if (!obj.data("dataTypeProperties")){
			if (conf.globalConfiguration && conf.globalConfiguration[type]){
				var categoryConf = conf.globalConfiguration[type];
				if (categoryConf.dataTypeProps && categoryConf.dataTypeProps.length>0){
					tip+="<img src='"+conf.spinnerImagePath+"' style='vertical-align:middle;'>";
					loadExtraDataTypeProperties(obj,categoryConf.dataTypeProps,conf);
				}
			}
			
		} else {
			tip+=renderExtraDataTypeProperties(conf,type,obj.data("dataTypeProperties"));
		}
		tip+="</div>";
		tip+="<div class='ii-graph-tooltip-extra-object-props-container'>";
		tip+=renderExtraObjectProperties(conf,type,obj);
		tip+="</div>";
		
		
		return tip;
	}
	
	function loadExtraDataTypeProperties(obj,props,conf){
		//devo recupeare le informazioni e metterle dentro al nodo in modo che siano visualizzate
		var sparql = generateReadPropertyQuery(obj, props,conf.queryPrefixes);
		spqlib.util.doQuery(conf.endpointName, sparql, spqlib.graph.addInfoToNode, conf,null,null,obj);
	}
	
	function generateReadPropertyQuery(obj,props,prefixes){
		var nodeUri = obj.data("id");
		var select = "SELECT ?node ";
		for (var i=0;i<props.length;i++){
			select+=" ?p"+i;
		}
		var where = "";
		for (var i=0;i<props.length;i++){
			var prop = props[i].prop;
			where+="OPTIONAL{ <"+nodeUri+"> "+prop+" ?p"+i+".} ";
		}
		var query = select+" WHERE { {  "+where+" BIND (<"+nodeUri+"> AS ?node) } }";
		return spqlib.util.addPrefixes(query,prefixes);
	}
	
	my.addInfoToNode = function(json, config,caller) {
		var id = config.divId;
		var head = json.head.vars;
		var data = json.results.bindings;
		var row = data[0];
		var nodeId = getSparqlFieldValue(data[0]["node"]);
		var node = spqlib.getById(id).getElementById(nodeId);
		node.data("dataTypeProperties",[]);
		for (var i=1;i<head.length;i++){
			var pName = head[i];
			var val = getSparqlFieldValue(data[0][pName]);
			node.data("dataTypeProperties").push(val);
		}
		//ritriggo l'evento cosi il tooltip viene ridisegnato, questa volta con le informazioni recuperate
		caller.trigger("tap");
	}
	
	my.expandProperty = function(graphId,nodeURI,propToExpand,direction){
		var graph = spqlib.getById(graphId);
		var config = graph.config;
		var node = graph.getElementById(nodeURI);
		if (direction=="IN") {
			var query = generateExpandNodeQueryIn(nodeURI,propToExpand);
		} else if (direction=="OUT"){
			var query = generateExpandNodeQueryOut(nodeURI,propToExpand);
		} else {
			throw "'"+direction+"' is invalid for direction parameter";
		}
		query = spqlib.util.addPrefixes(query,config.queryPrefixes);
		spqlib.util.doQuery(config.endpointName, query, spqlib.graph.addNodes, config,null,null,{graphId:graphId,nodeURI:nodeURI,propToExpand:propToExpand,direction:direction});	
		//nascondo il tooltip
		node.trigger("unfocus");
	}
	
	my.collapseProperty = function(graphId,nodeURI,propToExpand,direction){
		var graph = spqlib.getById(graphId);
		var config = graph.config;
		var node = graph.getElementById(nodeURI);
		node.trigger("unfocus");
		if (direction=="OUT"){
			spqlib.graph.graphImpl().collapseOutgoers(graphId,nodeURI,propToExpand);
		}
		if (direction=="IN"){
			spqlib.graph.graphImpl().collapseIncomers(graphId,nodeURI,propToExpand);
		}
		var attrName = propToExpand+"-"+direction;
		spqlib.graph.graphImpl().setGraphElementData(graphId, nodeURI, attrName, {expanded:false});
		centerGraphToNode(graphId, nodeURI);
		
	}
	
	
	function renderExtraDataTypeProperties(conf,categoryName,properties){
		var res = "";
		if (conf.globalConfiguration && conf.globalConfiguration[categoryName]) {
				var categoryConf = conf.globalConfiguration[categoryName];
				if (categoryConf.dataTypeProps){
					for (var i=0;i<properties.length;i++){
						var val = properties[i];
						var format = categoryConf.dataTypeProps[i].format;
						var text = spqlib.util.formatString(format,val);
						res+="<div class='extra-prop'>"+text+"</div>";
					}
				}
		}
		
		return res;
	}
	
	function renderExtraObjectProperties(conf,categoryName,obj){
		var nodeURI = obj.data("id");
		var res = "";
		if (conf.globalConfiguration && conf.globalConfiguration[categoryName]) {
				var categoryConf = conf.globalConfiguration[categoryName];
				if (categoryConf.objectProps){
					var properties = categoryConf.objectProps;
					for (var i=0;i<properties.length;i++){
						var prop = properties[i].prop;
						var direction = properties[i].direction;
						var label = properties[i].label;
						var ICON_PLUS = "<span class=' fas fa-search-plus'></span>";
						var ICON_MINUS = "<span class=' fas fa-search-minus'></span>";
						var funcName = "";
						var icon = "";
						if (isNodeExpandedForProperty(obj,prop,direction)) {
							icon = ICON_MINUS;
							funcName = "spqlib.graph.collapseProperty";
						} else {
							icon = ICON_PLUS;
							funcName = "spqlib.graph.expandProperty";
						}
						res+="<div class='extra-object-prop'><a href='#' onclick='"+funcName+"(\""+conf.divId+"\",\""+nodeURI+"\",\""+prop+"\",\""+direction+"\");'>"+
						      ""+label+" "+icon+"</a></div>";
					}
				}
		}
		
		return res;
	}
	
	function isNodeExpandedForProperty(nodeData,property,direction){
		var attrName = property+"-"+direction;
		if (nodeData.data(attrName)){
			var obj = nodeData.data(attrName);
			if (obj.expanded){
				return obj.expanded;
			}
		}
		return false;
	}
	
	function renderSingleCategoryLink(type,conf) {
		var pattern = conf.categoryLinkPattern;
		var link = spqlib.util.formatString(pattern,type);
		return "<a href='"+link+"' target='_blank'>" + type + "</a>";
	}

	function renderCategoryLink(types,conf) {
		var out = "";
		if (types==""){
			return "";
		}			
		if (types instanceof Array) {
			for (var i = 0; i < types.length; i++) {
				out += renderSingleCategoryLink(types[i],conf);
				if (i < types.length - 1) {
					out += ", ";
				}
			}
		} else {
			out = renderSingleCategoryLink(types,conf);
		}
		if (out!=""){
			return "Category: " + out + "</br>";
		} else {
			return "";
		}
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
		
		var showLegendLabel=mw.message( 'sprf.js.graph.show.legend' ).text();
		var hideLegendLabel=mw.message( 'sprf.js.graph.hide.legend' ).text();
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
				var itemLabel = spqlib.getById(config.divId).getElementById(config.rootElement).data("fullLabel");
				var col2 = $("<td>").append(
						"Current item (" + itemLabel + ")");
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
			var value = $("#" + divLegendLabel+" span").text();
			if (value == showLegendLabel){
				//$("#" + divLegendContainer).show();
				$("#" + divLegendContainer).slideDown("slow");
				$("#" + divLegendLabel+" span").text(hideLegendLabel);
			} else if (value == hideLegendLabel) {
				$("#" + divLegendContainer).slideUp("slow");
				//$("#" + divLegendContainer).hide();
				$("#" + divLegendLabel+" span").text(showLegendLabel);
			}
		});

		$("#" + divLegendContainer).on("mouseenter ", function(){
			$("#" + divLegendContainer).show();
			$("#" + divLegendLabel+" span").text(hideLegendLabel);
		});

		$("#" + divLegendContainer).on("mouseleave", function(){
			$("#" + divLegendContainer).slideUp("slow");
			$("#" + divLegendLabel+" span").text(showLegendLabel);
		});
	}
	
	my.createGlobalCategoryConfiguration = function(nodeConfiguration, edgeConfiguration) {

		var categoryConf = [];
		for (var i = 0; i < nodeConfiguration.length; i++) {
			var cat = nodeConfiguration[i];
			var categoryName = cat.category;
			categoryConf[categoryName] = {
				name : categoryName,
				group : 'node',
				color : cat.nodeColor,
				dataTypeProps : cat.dataTypeProps,
				objectProps : cat.objectProps
			};
		}
		for (var i = 0; i < edgeConfiguration.length; i++) {
			var rel = edgeConfiguration[i];
			categoryConf[rel.relation] = {
				name : rel.relation,
				group : 'edge',
				color : rel.edgeColor
			};
		}
		return categoryConf;
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