spqlib.csv = ( function () {
	/**
	* Entry point
	*/
	spqlib.sparql2CSV = function ( config ) {
		if ( !config.sparqlWithPrefixes && config.sparql && config.queryPrefixes ) {
			config.sparqlWithPrefixes = spqlib.util.addPrefixes( config.sparql, config.queryPrefixes );
		}
		$( '#' + config.divId + '-loader' ).show();
		$( '#' + config.divId + '-error-status' ).hide();
		this.util.doQuery( config.endpointName, config.sparqlWithPrefixes, spqlib.csv.render, config, false, spqlib.csv.fail );
	};

	var my = { };
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql.
	 */
	my.render = function ( json, config ) {
		$( '#' + config.divId + '-loader' ).hide();
		$( '#' + config.divId + '-error-status' ).hide();
		var csvAction = config.csvDownloadAction,
		 fileName = config.filename || 'export.csv',
		 csv = createCSVString( json, config ),
		 form = $( '#' + config.divId + '-form' );
		form.find( "input[name='csv_text']" ).attr( 'value', csv );
		form.find( "input[name='csv_file_name']" ).attr( 'value', fileName );
		form.submit();
	};

	my.fail = function ( config, jqXHR, textStatus ) {
		$( '#' + config.divId + '-loader' ).hide();
		$( '#' + config.divId + '-error-status' ).show();
	};

	function createCSVString( json, config ) {

		var sep = config.separator || ';',
		 head = json.head.vars,
		 data = json.results.bindings,
		 rowDelim = '\r\n',
		 str = '',
		 line = '';
		for ( var i = 0; i < head.length; i++ ) {
			var colonna = head[ i ],
			 label = mapColonnaToLabel( colonna, config );
			line += convertCell( label ) + sep;
		}
		line = line.slice( 0, -1 );
		str += line + rowDelim;
		for ( var i = 0; i < data.length; i++ ) {
			var line = '';
			for ( var j = 0; j < head.length; j++ ) {
				var colonna = head[ j ];
				line += convertCell( spqlib.util.getSparqlFieldValue( data[ i ][ colonna ] ) ) + sep;
			}
			line = line.slice( 0, -1 );
			str += line + rowDelim;
		}

		return str;
	}

	function mapColonnaToLabel( colonna, config ) {
		if ( config.headerMapping ) {
			if ( config.headerMapping[ colonna ] ) {
				return config.headerMapping[ colonna ];
			} else {
				return colonna;
			}
		}
		return colonna;
	}

	function convertCell( cell ) {
		return '"' + cell.replace( /"/g, '""' ) + '"';
	}

	return my;
}() );
