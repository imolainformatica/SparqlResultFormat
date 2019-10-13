spqlib.table = ( function () {
	/**
	* Entry point
	*/
	spqlib.sparql2Table = function ( config ) {
		if ( !config.sparqlWithPrefixes && config.sparql && config.queryPrefixes ) {
			config.sparqlWithPrefixes = spqlib.util.addPrefixes( config.sparql, config.queryPrefixes );
		}
		this.util.doQuery( config.endpoint, config.endpointName, config.sparqlWithPrefixes, spqlib.table.renderTable, config, spqlib.table.preQuery, spqlib.table.failQuery );
	};

	var my = { };

	my.preQuery = function ( configuration ) {
		if ( configuration.spinnerImagePath ) {
			$( '#' + configuration.divId ).html( "<img src='" + configuration.spinnerImagePath + "' style='vertical-align:middle;'>" );
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
	my.renderTable = function ( json, config ) {
		var head = json.head.vars,
		 data = json.results.bindings;
		// hide legend div
		$( '#' + config.divId + '-legend-container' ).hide();

	   if ( data.length == 0 ) {
			$( '#' + config.divId ).html( "<div class'warning'>" + config.noResultMessage + '</div>' );
			return;
	   }
	   var colTitles = config.columnTitles || config.columnConfiguration,
	    colTitleMapping = {};
	   if ( colTitles ) {
		   for ( var i = 0; i < colTitles.length; i++ ) {
			   colTitleMapping[ colTitles[ i ].queryField ] = {
				   label: colTitles[ i ].label,
				   showLink: colTitles[ i ].showLink,
				   cellValuePattern: colTitles[ i ].cellValuePattern,
				   cellLinkPattern: colTitles[ i ].cellLinkPattern
			   };
		   }
	   }

		// tableHeader
		var headers = [],
		 thead = '<thead>';
		for ( var i = 0; i < head.length; i++ ) {
			headers.push( head[ i ] );
			var mappedColumnInfo = mapColumnTitle( head[ i ], colTitleMapping ),
			 colTitle = '';
			if ( mappedColumnInfo == null ) {
				colTitle = head[ i ];
			} else {
				colTitle = mappedColumnInfo.label;
			}
			thead += '<th>' + colTitle + '</th>';
		}
		thead += '</thead>';

		// tableRows
		var tbody = '<tbody>';
		for ( var i = 0; i < data.length; i++ ) {
			var row = "<tr class='" + assignRowCssClass( i, config ) + "'>";
			for ( var j = 0; j < headers.length; j++ ) {
				var cellValue = '';
				if ( data[ i ][ headers[ j ] ] ) {
					cellValue = data[ i ][ headers[ j ] ].value;
				}
				var mappedColumnInfo = mapColumnTitle( headers[ j ], colTitleMapping ),
				 linkCellValue = '';
				if ( mappedColumnInfo ) {
					if ( mappedColumnInfo.showLink == 'true' ) {
						linkCellValue = getCellLinkValue( config, cellValue, mappedColumnInfo,data[ i ] );
					} else {
						linkCellValue = getCellValue( cellValue, mappedColumnInfo,config );
					}
				} else {
					linkCellValue = cellValue;
				}
				var cell = "<td class='" + assignCellCssClass( i, config ) + "'>" + linkCellValue + '</td>';
				row += cell;
			}
			row += '</tr>';
			tbody += row;
		}
		tbody += '</tbody>';
		var table = "<table class='" + config.tableClass + "'>" + thead + tbody + '</table>';
		$( '#' + config.divId ).html( table );
		var csvExport = config.csvExport == 'true';
		if ( spqlib.util.exportTableToCSV && csvExport ) {
			// aggiungo il link per l'export csv delle pagine
			var filename = config.csvFileName || 'export.csv',
			 label = config.csvLinkLabel || 'Export as CSV',
			 csvFormAction = config.csvFormAction,
			 formId = config.divId + '-form';
			if ( !csvFormAction ) {
				throw ( "csvFormAction vuota -> l'export pdf non funzionerà" );
			}
			var tableContainer = $( '#' + config.divId ).find( 'table' ),
			 exporter = $( "<span class='export-table-csv' table-container-id='" + config.divId + "'> </span>" )
					.html( "<a class='export'>" + label + "</a> \
					<form action='" + csvFormAction + "' method ='post' id='" + formId + "'> \
					<input type='hidden' id='csv_text' name='csv_text' /> \
					<input type='hidden' id='csv_file_name' name='csv_file_name' value='" + filename + "'/> \
					</form>" );
			exporter.insertBefore( tableContainer );
			exporter.on( 'click', function ( event ) {
				var divId = $( event.currentTarget ).attr( 'table-container-id' ),
				 table = $( '#' + divId ).find( 'table' ),
				 csv = spqlib.util.exportTableToCSV( table ),
				 form = $( '#' + formId );
				form.find( "input[id='csv_text']" ).val( csv );
				form.submit();

			} );
		}
		$( '#' + config.divId ).trigger( 'done' );
	};

	function getCellLinkValue( config, cellValue, columnConfiguration,rowData ) {

		var link = '';
		if ( columnConfiguration.cellLinkPattern ) {
			link = formatString( columnConfiguration.cellLinkPattern, cellValue,config,rowData );
		} else {
			link = cellValue;
		}
		var formattedCellValue = getCellValue( cellValue, columnConfiguration,config,rowData );
		return "<a href='" + spqlib.util.htmlEncode( link ).replace( /'/g, '&apos;' ) + "'>" + formattedCellValue + '</a>';
	}

	function getCellValue( cellValue, columnConfiguration,config,rowData ) {
		if ( columnConfiguration.cellValuePattern ) {
			return formatString( columnConfiguration.cellValuePattern, cellValue,config,rowData );
		}
		return cellValue;
	}

	function formatString( format, param,config,rowData ) {
		// {%n[<format>]@<locale>}
		var placeholderWithOtherField = /{%s\[.*\]}/gm;
		var otherFieldNameRegex = /(?<={%s\[).*(?=\])/gm;
		
		var regex = /{%n\[.*\](@[a-z-]+)?}/gm;
		var numberLocaleRegex = /(?<={%n\[.*]@).*(?=})/gm;
		var numberFormatRegex =  /(?<={%n\[).*(?=\])/gm;
		var output = format;
		 if (format.includes("{%s}")){
			output = output.replace( '{%s}', param );
		 }
		 //format= {%s[fds]} - {%s[dsfa]}
		 if (output.match(placeholderWithOtherField)){
			output = output.replace(placeholderWithOtherField,function(match,offset,str,rowData){
				var otherFieldNameRegex = /(?<={%s\[).*(?=\])/gm;
				var fieldName = otherFieldNameRegex.exec(match)[0];
				//devo recuperare il valore dell'altro campo e restituirlo
				return "XXXX";
				
			});
		 }
		 
		 if (output.match(regex)){
			 //devo formattare il numero
			 if (output.match(numberLocaleRegex)){
				var numberLocale=numberLocaleRegex.exec(output)[0];
				numeral.locale(numberLocale);
			 } else {
				numeral.locale(config.numberFormatDefaultLocale);
			 }			 
			
			var numberFormat = numberFormatRegex.exec(output)[0];
			var formattedNumber=numeral(param).format(numberFormat);
			output = output.replace(regex,formattedNumber);
			
		 }
		 return output;
	}

	

	function isEven( i ) {
		return ( i % 2 == 0 );
	}
	function assignRowCssClass( i, config ) {
		if ( isEven( i ) ) {
			if ( config.cssEvenRowClass ) {
				return config.cssEvenRowClass;
			}
		} else {
			if ( config.cssOddRowClass ) {
				return config.cssOddRowClass;
			}
		}
		return '';
	}

	function assignCellCssClass( i, config ) {
		if ( isEven( i ) ) {
			if ( config.cssEvenTdClass ) {
				return config.cssEvenTdClass;
			}
		} else {
			if ( config.cssOddTdClass ) {
				return config.cssOddTdClass;
			}
		}
		return '';
	}

	function mapColumnTitle( field, mapping ) {
		if ( !mapping ) {
			return null;
		} else {
			if ( mapping[ field ] ) {
				return mapping[ field ];
			} else {
				return null;
			}
		}
	}

	return my;
}() );
