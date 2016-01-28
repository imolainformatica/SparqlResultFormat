
(function(spqlib, $) {

	var g = [];
	
	spqlib.cytoscape = (function(){

		var defaultCytoscapeStyle = [ // the stylesheet for the graph
		{
			selector : 'node',
			style : {
				'width' : 40,
				'height' : 40,
				/* 'shape':'rectangle', */
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
				// 'label': 'data(property)',
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
				/*
				 * 'text-background-opacity' : 1, 'text-background-color' :
				 * '#fff',
				 */
				'text-background-shape' : 'roundrectangle',
				/*
				 * 'text-border-color' : '#ccc', 'text-border-width' : 1,
				 */
				'text-border-opacity' : 1,
				'text-wrap' : 'wrap',
				'text-max-width' : 100,
			/*
			 * 'text-valign': 'center', 'text-halign': 'center'
			 */
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




		function exportAsImage(divId) {
			var png64 = g[divId].png({
				full : true
			});
			var hiddenElement = document.createElement('a');
			hiddenElement.href = png64;// 'data:attachment/text,' +
										// encodeURI(textToSave);
			hiddenElement.target = '_blank';
			// non funziona in IE
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
				$(containerSelector).toggleClass(
						'container-graph-full-screen');
				$(legendSelector).toggleClass('legend-graph-full-screen');
				$(graphSelector).toggleClass('graph-full-screen');
				$(graphSelector).css("height", g[divId].normalGraphHeight);
				g[divId].isFullScreen = false;
				$(legendSelector).find(".fullscreen-label").text(
						"Go fullscreen");
				$(legendSelector).find("i.glyphicon-resize-small").removeClass(
						"glyphicon-resize-small").addClass(
						"glyphicon-fullscreen");
				$(".ii-graph-container").show();
				$(window).scrollTop($("#" + divId).offset().top);
			} else {
				$(".ii-graph-container").hide();
				$(containerSelector).show();
				$(containerSelector).toggleClass(
						'container-graph-full-screen');
				$(legendSelector).toggleClass('legend-graph-full-screen');
				$(graphSelector).toggleClass('graph-full-screen');
				g[divId].normalGraphHeight = $(graphSelector).css("height");
				$(graphSelector).css("height", "100%");
				$(legendSelector).find(".fullscreen-label").text(
						"Exit fullscreen");
				g[divId].isFullScreen = true;
				$(legendSelector).find("i.glyphicon-fullscreen").addClass(
						"glyphicon-resize-small").removeClass(
						"glyphicon-fullscreen");
			}
			g[divId].resize();
			centerGraphToNode(divId, g[divId].config.rootElement);
		}


		function enableTooltipOnNodes(divId) {

			// just use the regular qtip api but on cy elements
			g[divId].elements().nodes().qtip(
							{
								content : function() {
									 return spqlib.graph.createNodeTooltip(this);
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
					return spqlib.graph.createEdgeTooltip(this);
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
		function newDefaultStyleObject() {
			var newStyle = [];
			for (var j = 0; j < defaultCytoscapeStyle.length; j++) {
				newStyle[j] = spqlib.util.cloneObject(defaultCytoscapeStyle[j]);
			}
			return newStyle;
		}
		
		function assignBackgrounImageToNodesByCategory(graphId,obj){
			var eles = g[graphId].elements('node[type="'
					+ obj.category + '"]');
			for (var j = 0; j < eles.length; j++) {
				var ele = eles[j];
				ele.style('background-image', obj.image);
				ele.style('background-opacity', 0);
			}
		}

		
		return { 
			    graphs: function (graphId){
			    	if (g[graphId]){
			    		return g[graphId];
			    	} else {
			    		return null;
			    	}
			    },
			    getElementsFromSourceAndTarget:function(graphId,source,target){
			    	return g[graphId].elements("edge[source='" + source
							+ "'][target='" + target + "']");  	
			    	
			    },		
			    
			    addNodesToGraph:function(graphId,nodes){
			    	g[graphId].add(nodes);
			    },
			    addEdgesToGraph:function(graphId,edges){
			    	g[graphId].add(edges);
			    },
			    enableTooltipOnNodes:enableTooltipOnNodes,
			    enableTooltipOnEdges:enableTooltipOnEdges,
			    assignBackgrounImageToNodesByCategory:assignBackgrounImageToNodesByCategory,
			    centerGraphToNode:centerGraphToNode,
			    setNodeExpandedForRelation:setNodeExpandedForRelation,
			    collapseNode:collapseNode,
			    exportAsImage:exportAsImage,
			    getSelectedLayout: function getSelectedLayout(config) {
					if (!layouts[config.layout]) {
						alert('layout ' + config.layout + ' not supported');
						throw "layout not supported";
					}
					return spqlib.util.cloneObject(layouts[config.layout]);
				},
				setLayoutToGraph: function (graphId, layout) {
					g[graphId].layout(layout);
				},
			 /**
			 * funzione che si occupa di inizializzare il grafo cytoscape
			 */
					drawGraph : function(nodes, edges, config) {

				var divId = config.divId;
				var layout = this.getSelectedLayout(config);
				// add extra property to layout
				for ( var key in config.layoutOptions) {
					var value = config.layoutOptions[key];
					layout[key] = value;
				}
				var style = newDefaultStyleObject();
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

				g[divId] = cytoscape({
					container : document.getElementById(config.divId), // container
					// to render
					// in
					elements : {
						nodes : nodes,
						edges : edges
					},
					style : style,

					layout : layout,
					motionBlur : true,
					selectionType : 'single',
					boxSelectionEnabled : false,
					/* autoungrabify: true, */
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
				if (config.showLegend == "true" || config.rootElement) {
					spqlib.graph.drawLegend(config);
				} else {
					hideLegend(config.divId + "-legend");
				}

				enableTooltipOnNodes(divId);
				enableTooltipOnEdges(divId);

				g[divId].config = config;
				g[divId].on('select', 'node', function(e) {
				});

				g[divId]
						.on(
								'ready',
								function(e) {
									var conf = e.cy.config;
									var divIdentifier = conf.divId;

									assignBgImageToNodes(conf);
									if (conf.rootElement) {
										if (conf.rootElementColor) {
											var el = e.cy
													.getElementById(conf.rootElement);
											el.style('background-color',
													conf.rootElementColor);
										}
										if (conf.rootElementImage) {
											var el = e.cy
													.getElementById(conf.rootElement);
											if (el.length > 0) {
												el.style('background-color',
														"white");
												el.style('background-image',
														conf.rootElementImage);
											}

										}

									}

									centerGraphToNode(divIdentifier,
											conf.rootElement);
									$("#headertabs ul li a")
											.on(
													'click',
													function(event, ui) {
														var tabDivId = $(this)
																.attr("href");
														var t = $(tabDivId)
																.find(
																		".ii-graph-container div.ii-graph")
																.attr("id");
														if (t) {
															g[t].resize();
															$(
																	".ii-graph-container")
																	.show();
															centerGraphToNode(
																	t,
																	g[t].config.rootElement);
														}
													});

								});
			}
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
					var eles = g[conf.divId].elements('node[type="'
							+ obj.category + '"]');
					for (var j = 0; j < eles.length; j++) {
						var ele = eles[j];
						ele.style('background-image', obj.image);
						ele.style('background-opacity', 0);
					}
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

		function collapseNode(graphId, label, property, direction) {

			if (direction && direction == "IN") {
				getGraphElementById(graphId, label).incomers(
						"edge[propertyURI='" + property + "']").forEach(
						function(ele) {
							ele.source().successors().remove();
							ele.source().remove();
							ele.remove();
						});
			} else {
				getGraphElementById(graphId, label).outgoers(
						"edge[propertyURI='" + property + "']").forEach(
						function(ele) {
							ele.target().successors().remove();
							ele.target().remove();
							ele.remove();
						});
			}
			setNodeExpandedForRelation(graphId, label, property, direction,
					false);
		}

		function addNodesIn(json, config) {
			var head = json.head.vars;
			var data = json.results.bindings;
			var edges = [];
			var nodes = [];
			for (var i = 0; i < data.length; i++) {
				var label = data[i]["parent_label"].value;
				var node = new Object();
				type = data[i]["parent_type_label"].value;
				var relation = data[i]["relation_label"].value;
				node.type = type;
				node.id = label;
				node.label = cutLongLabel(label, config.maxLabelLength,
						config.maxWordLength);
				node.color = mapTypeToColor(type, config.colorConf,
						config.defaultNodeColor);
				nodes.push({
					data : node,
					classes : "background"
				});
				// per ogni nodo creo anche il relativo arco ma solo se non
				// esiste già
				var edge = new Object();
				edge.source = node.label;
				edge.target = config.expandNodeInfo.source;
				edge.property = relation;
				edge.propertyURI = config.expandNodeInfo.property;
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


		/**
		 * ritorna il nome dell'oggetto e il tipo del nodo iniziale
		 */
		/*function generateInitialQuery(label) {
			return "SELECT ?label ?type_label WHERE { { VALUES ?root_label {'"
					+ label
					+ "'}   ?s rdfs:label ?label.   ?s rdfs:label ?root_label.   ?s rdf:type ?type.   ?type rdfs:label ?type_label.} }";
		}*/

		

		/* SET DI FUNZIONI PER DISACCOPPIARE DALL'INTERFACCIA DI CYTOSCAPE */
		function getGraphElementById(graphId, elementId) {
			return g[graphId].getElementById(elementId);
		}

		function getGraphElementData(graphId, elementId, attribute) {
			return getGraphElementById(graphId, elementId).data(attribute);
		}

		function setGraphElementData(graphId, elementId, attribute, value) {
			getGraphElementById(graphId, elementId).data(attribute, value);
		}

		function setNodeExpandedForRelation(graphId, elementId, propertyURI,
				propertyDirection, value) {
			var exp = getGraphElementData(graphId, elementId, "nodeExpansion");
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
			setGraphElementData(graphId, elementId, "nodeExpansion", exp);
		}

		function isNodeExpandedForRelation(graphId, elementId, propertyURI,
				propertyDirection) {
			var exp = getGraphElementData(graphId, elementId, "nodeExpansion");
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


		function existEdge(graphId, sourceNodeId, targetNodeId) {
			if (g[graphId].elements("edge[source='" + sourceNodeId
					+ "'][target='" + targetNodeId + "']").length == 0)
				return false;
			else
				return true;
		}

		/**
		 * centra il grafo sull'elemento root (se è stato definito nella configurazione oppure su tutto il grafo
		 */
		function centerGraphToNode(graphId, nodeId) {
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
		
		
	});

}(spqlib, jQuery));