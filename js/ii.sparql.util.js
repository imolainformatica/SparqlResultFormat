spqlib.util = ( function ( sparqljs ) {
	var my = {};

	/**
	 * aggiunge in testa i prefissi con i vari namespace
	 * in modo che non debbano essere ripetuti in ogni query
	 * @param {string} sparql
	 * @param {Object[]} prefixes - query prefixes
	 * @return {string} the query with prefixes
	 **/
	my.addPrefixes = function ( sparql, prefixes ) {
		var prefs = '',
			i,
			obj;
		if ( prefixes ) {
			for ( i = 0; i < prefixes.length; i++ ) {
				obj = prefixes[ i ];
				prefs += 'prefix ' + obj.pre + ':<' + obj.ns + '>\n';
			}
			return prefs + '\n' + sparql;
		} else {
			return sparql;
		}
	};

	my.htmlEncode = function ( value ) {
		// create a in-memory div, set it's inner text(which jQuery automatically encodes)
		// then grab the encoded contents back out.  The div never exists on the page.
		return $( '<div/>' ).text( value ).html();
	};

	my.htmlDecode = function ( value ) {
		// create a in-memory div, set it's inner text(which jQuery automatically encodes)
		// then grab the encoded contents back out.  The div never exists on the page.
		return $( '<div/>' ).html( value ).text();
	};

	my.cutLongLabel = function ( value, maxLength, maxWordLength ) {
		if ( !maxLength ) {
			maxLength = 30; // sparqlLib.CONSTANTS.DEFAULT_LABEL_MAX_LENGTH;
		}
		if ( value ) {
			value = this.splitLongWords( value, maxWordLength );
			if ( value.length > maxLength ) {
				return value.substring( 0, maxLength ) + '...';
			} else {
				return value;
			}
		}
	};

	my.splitLongWords = function ( value, maxWordLength ) {
		var words, i, n, j, a, b, res;
		if ( value ) {
			if ( !maxWordLength ) {
				maxWordLength = 12; // sparqlLib.CONSTANTS.DEFAULT_WORD_MAX_LENGTH;
			}
			words = value.split( ' ' );
			res = '';
			for ( i = 0; i < words.length; i++ ) {
				if ( words[ i ].length > maxWordLength ) {
					n = words[ i ].length / maxWordLength;
					a = words[ i ];
					b = '\n';
					for ( j = 0; j < n; j++ ) {
						a = [ a.slice( 0, maxWordLength * ( j + 1 ) + j ), b, a.slice( maxWordLength * ( j + 1 ) + j ) ].join( '' );
					}
					res += a + ' ';
				} else {
					res += words[ i ] + ' ';
				}
			}
			return res.trim();
		}
	};

	/**
	 * simple function for cloning objects
	 */
	my.cloneObject = function ( obj ) {
		var clone = {},
			i,
			j;
		for ( i in obj ) {
			if ( Array.isArray( obj[ i ] ) ) {
				clone[ i ] = [];
				for ( j = 0; j < obj[ i ].length; j++ ) {
					clone[ i ][ j ] = spqlib.util.cloneObject( obj[ i ][ j ] );
				}
			} else if ( typeof ( obj[ i ] ) === 'object' && obj[ i ] !== null ) {
				clone[ i ] = spqlib.util.cloneObject( obj[ i ] );
			} else {
				clone[ i ] = obj[ i ];
			}
		}
		if ( !i ) { // tipo semplice
			return obj;
		} else {
			return clone;
		}
	};

	/**
	 * effettua la chiamata asincrona all'endpoint sparql. al termine viene
	 * richiamata la funzione di callback passata come parametro
	 */
	my.doQuery = function query( endpointName, sparql, successCallback,
		configuration, preQueryCallback, failCallback, caller ) {
		var mime = 'application/sparql-results+json',
			queryTimeout = configuration.queryTimeout || 31000,
			basicAuthBase64String = configuration.basicAuthBase64String || false,
			jqxhr,
			idContainer,
			progressBar;
		/* if (configuration.format && configuration.format=="csv"){
		mime = "text/csv";
		} */
		// mettere loading
		if ( preQueryCallback && typeof preQueryCallback === 'function' ) {
			preQueryCallback( configuration );
		}

		jqxhr = $.ajax( {
			/* url:endpoint,*/
			url: '/extensions/SparqlResultFormat/api/query/index.php',
			type: 'POST',
			timeout: queryTimeout,
			beforeSend: function ( xhr ) {
				if ( basicAuthBase64String ) {
					xhr.setRequestHeader( 'Authorization', 'Basic ' + basicAuthBase64String );
				}
				xhr.setRequestHeader( 'Accept', mime );
			},
			data: {
				endpointName: endpointName,
				query: sparql
			}
		} ).done( function ( json ) {
			successCallback( json, configuration, caller );
		} ).fail( function ( jqXHR, textStatus, errorThrown ) {
			if ( textStatus === 'timeout' ) {
				textStatus = 'Timeout error - cannot load all the graph';
				// nascondo l'eventuale progress bar
				idContainer = configuration.divId + '-container';
				progressBar = $( '#' + idContainer ).next();
				progressBar.hide();
			}
			if ( failCallback && typeof failCallback === 'function' ) {
				failCallback( configuration, jqXHR, textStatus );
			}
		} ).always( function () {} );
		// Set another completion function for the request above
		jqxhr.always( function () {} );
	};

	/**
	 *
	 */
	my.generateErrorBox = function ( message ) {
		var html = "<div class='alert alert-danger' role='alert'><span class=' fas fa-exclamation' aria-hidden='true'></span><span class='sr-only'>Error:</span>" +
			message + '</div>';
		return html;
	};

	/**
	 *
	 */
	my.getSparqlFieldValue = function ( field ) {
		if ( field ) {
			return field.value;
		} else {
			return '';
		}
	};

	/**
	 *
	 */
	my.getSparqlFieldValueToNumber = function ( field ) {
		if ( field ) {
			return Number( field.value );
		} else {
			return '';
		}
	};

	/**
	 *
	 */
	my.sanitizeString = function ( string ) {
		// Lower case everything
		var res = string.toLowerCase();
		// Make alphanumeric (removes all other characters)
		// $string = preg_replace("/[^a-z0-9_\s-]/", "", $string);
		// Clean up multiple dashes or whitespaces
		// $string = preg_replace("/[\s-]+/", " ", $string);
		// Convert whitespaces and underscore to dash
		res = res.replace( ' ', '-' );
		res = res.replace( '_', '-' );
		return res;
	};

	/**
	 *
	 */
	my.formatString = function ( format, param, token ) {
		var formatted;
		if ( !token ) {
			token = '{%s}';
		}
		formatted = format.replace( token, param );
		return formatted;
	};

	/**
	 *
	 */
	my.parseExtraOptions = function ( config ) {
		if ( !config.extraOptions ) {
			config.extraOptions = {};
		}
		if ( config.extraOptionsString ) {
			config.extraOptions = spqlib.util.splitPropertySet( config.extraOptionsString );
		}
	};

	/**
	 *
	 */
	my.splitPropertySet = function ( str, propSep, keyValueSep ) {
		var array = str.split( propSep || '||' ),
			res = {},
			i,
			prop,
			kvsep = keyValueSep || ':',
			key,
			val,
			index;
		for ( i = 0; i < array.length; i++ ) {
			prop = array[ i ];
			index = prop.indexOf( kvsep );
			key = prop.substring( 0, index );
			val = prop.substring( index + 1 );
			res[ key ] = val;
		}
		return res;
	};

	/**
	 * splitta le query con N union in N query con una sola clausola in where
	 */
	my.splitQueryByUnion = function ( sparql ) {
		var parser = new sparqljs.Parser(),
			generator = new sparqljs.Generator(),
			query = parser.parse( sparql ),
			where = query.where[ 0 ],
			results = [],
			size,
			i,
			queryText;
		if ( where ) {
			if ( where.type === 'union' ) {
				size = where.patterns.length;
				for ( i = 0; i < size; i++ ) {
					query.where[ 0 ].patterns = [ query.where[ 0 ].patterns[ i ] ];
					queryText = generator.stringify( query );
					results.push( queryText );
					query = parser.parse( sparql );
				}
				return results;
			}
		}
		return [ sparql ];
	};

	/*
	 *converte il contenuto di una tabella html in formato csv
	 */
	my.exportTableToCSV = function ( table ) {

		var $rows = table.find( 'tr:has(td), tr:has(th)' ),

			// Temporary delimiter characters unlikely to be typed by keyboard
			// This is to avoid accidentally splitting the actual contents
			tmpColDelim = String.fromCharCode( 11 ), // vertical tab character
			tmpRowDelim = String.fromCharCode( 0 ), // null character

			// actual delimiter characters for CSV format
			colDelim = '";"',
			rowDelim = '"\r\n"',

			// Grab text from table into CSV formatted string
			csv = '"' + $rows.map( function ( i, row ) {
				var $row = $( row ),
					$cols = $row.find( 'td, th' );

				return $cols.map( function ( j, col ) {
					var $col = $( col ),
						text = $col.text();

					return text.replace( /"/g, '""' ); // escape double quotes

				} ).get().join( tmpColDelim );

			} ).get().join( tmpRowDelim )
				.split( tmpRowDelim ).join( rowDelim )
				.split( tmpColDelim ).join( colDelim ) + '"';

		// Data URI
		// csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent( csv );
		return csv;
	};

	return my;
}() );
