spqlib.barchart = ( function () {
	/**
	 * Entry point
	 */
	spqlib.sparql2BarChart = function ( config ) {
		if ( !config.sparqlWithPrefixes && config.sparql && config.queryPrefixes ) {
			config.sparqlWithPrefixes = spqlib.util.addPrefixes( config.sparql, config.queryPrefixes );
		}
		spqlib.util.parseExtraOptions( config );
		this.util.doQuery( config.endpointName, config.sparqlWithPrefixes, spqlib.barchart.render, config, spqlib.barchart.preQuery, spqlib.barchart.failQuery );
	};
	var my = {};
	my.DEFAULT_AXIS_LABEL_MAX_LENGTH = 15;
	my.chartImpl = function () {
		return spqlib.jqplot();
	};
	my.exportAsImage = function () {};
	my.toggleFullScreen = function ( graphId ) {
		var graphDiv = $( '#' + graphId + '-container' ),
			cssClass = this.config.divCssClass,
			cssClassFullScreen = this.config.divCssClassFullScreen;
		graphDiv.toggleClass( cssClass );
		graphDiv.toggleClass( cssClassFullScreen );
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
		$( '#' + config.divId ).html( '' );
		var head = json.head.vars,
			data = json.results.bindings;
		if ( !head || head.length < 2 ) {
			throw 'Too few fields in sparql result. Need at least 2 columns';
		}
		var fieldLabel = head[ 0 ],
			numSeries = head.length - 1,
			labels = [],
			series = [];
		for ( var i = 0; i < data.length; i++ ) {
			labels.push( spqlib.util.getSparqlFieldValue( data[ i ][ fieldLabel ] ) );
			for ( var j = 0; j < numSeries; j++ ) {
				if ( !series[ j ] ) {
					series[ j ] = [ data.length ];
				}
				series[ j ][ i ] = spqlib.util.getSparqlFieldValueToNumber( data[ i ][ head[ j + 1 ] ] );
			}
		}
		var chartId = config.divId,
			chart = spqlib.barchart.chartImpl().drawBarChart( labels, series, config );
		chart.toggleFullScreen = my.toggleFullScreen;
		spqlib.addToRegistry( chartId, chart );
		$( '#' + chartId ).trigger( 'done' );
	};
	my.defaultBarChartTooltipContent = function ( label, value, config, seriesIndex ) {
		var spanLabel = '',
			textLabel = '',
			labelPattern = config.seriesConfiguration[ seriesIndex ].assetPattern,
			linkPattern = config.seriesConfiguration[ seriesIndex ].assetLinkPattern,
			showLink = config.seriesConfiguration[ seriesIndex ].showLink,
			seriesLabel = config.seriesConfiguration[ seriesIndex ].label,
			valuePattern = config.seriesConfiguration[ seriesIndex ].valuePattern;
		if ( labelPattern ) {
			textLabel = spqlib.util.formatString( labelPattern, label );
		} else {
			textLabel = label;
		}
		if ( showLink === 'true' ) {
			var url = '#';
			if ( linkPattern ) {
				url = spqlib.util.formatString( linkPattern, label );
			}
			spanLabel = "<a href='" + url + "'>" + textLabel + '</a>';
		} else {
			spanLabel = textLabel;
		}
		value = ' ' + value;
		if ( valuePattern ) {
			value = spqlib.util.formatString( valuePattern, value, '{%d}' );
		}
		var html = "<span class='close' onclick='javascript:$(this).parent().hide();'><i class='far fa-times-circle' style='cursor: pointer;'></i></span><span class=\"jqplot-tooltip-label\">" + spanLabel + '</span></br>';
		html += '<span class="jqplot-tooltip-serie-label">' + seriesLabel + '</span>';
		html += '<span class="jqplot-tooltip-value">' + value + '</span>';
		return html;
	};
	return my;
}() );
