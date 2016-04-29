<?php

class SparqlResultFormatHooks {

	/**
	 * @param $parser Parser
	 * @return bool
	 */
	public static function onParserFirstCallInit( $parser ) {

		// These functions accept DOM-style arguments
		$parser->setFunctionHook( 'sparql2table', 'ExtSparqlResultFormat::sparql2table' );
		$parser->setFunctionHook( 'sparql2graph', 'ExtSparqlResultFormat::sparql2graph' );
		$parser->setFunctionHook( 'sparql2treemap', 'ExtSparqlResultFormat::sparql2treemap'  );
		$parser->setFunctionHook( 'sparql2donutchart', 'ExtSparqlResultFormat::sparql2donutchart' );
		$parser->setFunctionHook( 'sparql2barchart', 'ExtSparqlResultFormat::sparql2barchart' );
		$parser->setFunctionHook( 'sparql2piechart', 'ExtSparqlResultFormat::sparql2piechart' );
		$parser->setFunctionHook( 'sparql2bubblechart', 'ExtSparqlResultFormat::sparql2bubblechart' );
		$parser->setFunctionHook( 'sparql2csv', 'ExtSparqlResultFormat::sparql2csv' );

		return true;
	}
	
	public static function outputHtml(&$out, &$text){
		return ExtSparqlResultFormat::outputHtml($out, $text);
	}
}
