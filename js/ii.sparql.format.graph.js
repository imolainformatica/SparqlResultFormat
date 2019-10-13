spqlib.graph = ( function () {
	/**
	* Entry point
	*/
	 spqlib.sparql2Graph = function ( config ) {
		spqlib.graph.initHtml( config );
		if ( !config.sparqlWithPrefixes && config.sparql && config.queryPrefixes ) {
			config.sparqlWithPrefixes = spqlib.util.addPrefixes( config.sparql, config.queryPrefixes );
		}
		var splitQueryByUnion = config.splitQueryByUnion || false;
		if ( splitQueryByUnion == true || splitQueryByUnion.toLowerCase() == 'true' ) {
			var queries = spqlib.util.splitQueryByUnion( config.sparqlWithPrefixes ),
			 step = 100 / ( queries.length );
			config.step = step;

			$( '#' + config.divId ).on( 'done', function () {
				var progress = 0 + step,
				 idContainer = config.divId + '-container',
				 progressBar = $( '#' + idContainer ).next().find( '.progress-bar' ),
				 currentProgress = parseInt( progressBar.attr( 'aria-valuenow' ) ),
				 newProgress = currentProgress + parseInt( config.step );
				if ( 100 - newProgress < config.step ) {
					newProgress = 100;
				}
				progressBar.attr( 'aria-valuenow', newProgress );
				var perc = newProgress + '%';
				progressBar.css( 'width', perc );
				progressBar.text( perc );
				var i = 1;
				if ( queries[ i ] ) {
					spqlib.util.doQuery( config.endpoint, config.endpointName, queries[ i ], spqlib.graph.addNodes, config, null, spqlib.graph.failQuery );
				} else {
					$( '#' + config.divId + '-container' ).next().hide();
				}
				// serializzo le chiamate
				$( '#' + config.divId ).on( 'singleQueryDone', function () {
					i++;
					if ( queries[ i ] ) {
						spqlib.util.doQuery( config.endpoint, config.endpointName, queries[ i ], spqlib.graph.addNodes, config, null, spqlib.graph.failQuery );
					} else {
						// nascondo la progress bar
						$( '#' + config.divId + '-container' ).next().hide();
					}
				} );
			} );
			if ( queries.length > 0 ) {
				spqlib.util.doQuery( config.endpoint, config.endpointName, queries[ 0 ], spqlib.graph.render, config, spqlib.graph.preQuery, spqlib.graph.failQuery );
			}
		} else {
			spqlib.util.doQuery( config.endpoint, config.endpointName, config.sparqlWithPrefixes, spqlib.graph.render, config, spqlib.graph.preQuery, spqlib.graph.failQuery );
		}
	};

	var my = { };

	my.graphImpl = function () {
		return spqlib.cytoscape();
	};

	my.exportAsImage = function () {
		var id=$(this).attr("sprf-graph-id");
		var config=spqlib.getById(id).config;
		var png = spqlib.graph.graphImpl().exportAsImage(id);
		$("<form method='POST' action='"+config.downloadImageEndpoint+"'><input type='hidden' name='png_file_name' value='"+id+"-export.png'><input type='hidden' name='png_string' value='"+png+"'></form>").appendTo("body").submit();
	};

	my.toggleFullScreen = function ( obj ) {
		var graphId = $(this).attr("sprf-graph-id");
		if ( screenfull.enabled ) {
			var el = document.getElementById( graphId + '-container' );
			screenfull.toggle( el );
		}
		spqlib.graph.graphImpl().resize( graphId );
		centerGraphToNode( graphId, spqlib.graph.graphImpl().getGraph( graphId ).config.rootElement );
	};
	
	my.zoomIn = function(obj){
		var id=$(this).attr("sprf-graph-id");
		var graph = spqlib.getById(id);
		var max=graph.maxZoom();
		var min=graph.minZoom();
		var step = (max-min)/10;
		var actualZoom = graph.zoom();
		actualZoom+=step;
		graph.zoom(actualZoom);
	}
	
	my.zoomOut = function(obj){
		var id=$(this).attr("sprf-graph-id");
		var graph = spqlib.getById(id);
		var max=graph.maxZoom();
		var min=graph.minZoom();
		var step = (max-min)/10;
		var actualZoom = graph.zoom();
		actualZoom-=step;
		graph.zoom(actualZoom);
	}
	
	my.toggleLegend = function(obj){
		var id=$(this).attr("sprf-graph-id");
		$("#"+id+"-legend-container").toggle();
	}
	

	my.preQuery = function ( configuration ) {
		if ( configuration.spinnerImagePath ) {
			$( '#' + configuration.divId + '-loader' ).html( "<img src='" + configuration.spinnerImagePath + "' style='vertical-align:middle;'>" );
		} else {
			$( '#' + configuration.divId + '-loader' ).html( 'Loading...' );
		}
	};

	my.failQuery = function ( configuration, jqXHR, textStatus ) {
		$( '#' + configuration.divId + '-loader' ).html( '' );
		$( '#' + configuration.divId + '-loader' ).show();
		$( '#' + configuration.divId + '-legend-box' ).html( '' );
		$( '#' + configuration.divId + '-loader' ).html( generateErrorBox( textStatus ) );
		throw new Error( 'Error invoking sparql endpoint ' + textStatus + ' ' + JSON.stringify( jqXHR ) );
	};

	function generateErrorBox( message ) {
		var html = "<div class='alert alert-danger' role='alert'><span class=' fas fa-exclamation' aria-hidden='true'></span><span class='sr-only'>Error:</span>" +
				message + '</div>';
		return html;
	}

	my.initHtml = function ( config ) {
		var goFullscreenLabel = spqlib.util.message( 'sprf.js.graph.go.fullscreen' ),
		 exitFullscreenLabel = spqlib.util.message( 'sprf.js.graph.exit.fullscreen' ),
		 idContainer = config.divId + '-container',
		 idLoader = config.divId + '-loader',
		 idLegendBox = config.divId + '-legend-box',
		 idLegendContainer = config.divId + '-legend-container',
		 idLegendContainerLabel = config.divId + '-legend-container-label',
		 idLegendHeader = config.divId + '-legend-header',
		 idLegend = config.divId + '-legend',
		 idLegendActionList = config.divId + '-legend-actions-list';
		var actionFullScreen = "<div style='"+(config.showFullscreenLink==false ? 'display:none' : '')+"'><span id='"+config.divId+"-ii-graph-action-toggle-fullscreen' class='fa fa-expand ii-graph-action-toggle-fullscreen' sprf-graph-id="+config.divId+"> "+goFullscreenLabel+"</span></div>";
		var actionDownloadImage="<div style='"+(config.showDownloadImageLink==false ? 'display:none' : '')+"'><span class='fa fa-image ii-graph-action-image' sprf-graph-id="+config.divId+"> "+spqlib.util.message("sprf.js.graph.download.image")+"</span></div>";
		$( '#' + idContainer ).before( "<div id='" + idLoader + "' class='ii-graph-loader-box'></div>" );
		$( '#' + idContainer ).prepend( "<div id='" + idLegendBox + "' class='ii-graph-legend-box'></div>" );
		$( '#' + idLegendBox ).prepend( "<div id='" + idLegendContainer + "' class='ii-graph-legend-container cytoscape-legend-container' style='"+(config.showLegend==false ? 'display:none' : '')+"'></div>" );
		$( '#' + idLegendBox ).prepend( "<div id='" + idLegendContainerLabel + "' class='ii-graph-legend-container cytoscape-legend-container-label'><span id='"+config.divId+"-legend-toggle' class='fa fa-ellipsis-v ii-legend-toggle' sprf-graph-id="+config.divId+"><span><!--i class='fas fa-chevron-down'></i--></div>" );
		$( '#' + idLegendContainer ).append( "<div id='" + idLegendHeader + "' class='ii-graph-legend-header'>" + createLegendHeader( config ) + '</div> ' );
		$( '#' + idLegendContainer ).append( "<div id='" + idLegend + "' class='ii-graph-legend'></div> " );
		$( '#' + idLegendContainer ).append( "<div id='" + idLegendActionList + "' class='ii-graph-legend-actions-list cytoscape-actions-list'></div> " );
		$( '#' + idLegendActionList ).append( "<div class='ii-graph-legend-action cytoscape-action'>" + actionFullScreen +'</div>' );
		$( '#' + idLegendActionList ).append( "<div class='ii-graph-legend-action cytoscape-action'>" + actionDownloadImage +'</div>' );
		if ( config.splitQueryByUnion && config.splitQueryByUnion == 'true' ) {
			$( '#' + idContainer ).after( "<div class='progress'><div class='progress-bar ii-graph-progress-bar ' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width:0%'>0%</div></div>" );
		}
		$(".ii-graph-zoom-controls-in").click(spqlib.graph.zoomIn);
		$(".ii-graph-zoom-controls-out").click(spqlib.graph.zoomOut);
		$("#"+config.divId+"-legend-toggle").click(spqlib.graph.toggleLegend);
		$(".ii-graph-action-image").click(spqlib.graph.exportAsImage);
		$("#"+config.divId+"-ii-graph-action-toggle-fullscreen").click(spqlib.graph.toggleFullScreen);

	};

	function createLegendHeader( config ) {
		return "";
	}

	my.render = function ( json, config ) {
		var head = json.head.vars,
		 data = json.results.bindings;
		//$( '#' + config.divId + '-container' ).find( '.ii-graph-legend-actions-list' ).show();
		//$( '#' + config.divId + '-legend-container' ).attr( 'style', '' );
		$( '#' + config.divId + '-loader' ).html( 'Rendering...' );

		var edges = [],
		 nodes = [],
		 distinctNodes = [],
		 distinctEdges = [],
		 colorConf = config.colorConf = createColorConf( config );
		config.globalConfiguration = spqlib.graph.createGlobalCategoryConfiguration( config.nodeConfiguration, config.edgeConfiguration );
		if ( data.length == 0 && config.rootElement ) {
			nodes.push( {
				data: {
					label: config.rootElement,
					id: config.rootElement,
					color: '#000'
				},
				classes: 'background'
			} );
		}

		for ( var i = 0; i < data.length; i++ ) {
			var parent = getSparqlFieldValue( data[ i ].parent_name ),
			 parentURI = getSparqlFieldValue( data[ i ].parent_uri ),
			 parentType = getSparqlFieldValue( data[ i ].parent_type ),
			 parentTypeURI = getSparqlFieldValue( data[ i ].parent_type_uri ),
			 child = getSparqlFieldValue( data[ i ].child_name ),
			 childURI = getSparqlFieldValue( data[ i ].child_uri ),
			 childType = getSparqlFieldValue( data[ i ].child_type ),
			 childTypeURI = getSparqlFieldValue( data[ i ].child_type_uri ),
			 property = getSparqlFieldValue( data[ i ].relation_name ),
			 propertyURI = getSparqlFieldValue( data[ i ].relation_uri ),

			 parentID = parentURI || parent,
			 childID = childURI || child;
			if ( !distinctNodes[ parentID ] ) {
				var color = mapTypeToColor( parentType, colorConf,
						config.defaultNodeColor ),
				 node = createNode( parentID, parent, parentType, parentTypeURI, color, config.maxLabelLength, config.maxWordLength );
				distinctNodes[ parentID ] = node; // parentID;
			} else {
				// il nodo esiste già, dobbiamo aggiungere un'altra categoria alla lista?
				var actualNode = distinctNodes[ parentID ];
				if ( actualNode.type.indexOf( parentType ) == -1 ) { // il tipo non è tra quelli già presenti nel nodo
					actualNode.type.push( parentType );
					actualNode.typeURI.push( parentTypeURI );
				}
			}
			if ( !distinctNodes[ childID ] ) {
				var color = mapTypeToColor( childType, colorConf,
						config.defaultNodeColor ),
				 node = createNode( childID, child, childType, childTypeURI, color, config.maxLabelLength, config.maxWordLength );

				distinctNodes[ childID ] = node; // childID;
			} else {
				// il nodo esiste già, dobbiamo aggiungere un'altra categoria alla lista?
				var actualNode = distinctNodes[ childID ];
				if ( actualNode.type.indexOf( childType ) == -1 ) { // il tipo non è tra quelli già presenti nel nodo
					actualNode.type.push( childType );
					actualNode.typeURI.push( childTypeURI );
				}
			}
			var edgeColor = mapTypeToColor( property, colorConf,
					config.defaultEdgeColor ),

			 edge = createEdge( distinctNodes[ parentID ].id, distinctNodes[ childID ].id, property, propertyURI, edgeColor ),
			 edgeID = edge.source + '-' + edge.target + '-' + edge.uri + '-' + edge.property;
			if ( !distinctEdges[ edgeID ] ) { // per evitare di aggiungere lo stesso arco più volte. capita quando il parent o il child hanno più valori di category
				distinctEdges[ edgeID ] = edge;
				edges.push( {
					data: edge
				} );
			}
		}
		// push all nodes
		for ( var key in distinctNodes ) {
			var n = distinctNodes[ key ];
			nodes.push( {
				data: n,
				classes: 'background'
			} );
		}
		var maxNodes = config.maxNumNodes || 100;
		if ( nodes.length > maxNodes ) {
			$( '#' + config.divId + '-loader' ).html( '' );
			$( '#' + config.divId + '-loader' ).html( generateErrorBox( 'Error: too much nodes to draw on the graph' ) );
			throw 'Errore troppi nodi';
		}
		drawGraph( nodes, edges, config );
		
		if (screenfull.enabled) {
			screenfull.on('change', () => {
				var goFullscreenLabel = spqlib.util.message( 'sprf.js.graph.go.fullscreen' ),
				 exitFullscreenLabel = spqlib.util.message( 'sprf.js.graph.exit.fullscreen' );
				var icon = $('.ii-graph-action-toggle-fullscreen' );
				if (screenfull.isFullscreen){
					icon.addClass( 'fa-compress' );
					icon.removeClass( 'fa-expand' );
					$( '.ii-graph-action-toggle-fullscreen' ).text( " "+exitFullscreenLabel )
				}else {
					icon.removeClass( 'fa-compress' );
					icon.addClass( 'fa-expand' );
					$( '.ii-graph-action-toggle-fullscreen' ).text( " "+goFullscreenLabel );
					
				}
			
			});
		}
		
	};

	my.addNodes = function ( json, config, caller ) {

		var head = json.head.vars,
		 data = json.results.bindings,
		 edges = [],
		 nodes = [],
		 colorConf = config.colorConf || createColorConf( config );
		for ( var i = 0; i < data.length; i++ ) {
			var parent = getSparqlFieldValue( data[ i ].parent_name ),
			 parentURI = getSparqlFieldValue( data[ i ].parent_uri ),
			 parentType = getSparqlFieldValue( data[ i ].parent_type ),
			 parentTypeURI = getSparqlFieldValue( data[ i ].parent_type_uri ),
			 child = getSparqlFieldValue( data[ i ].child_name ),
			 childURI = getSparqlFieldValue( data[ i ].child_uri ),
			 childType = getSparqlFieldValue( data[ i ].child_type ),
			 childTypeURI = getSparqlFieldValue( data[ i ].child_type_uri ),
			 property = getSparqlFieldValue( data[ i ].relation_name ),
			 propertyURI = getSparqlFieldValue( data[ i ].relation_uri ),

			 parentID = parentURI || parent,
			 childID = childURI || child,

			 childColor = mapTypeToColor( childType, colorConf,
					config.defaultNodeColor ),
			 childNode = createNode( childID, child, childType, childTypeURI, childColor, config.maxLabelLength, config.maxWordLength ),
			 parentColor = mapTypeToColor( parentType, colorConf,
					config.defaultNodeColor ),
			 parentNode = createNode( parentID, parent, parentType, parentTypeURI, parentColor, config.maxLabelLength, config.maxWordLength );
			nodes.push( {
				data: childNode,
				classes: 'background'
			} );
			nodes.push( {
				data: parentNode,
				classes: 'background'
			} );
			// per ogni nodo creo anche il relativo arco ma solo se non
			// esiste già
			var edge = new Object();
			edge.source = parentID;
			edge.target = childID;
			edge.property = property;
			edge.propertyURI = propertyURI;
			edge.color = mapTypeToColor( edge.property, colorConf,
				config.defaultEdgeColor );
			if ( !existEdge( config.divId, edge.source, edge.target ) ) {
				edges.push( {
					data: edge
				} );
			}
		}
		if ( data.length > 0 ) {
			var n = addNodesToGraph( config.divId, nodes ),
			 e = addEdgesToGraph( config.divId, edges ),
			 layout = getSelectedLayout( config );
			setLayoutToGraph( config.divId, layout );
			enableTooltipOnNodes( config.divId, n );
			enableTooltipOnEdges( config.divId, e );
			assignBgImageToNodes( config, n );
		}
		if ( caller ) {
			if ( caller.propToExpand ) {
				var elementId = caller.nodeURI,
				 direction = caller.direction,
				 attrName = caller.propToExpand + '-' + direction;
				spqlib.graph.graphImpl().setGraphElementData( config.divId, elementId, attrName, { expanded: true, numResult: data.length } );
			}
		}

		var idContainer = config.divId + '-container',
		 progressBar = $( '#' + idContainer ).next().find( '.progress-bar' ),
		 currentProgress = parseInt( progressBar.attr( 'aria-valuenow' ) ),
		 newProgress = currentProgress + parseInt( config.step );
		if ( 100 - newProgress < config.step ) {
			newProgress = 100;
		}
		progressBar.attr( 'aria-valuenow', newProgress );
		var perc = newProgress + '%';
		progressBar.css( 'width', perc );
		progressBar.text( perc );
		$( '#' + config.divId ).trigger( 'singleQueryDone' );

	};

	function generateExpandNodeQueryOut( nodeURI, property ) {
		return 'SELECT distinct ?parent_name ?child_name ?parent_type ?child_type ?relation_name ?parent_uri ?child_uri ?parent_type_uri ?child_type_uri ?relation_uri WHERE { ' +
				'{  <' + nodeURI + '> ' + property + ' ?child_uri;\
                           	rdfs:label ?parent_name.			\
				      OPTIONAL { ?child_uri rdfs:label ?child_name. \
								 ?child_uri rdf:type ?child_type_uri. \
								 ?child_type_uri rdfs:label ?child_type.\
								 } \
					   <' + nodeURI + '> rdf:type ?parent_type_uri. \
					   ?parent_type_uri rdfs:label ?parent_type. \
					   OPTIONAL { ' + property + ' rdfs:label ?relation_name.} \
					   BIND (<' + nodeURI + '> AS ?parent_uri) \
					   BIND (<' + property + '> AS ?relation_uri) \
				  }  }';
	}

	function generateExpandNodeQueryIn( nodeURI, property ) {
		return 'SELECT distinct ?parent_name ?child_name ?parent_type ?child_type ?relation_name ?parent_uri ?child_uri ?parent_type_uri ?child_type_uri ?relation_uri WHERE { ' +
				'{  ?parent_uri ' + property + ' <' + nodeURI + '> .\
				      OPTIONAL { ?parent_uri rdfs:label ?parent_name. \
					  <' + nodeURI + '> rdfs:label ?child_name. \
								 <' + nodeURI + '> rdf:type ?child_type_uri. \
								 ?child_type_uri rdfs:label ?child_type.\
								 } \
					   ?parent_uri rdf:type ?parent_type_uri. \
					   ?parent_type_uri rdfs:label ?parent_type. \
					   OPTIONAL { ' + property + ' rdfs:label ?relation_name.} \
					   BIND (<' + nodeURI + '> AS ?child_uri) \
					   BIND (<' + property + '> AS ?relation_uri) \
				  }  }';
	}

	/**
	 * ritona il colore associato ad un determinato valore in input. se non esiste ritorna il colore di default
	 */
	function mapTypeToColor( type, colorConf, defaultColor ) {
		if ( colorConf[ type ] ) {
			return colorConf[ type ];
		} else {
			return defaultColor;
		}
	}

	function createEdge( source, target, prop, propURI, color ) {
		var edge = new Object();
		edge.source = source;
		edge.target = target;
		edge.property = prop;
		edge.uri = propURI;
		edge.color = color;
		return edge;
	}

	function createNode( uri, label, type, typeURI, color, maxLength, maxWordLength ) {
		var node = new Object();
		node.uri = node.id = uri;
		node.mainType = type; // il tipo principale, quello che da lo stile al nodo (colore/immagine)
		node.mainTypeURI = typeURI;
		node.type = [];
		node.type.push( type );
		node.typeURI = [];
		node.typeURI.push( typeURI );
		node.fullLabel = label;
		node.label = spqlib.util.cutLongLabel( label, maxLength, maxWordLength );
		node.color = color;
		node.image = null;
		return node;
	}

	function drawGraph( nodes, edges, config ) {
		var divId = config.divId,
		 layout = getSelectedLayout( config );
		// add extra property to layout
		for ( var key in config.layoutOptions ) {
			var value = config.layoutOptions[ key ];
			layout[ key ] = value;
		}
		var style = spqlib.graph.graphImpl().newDefaultStyleObject();
		if ( config.nodeStyle ) {
			for ( var key in config.nodeStyle ) {
				var value = config.nodeStyle[ key ];
				style[ 0 ].style[ key ] = value;
			}
		}
		if ( config.edgeStyle ) {
			for ( var key in config.edgeStyle ) {
				var value = config.edgeStyle[ key ];
				style[ 1 ].style[ key ] = value;
			}
		}
		var graph = spqlib.graph.graphImpl().drawGraph( config, nodes, edges, style, layout );
		$( '#headertabs ul li a' ).on(
			'click',
			function ( event, ui ) {
				var tabDivId = $( this ).attr( 'href' ),
					 t = $( tabDivId ).find(
						'.cytoscape-graph' );
				t.each( function () {
					var id = $( this ).attr( 'id' ),
						 graph = spqlib.getById( id );
					if ( graph ) {
						graph.resize();
						graph.center();
					}
				} );
			} );
		enableTooltipOnNodes( divId );
		enableTooltipOnEdges( divId );
		spqlib.addToRegistry( config.divId, graph );
		spqlib.graph.drawLegend( config );
		$( '#' + config.divId ).trigger( 'done' );
	}

	function getGraphConfig( graphId ) {
		return spqlib.graph.graphImpl().getGraph( graphId ).config;
	}

	function centerGraphToNode( graphId, nodeId ) {
		spqlib.graph.graphImpl().centerGraphToNode( graphId, nodeId );
	}

	my.assignBgImageToNodes = function ( conf, nodes ) {
		assignBgImageToNodes( conf, nodes );
	};

	function assignBgImageToNodes( conf, nodes ) {

		if ( conf.rootElementImage ) {
			var legendDiv = $( '#table-' + conf.divId +
					"-legend div[type='rootElement']" );
			legendDiv.css( 'background-color', 'white' );
			legendDiv.css( 'background-image', 'url("' +
					conf.rootElementImage + '")' );

		}
		for ( var i = 0; i < conf.nodeConfiguration.length; i++ ) {
			var obj = conf.nodeConfiguration[ i ];
			// in caso di nodi con immagini devo aggiornare i nodi e la
			// legenda settando l'immagine di sfondo
			if ( obj.image ) {
				spqlib.graph.graphImpl().assignBackgrounImageToNodesByCategory( conf.divId, obj, nodes );

				// aggiorno anche la legenda
				var legendDiv = $( '#table-' + conf.divId +
						"-legend div[category-name='" + obj.category +
						"']" );
				legendDiv.css( 'background-color', 'white' );
				legendDiv.css( 'background-image', 'url("' + obj.image + '")' );
			}
		}
	}

	function enableTooltipOnNodes( graphId, nodes ) {
		if ( !nodes ) {
			spqlib.graph.graphImpl().enableTooltipOnNodes( graphId );
		} else {
			spqlib.graph.graphImpl().enableTooltipOnNodes( graphId, nodes );
		}
	}
	function enableTooltipOnEdges( graphId, edges ) {
		if ( !edges ) {
			spqlib.graph.graphImpl().enableTooltipOnEdges( graphId );
		} else {
			spqlib.graph.graphImpl().enableTooltipOnEdges( graphId, edges );
		}
	}

	function getSelectedLayout( config ) {
		return spqlib.graph.graphImpl().getSelectedLayout( config );
	}

	function setLayoutToGraph( graphId, layout ) {
		spqlib.graph.graphImpl().setLayoutToGraph( graphId, layout );
	}

	function addNodesToGraph( graphId, nodes ) {
		return spqlib.graph.graphImpl().addNodesToGraph( graphId, nodes );
	}

	function addEdgesToGraph( graphId, edges ) {
		return spqlib.graph.graphImpl().addEdgesToGraph( graphId, edges );
	}

	function existEdge( graphId, from, to ) {
		var ret = spqlib.graph.graphImpl().getElementsFromSourceAndTarget( graphId, from, to );
		if ( ret.length == 0 ) {
			return false;
		} else {
			return true;
		}
	}

	my.createEdgeTooltip = function ( obj ) {
		html = String( String( obj.data( 'property' ) ) );
		/* if (obj.data("uri")){
			html+=" ("+obj.data("uri")+")";
		}*/
		return html;
	};

	my.createNodeTooltip = function ( obj ) {

		var conf = obj.cy().config,
		 target = '_self';
		if ( conf.tipLinkTarget ) {
			target = conf.tipLinkTarget;
		}
		var labelLinkPattern = conf.labelLinkPattern,
		 linkLabel = spqlib.util.formatString( labelLinkPattern, obj.data( 'fullLabel' ) ),
		 pageLink = $( '<a>' ).attr( 'href', linkLabel ).attr(
				'target', '_blank' ),
		 uriLink = '',
		 linkHref = linkLabel.replace( /'/g, '&apos;' ),
		 tip = '';
		if ( obj.data( 'fullLabel' ) ) {
			var tip = "<a href='" + linkHref +
					"' target='" + target + "'>" +
					obj.data( 'fullLabel' ) + '</a></br>';
		} else {
			if ( obj.data( 'uri' ) ) {
				var uriLink = 'URI: ' + obj.data( 'uri' ) + '</br>';
				tip += uriLink;
			}
		}
		var type = obj.data( 'type' );
		tip += renderCategoryLink( type, conf );
		tip += "<div class='ii-graph-tooltip-extra-data-type-props-container'>";
		if ( !obj.data( 'dataTypeProperties' ) ) {
			if ( conf.globalConfiguration && conf.globalConfiguration[ type ] ) {
				var categoryConf = conf.globalConfiguration[ type ];
				if ( categoryConf.dataTypeProps && categoryConf.dataTypeProps.length > 0 ) {
					tip += "<img src='" + conf.spinnerImagePath + "' style='vertical-align:middle;'>";
					loadExtraDataTypeProperties( obj, categoryConf.dataTypeProps, conf );
				}
			}

		} else {
			tip += renderExtraDataTypeProperties( conf, type, obj.data( 'dataTypeProperties' ) );
		}
		tip += '</div>';
		tip += "<div class='ii-graph-tooltip-extra-object-props-container'>";
		tip += renderExtraObjectProperties( conf, type, obj );
		tip += '</div>';

		return tip;
	};

	function loadExtraDataTypeProperties( obj, props, conf ) {
		// devo recupeare le informazioni e metterle dentro al nodo in modo che siano visualizzate
		var sparql = generateReadPropertyQuery( obj, props, conf.queryPrefixes );
		spqlib.util.doQuery( config.endpoint, config.endpointName, sparql, spqlib.graph.addInfoToNode, conf, null, null, obj );
	}

	function generateReadPropertyQuery( obj, props, prefixes ) {
		var nodeUri = obj.data( 'id' ),
		 select = 'SELECT ?node ';
		for ( var i = 0; i < props.length; i++ ) {
			select += ' ?p' + i;
		}
		var where = '';
		for ( var i = 0; i < props.length; i++ ) {
			var prop = props[ i ].prop;
			where += 'OPTIONAL{ <' + nodeUri + '> ' + prop + ' ?p' + i + '.} ';
		}
		var query = select + ' WHERE { {  ' + where + ' BIND (<' + nodeUri + '> AS ?node) } }';
		return spqlib.util.addPrefixes( query, prefixes );
	}

	my.addInfoToNode = function ( json, config, caller ) {
		var id = config.divId,
		 head = json.head.vars,
		 data = json.results.bindings,
		 row = data[ 0 ],
		 nodeId = getSparqlFieldValue( data[ 0 ].node ),
		 node = spqlib.getById( id ).getElementById( nodeId );
		node.data( 'dataTypeProperties', [] );
		for ( var i = 1; i < head.length; i++ ) {
			var pName = head[ i ],
			 val = getSparqlFieldValue( data[ 0 ][ pName ] );
			node.data( 'dataTypeProperties' ).push( val );
		}
		// ritriggo l'evento cosi il tooltip viene ridisegnato, questa volta con le informazioni recuperate
		caller.trigger( 'tap' );
	};

	my.expandProperty = function ( graphId, nodeURI, propToExpand, direction ) {
		var graph = spqlib.getById( graphId ),
		 config = graph.config,
		 node = graph.getElementById( nodeURI );
		if ( direction == 'IN' ) {
			var query = generateExpandNodeQueryIn( nodeURI, propToExpand );
		} else if ( direction == 'OUT' ) {
			var query = generateExpandNodeQueryOut( nodeURI, propToExpand );
		} else {
			throw "'" + direction + "' is invalid for direction parameter";
		}
		query = spqlib.util.addPrefixes( query, config.queryPrefixes );
		spqlib.util.doQuery( config.endpoint, config.endpointName, query, spqlib.graph.addNodes, config, null, null, { graphId: graphId, nodeURI: nodeURI, propToExpand: propToExpand, direction: direction } );
		// nascondo il tooltip
		node.trigger( 'unfocus' );
	};

	my.collapseProperty = function ( graphId, nodeURI, propToExpand, direction ) {
		var graph = spqlib.getById( graphId ),
		 config = graph.config,
		 node = graph.getElementById( nodeURI );
		node.trigger( 'unfocus' );
		if ( direction == 'OUT' ) {
			spqlib.graph.graphImpl().collapseOutgoers( graphId, nodeURI, propToExpand );
		}
		if ( direction == 'IN' ) {
			spqlib.graph.graphImpl().collapseIncomers( graphId, nodeURI, propToExpand );
		}
		var attrName = propToExpand + '-' + direction;
		spqlib.graph.graphImpl().setGraphElementData( graphId, nodeURI, attrName, { expanded: false } );
		centerGraphToNode( graphId, nodeURI );

	};

	function renderExtraDataTypeProperties( conf, categoryName, properties ) {
		var res = '';
		if ( conf.globalConfiguration && conf.globalConfiguration[ categoryName ] ) {
			var categoryConf = conf.globalConfiguration[ categoryName ];
			if ( categoryConf.dataTypeProps ) {
				for ( var i = 0; i < properties.length; i++ ) {
					var val = properties[ i ],
						 format = categoryConf.dataTypeProps[ i ].format,
						 text = spqlib.util.formatString( format, val );
					res += "<div class='extra-prop'>" + text + '</div>';
				}
			}
		}

		return res;
	}

	function renderExtraObjectProperties( conf, categoryName, obj ) {
		var nodeURI = obj.data( 'id' ),
		 res = '';
		if ( conf.globalConfiguration && conf.globalConfiguration[ categoryName ] ) {
			var categoryConf = conf.globalConfiguration[ categoryName ];
			if ( categoryConf.objectProps ) {
				var properties = categoryConf.objectProps;
				for ( var i = 0; i < properties.length; i++ ) {
					var prop = properties[ i ].prop,
						 direction = properties[ i ].direction,
						 label = properties[ i ].label,
						 ICON_PLUS = "<span class=' fas fa-search-plus'></span>",
						 ICON_MINUS = "<span class=' fas fa-search-minus'></span>",
						 funcName = '',
						 icon = '';
					if ( isNodeExpandedForProperty( obj, prop, direction ) ) {
						icon = ICON_MINUS;
						funcName = 'spqlib.graph.collapseProperty';
					} else {
						icon = ICON_PLUS;
						funcName = 'spqlib.graph.expandProperty';
					}
					res += String( "<div class='extra-object-prop'><a href='#' onclick='" + funcName + '("' + conf.divId + '","' + nodeURI + '","' + prop + '","' + direction + "\");'>" ) + label + ' ' + icon + '</a></div>';
				}
			}
		}

		return res;
	}

	function isNodeExpandedForProperty( nodeData, property, direction ) {
		var attrName = property + '-' + direction;
		if ( nodeData.data( attrName ) ) {
			var obj = nodeData.data( attrName );
			if ( obj.expanded ) {
				return obj.expanded;
			}
		}
		return false;
	}

	function renderSingleCategoryLink( type, conf ) {
		var pattern = conf.categoryLinkPattern,
		 link = spqlib.util.formatString( pattern, type );
		return "<a href='" + link + "' target='_blank'>" + type + '</a>';
	}

	function renderCategoryLink( types, conf ) {
		var out = '';
		if ( types == '' ) {
			return '';
		}
		if ( types instanceof Array ) {
			for ( var i = 0; i < types.length; i++ ) {
				out += renderSingleCategoryLink( types[ i ], conf );
				if ( i < types.length - 1 ) {
					out += ', ';
				}
			}
		} else {
			out = renderSingleCategoryLink( types, conf );
		}
		if ( out != '' ) {
			return 'Category: ' + out + '</br>';
		} else {
			return '';
		}
	}

	function createColorConf( config ) {
		var colorConf = new Object(),
		 nodeConfiguration = config.nodeConfiguration;
		for ( var i = 0; i < nodeConfiguration.length; i++ ) {
			var cat = nodeConfiguration[ i ];
			colorConf[ cat.category ] = cat.nodeColor;
		}
		var edgeConfiguration = config.edgeConfiguration;
		for ( var i = 0; i < edgeConfiguration.length; i++ ) {
			var rel = edgeConfiguration[ i ];
			colorConf[ rel.relation ] = rel.edgeColor;
		}
		return colorConf;

	}

	/**
	 * nasconde il div container della legenda
	 */
	function hideLegend( divId ) {
		$( '#' + divId ).hide();
	}

	/**
	 * genera il codice html della legenda
	 */
	my.drawLegend = function ( config ) {

		 var divId = config.divId + '-legend',
		 table = $( '<table>' ).attr( 'id', 'table-' + divId ),
		 nodeConfiguration = config.nodeConfiguration,
		 edgeConfiguration = config.edgeConfiguration;
		// aggiungo la voce per l'elemento root
		if ( config.rootElement ) {
			if ( config.rootElementColor || config.rootElementImage ) {
				var colorDiv = $( '<div>' ).addClass( 'legend-circle-node' )
						.attr( 'type', 'rootElement' ).attr(
							'style',
							'background:' + config.rootElementColor +
										'; background-size:100% 100%;' ),
				 col1 = $( '<td>' ).append( colorDiv ),
				 itemLabel = spqlib.getById( config.divId ).getElementById( config.rootElement ).data( 'fullLabel' ),
				 col2 = $( '<td>' ).append(
						'Current item (' + itemLabel + ')' ),
				 row = $( '<tr>' ).append( col1 ).append( col2 );
				table.append( row );
			}
		}
		for ( var i = 0; i < nodeConfiguration.length; i++ ) {
			var colorDiv = $( '<div>' ).addClass( 'legend-circle-node' ).attr(
					'category-name', nodeConfiguration[ i ].category ).attr(
					'style',
					'background:' + nodeConfiguration[ i ].nodeColor +
							'; background-size:100% 100%;' ),
			 col1 = $( '<td>' ).append( colorDiv ),
			 col2 = $( '<td>' ).append( nodeConfiguration[ i ].category ),
			 row = $( '<tr>' ).append( col1 ).append( col2 );
			table.append( row );
		}
		for ( var i = 0; i < edgeConfiguration.length; i++ ) {
			var colorDiv = $( '<div>' ).addClass( 'legend-arrow-line' ).attr(
					'style',
					String( 'background:' + edgeConfiguration[ i ].edgeColor ) ),
			 col1 = $( '<td>' ).append( colorDiv ),
			 col2 = $( '<td>' ).append( edgeConfiguration[ i ].relation ),
			 row = $( '<tr>' ).append( col1 ).append( col2 );
			table.append( row );
		}
		$( '#' + divId ).append( table );
	};

	my.createGlobalCategoryConfiguration = function ( nodeConfiguration, edgeConfiguration ) {

		var categoryConf = [];
		for ( var i = 0; i < nodeConfiguration.length; i++ ) {
			var cat = nodeConfiguration[ i ],
			 categoryName = cat.category;
			categoryConf[ categoryName ] = {
				name: categoryName,
				group: 'node',
				color: cat.nodeColor,
				dataTypeProps: cat.dataTypeProps,
				objectProps: cat.objectProps
			};
		}
		for ( var i = 0; i < edgeConfiguration.length; i++ ) {
			var rel = edgeConfiguration[ i ];
			categoryConf[ rel.relation ] = {
				name: rel.relation,
				group: 'edge',
				color: rel.edgeColor
			};
		}
		return categoryConf;
	};

	function getSparqlFieldValue( field ) {
		if ( field ) {
			return field.value;
		} else {
			return '';
		}
	}

	return my;
}() );
