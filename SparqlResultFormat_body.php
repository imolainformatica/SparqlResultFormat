<?php
use SMW\Exporter\Escaper;

class ExtSparqlResultFormat {

	// The prefix and suffix for the widget strip marker.
	private static $markerPrefix = "START_SPARQL_II";
	private static $markerSuffix = "END_SPARQL_II";

	// Must be public for use in anonymous callback function in PHP 5.3
	public static $elements = array();

	public static function sparql2FormatTemplate( $parser, $options_array, $format ) {
		global $wgSparqlEndpointDefinition;
		# parsing options array
		$options = self::extractOptions( $options_array );

		# getting endpoint data defined in localsettings
		$endpointData = $wgSparqlEndpointDefinition[$options['sparqlEndpoint']];
		# generating code for prefixes array
		$prefixes = $endpointData['prefixes'];
		$javascriptPrefixesArray = self::createJavascriptPrefixesArray( $prefixes );

		# format specific code
		try {
			$js = $format->generateJavascriptCode( $options, $javascriptPrefixesArray );
			$html = $format->generateHtmlContainerCode( $options );

			# composing output code
			$output = self::composeOutputScript( $js, $html );
		} catch ( Exception $e ) {
			$output = "<div class='error'>Error:" . $e->getMessage() . "</div>";
		}

		// To prevent the widget output from being tampered with, the
		// compiled HTML is stored and a strip marker with an index to
		// retrieve it later is returned.
		$index = array_push( self::$elements, $output ) - 1;
		return self::$markerPrefix . '-' . $index . self::$markerSuffix;
	}

	public static function sparql2table( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatTable;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function sparql2graph( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatGraph;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function sparql2treemap( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatTreemap;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function sparql2donutchart( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatDonutChart;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function sparql2barchart( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatBarChart;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function sparql2piechart( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatPieChart;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function sparql2bubblechart( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatBubbleChart;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function sparql2csv( $parser ) {
		$options_array = array_slice( func_get_args(), 1 );
		$format = new SparqlResultFormatCSV;
		return self::sparql2FormatTemplate( $parser, $options_array, $format );
	}

	public static function extractOptions( array $options ) {
		$results = array();

		foreach ( $options as $option ) {
			$pair = explode( '=', $option, 2 );
			if ( count( $pair ) === 2 ) {
				$name = trim( $pair[0] );
				$value = trim( $pair[1] );
				if ( isset( $results[$name] ) ) {
					if ( is_Array( $results[$name] ) ) { // array già creato
						array_push( $results[$name], $value );
					} else {
						$oldVal = $results[$name];
						$results[$name] = array();
						array_push($results[$name],$oldVal);
						array_push($results[$name],$value);
					}
				} else {
					$results[$name] = $value;
				}
			}

			if ( count( $pair ) === 1 ) {
				$name = trim( $pair[0] );
				$results[$name] = true;
			}
		}
		// Now you've got an array that looks like this:
		// [foo] => "bar"
		// [apple] => "orange"
		// [banana] => true

		return $results;
	}

	public static function page2uri( $parser ) {
		global $smwgNamespace;
		$options_array = array_slice( func_get_args(), 1 );
		if ( is_array( $options_array ) ) {
			$pageName = $options_array[0];
		} else {
			return "<div class='error'>Error: you must specify the page name/div>";
		}
		if ( class_exists( "SMW\Exporter\Escaper" ) ) {
			$esc = Escaper::encodeUri( urlencode( str_replace( ' ', '_', $pageName ) ) );
		} else {
			return "<div class='error'>Error: Cannot find Escaper class. Is SemanticMediaWiki extension installed?/div>";
		}
		return $smwgNamespace . $esc;
	}

	public static function smwSparqlDefaultGraph( $parser ) {
		global $smwgSparqlDefaultGraph;
		if ( isset( $smwgSparqlDefaultGraph ) ) {
			return $smwgSparqlDefaultGraph;
		}
		return 'Error: no $smwgSparqlDefaultGraph variable definition';
	}

	public static function outputHtml( &$out, &$text ) {
		$text = preg_replace_callback(
			'/' . self::$markerPrefix . '-(\d+)' . self::$markerSuffix . '/S',
			function ( $matches ) {
				// Can't use self:: in an anonymous function pre PHP 5.4
				return ExtSparqlResultFormat::$elements[$matches[1]];
			},
			$text
		);
		return true;
	}

	public static function createJavascriptPrefixesArray( $prefixes ) {
		$res = "var prefixes = [];";
		if (is_array($prefixes)){
			foreach ( $prefixes as $key => &$val ) {
				$res .= " prefixes.push({pre:'$key',ns:'$val'});";
			}
		}
		return $res;
	}
	public static function composeOutputScript( $javascript, $html ) {
		$output = " <script type=\"text/javascript\">
				$javascript
			</script>
			$html";
		return $output;
	}
}
