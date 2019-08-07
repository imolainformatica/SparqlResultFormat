spqlib.bubblechart = ( function () {
	/**
	* Entry point
	*/
	spqlib.sparql2BubbleChart = function ( config ) {
		if ( !config.sparqlWithPrefixes && config.sparql && config.queryPrefixes ) {
			config.sparqlWithPrefixes = spqlib.util.addPrefixes( config.sparql, config.queryPrefixes );
		}
		spqlib.util.parseExtraOptions( config );
		this.util.doQuery(config.endpoint, config.endpointName, config.sparqlWithPrefixes, spqlib.bubblechart.render, config, spqlib.bubblechart.preQuery, spqlib.bubblechart.failQuery );
	};

	var my = { };

	my.chartImpl = function () {
		return spqlib.jqplot();
	};

	my.exportAsImage = function () {
	};

	my.toggleFullScreen = function ( graphId ) {
		var graphDiv = $( '#' + graphId + '-container' ),
		 cssClass = this.config.divCssClass,
		 cssClassFullScreen = this.config.divCssClassFullScreen;
		graphDiv.toggleClass( cssClass );
		graphDiv.toggleClass( cssClassFullScreen );
		$( '#tooltip1b' ).hide();
		this.replot( this.options );
	};

	my.preQuery = function ( configuration ) {
		$( '#' + configuration.divId + '-legend' ).hide();
		if ( configuration.spinnerImagePath ) {
			$( '#' + configuration.divId ).html( "<div class='loader'><img src='" + configuration.spinnerImagePath + "' style='vertical-align:middle;'></div>" );
		} else {
			$( '#' + configuration.divId ).html( 'Loading...' );
		}
	};

	my.failQuery = function ( configuration, jqXHR, textStatus ) {
		$( '#' + configuration.divId ).html( '' );
		$( '#' + configuration.divId ).html( spqlib.util.generateErrorBox( textStatus ) );
		throw new Error( 'Error invoking sparql endpoint ' + textStatus + ' ' + JSON.stringify( jqXHR ) );
	};

	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql.
	 */
	my.render = function ( json, config ) {
		$( '#' + config.divId + '-legend' ).show();
		$( '#' + config.divId ).html( '' );
		var head = json.head.vars,
		 data = json.results.bindings;
		if ( !head || head.length < 2 ) {
			throw 'Too few fields in sparql result. Need at least 2 columns';
		}
		var field_label = head[ 0 ],
		 numSeries = head.length - 1,
		 labels = [],
		 series = [];
		for ( var i = 0; i < data.length; i++ ) {
			labels.push( spqlib.util.getSparqlFieldValue( data[ i ][ field_label ] ) );
			for ( var j = 0; j < numSeries; j++ ) {
				if ( !series[ j ] ) {
					series[ j ] = [ data.length ];
				}
				series[ j ][ i ] = spqlib.util.getSparqlFieldValueToNumber( data[ i ][ head[ j + 1 ] ] );
			}
		}
		var chartId = config.divId,
		 chart = spqlib.bubblechart.chartImpl().drawBubbleChart( labels, series, config );
		$( '#headertabs ul li a' ).on(
			'click',
			function ( event, ui ) {
				var tabDivId = $( this ).attr( 'href' ),
					 t = $( tabDivId ).find(
						'.sparqlresultformat-bubblechart' );
				t.each( function () {
					var id = $( this ).attr( 'id' ),
						 c = spqlib.getById( id );
					if ( c ) {
						c.replot();
					}
				} );
			} );
		chart.toggleFullScreen = my.toggleFullScreen;
		spqlib.addToRegistry( chartId, chart );
	};

	return my;
}() );
