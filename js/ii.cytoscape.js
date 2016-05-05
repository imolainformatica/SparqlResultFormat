
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
		* abilita il tooltip sui nodi di un particolare grafo
		* divId - identificativo del grafo
		* nodes - se specificato il tooltip viene abilitato solo sulla lista di nodi in ingresso, altrimenti su tutti i nodi
		**/
		function enableTooltipOnNodes(divId,nodes) {
			var collection = g[divId].elements().nodes();
			if (nodes){
				collection = g[divId].collection(nodes);
			}
			// just use the regular qtip api but on cy elements
			collection.qtip(
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
		
		/**
		* abilita il tooltip sugli archi di un particolare grafo
		* divId - identificativo del grafo
		* edges - se specificato il tooltip viene abilitato solo sulla lista di archi in ingresso, altrimenti su tutti gli archi
		**/
		function enableTooltipOnEdges(divId,edges) {
			var collection = g[divId].elements().edges();
			if (edges){
				collection = g[divId].collection(edges);
			}
			// just use the regular qtip api but on cy elements
			  collection.qtip({
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
		
		/**
		* assegna l'immagine di sfondo in base all'attributo type presente sul nodo
		* graphId - identificativo del grafo
		* obj - configurazione per una particolare categoria di nodi
		* nodes - se specificato lo sfondo viene applicato solo sulla lista di nodi in ingresso, altrimenti su tutti i nodi
		**/
		function assignBackgrounImageToNodesByCategory(graphId,obj,nodes){
			if (!nodes){
				var eles = g[graphId].elements('node[type="'
						+ obj.category + '"]');
			} else {
				var eles = nodes.nodes('node[type="'
						+ obj.category + '"]');
			}
			for (var j = 0; j < eles.length; j++) {
				var ele = eles[j];
				ele.style('background-image', obj.image);
				ele.style('background-opacity', 0);
			}
		}

		
		return { 
			    getGraph: function (graphId){
			    	if (g[graphId]){
			    		return g[graphId];
			    	} else {
			    		return null;
			    	}
			    },		    
			    resize: function(graphId){
			    	g[graphId].resize();
			    },
			    getElementsFromSourceAndTarget:function(graphId,source,target){
			    	return g[graphId].elements("edge[source='" + source
							+ "'][target='" + target + "']");  	
			    	
			    },		
			    addNodesToGraph:function(graphId,nodes){
			    	return g[graphId].add(nodes);
			    },
			    addEdgesToGraph:function(graphId,edges){
			    	return g[graphId].add(edges);
			    },
			    enableTooltipOnNodes:enableTooltipOnNodes,
			    enableTooltipOnEdges:enableTooltipOnEdges,
			    assignBackgrounImageToNodesByCategory:assignBackgrounImageToNodesByCategory,
			    centerGraphToNode:centerGraphToNode,
			    exportAsImage:exportAsImage,
			    getGraphElementData:getGraphElementData,
			    setGraphElementData:setGraphElementData,
			    newDefaultStyleObject:newDefaultStyleObject,
			    collapseIncomers:collapseIncomers,
			    collapseOutgoers:collapseOutgoers,
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
				drawGraph: function (config,nodes,edges,style,layout){
					var divId = config.divId;
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
					
					g[divId].config = config;
					g[divId].on('select', 'node', function(e) {
					});
					
					g[divId].on('ready',
						function(e) {
							
							var conf = e.cy.config;
							var divIdentifier = conf.divId;

							spqlib.graph.assignBgImageToNodes(conf);
							if (conf.rootElement) {
								if (conf.rootElementColor) {
									var el = e.cy
											.getElementById(conf.rootElement);
									el.style('background-color',
											conf.rootElementColor);
								}
								if (conf.rootElementImage) {
									var el = e.cy.getElementById(conf.rootElement);
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
							$("#"+conf.divId+"-loader").hide();
							
						});
					return g[divId];
				}
		}


		function collapseIncomers(graphId, nodeURI, property, direction) {
			var node = getGraphElementById(graphId, nodeURI);
			node.incomers("edge[propertyURI='" + property + "']").forEach(
				function(ele) {
					var source = ele.source();
					if (source.degree(true)==1){
						source.remove();
					}
					ele.remove();
				});
		}
		

		function collapseOutgoers(graphId, nodeURI, property, direction) {
			var node = getGraphElementById(graphId, nodeURI);
			node.outgoers("edge[propertyURI='" + property + "']").forEach(
					function(ele) {
						var target = ele.target();
						if (target.degree(true)==1){
							target.remove();
						}
						ele.remove();
					});
		}

		function getGraphElementById(graphId, elementId) {
			return g[graphId].getElementById(elementId);
		}

		function getGraphElementData(graphId, elementId, attribute) {
			return getGraphElementById(graphId, elementId).data(attribute);
		}

		function setGraphElementData(graphId, elementId, attribute, value) {
			getGraphElementById(graphId, elementId).data(attribute, value);
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