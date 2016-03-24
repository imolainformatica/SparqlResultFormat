spqlib.barchart = (function () {
	var my = { };
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql. effettua il mapping dell'output e setta le impostazioni del grafo 
	 */
	my.chartImpl = function () {
		return spqlib.jqplot();
	}
	
	my.exportAsImage = function(){
		//spqlib.graph.chartImpl().exportAsImage();
	}
	
	my.toggleFullScreen = function(graphId){
		/*var isFullScreen = spqlib.graph.chartImpl().isFullScreen(graphId);
		if (isFullScreen==null) {
			spqlib.graph.chartImpl().setFullScreen(graphId,false);
		}
		
		var containerSelector = "#" + graphId + "-container";
		var graphSelector = "#" + graphId + "";
		var legendSelector = "#" + graphId + "-legend-container";
		if (isFullScreen == true) {
			$(containerSelector).toggleClass(
					'container-graph-full-screen');
			$(legendSelector).toggleClass('legend-graph-full-screen');
			$(graphSelector).toggleClass('graph-full-screen');
			$(graphSelector).css("height", spqlib.graph.chartImpl().getGraph(graphId).normalGraphHeight);
			$(legendSelector).find(".fullscreen-label").text(
					"Go fullscreen");
			$(legendSelector).find("i.glyphicon-resize-small").removeClass(
					"glyphicon-resize-small").addClass(
					"glyphicon-fullscreen");
			$(".ii-graph-container").show();
			$(window).scrollTop($("#" + graphId).offset().top);
			spqlib.graph.chartImpl().setFullScreen(graphId,false);
		} else {
			$(".ii-graph-container").hide();
			$(containerSelector).show();
			$(containerSelector).toggleClass(
					'container-graph-full-screen');
			$(legendSelector).toggleClass('legend-graph-full-screen');
			$(graphSelector).toggleClass('graph-full-screen');
			spqlib.graph.chartImpl().getGraph(graphId).normalGraphHeight = $(graphSelector).css("height");
			$(graphSelector).css("height", "100%");
			$(legendSelector).find(".fullscreen-label").text(
					"Exit fullscreen");
			$(legendSelector).find("i.glyphicon-fullscreen").addClass(
					"glyphicon-resize-small").removeClass(
					"glyphicon-fullscreen");
			spqlib.graph.chartImpl().setFullScreen(graphId,true);
		}
		spqlib.graph.chartImpl().resize(graphId);
		centerGraphToNode(graphId, spqlib.graph.chartImpl().getGraph(graphId).config.rootElement);
		*/
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

		
		spqlib.barchart.chartImpl().drawBarChart(labels,series,config);

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
		}
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
		drawGraph(nodes, edges, config);*/
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