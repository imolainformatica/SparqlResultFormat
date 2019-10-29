<?php
use SparqlResultFormat\SparqlClient;

class SparqlResultFormatText extends SparqlResultFormatBase implements SparqlFormat {

	function __construct() {
		$this->name = wfMessage( "sprf.format.text.title" );
		$this->description = wfMessage( "sprf.format.text.description" );

       $this->params = array(
			"sparqlEscapedQuery" => array(
					"mandatory" => true,
					"description" => wfMessage("sprf.param.sparqlEscapedQuery")
				),
			"sparqlEndpoint" => array(
				"mandatory" => true,
				"description" => wfMessage("sprf.param.sparqlEndpoint")
			),
			"fieldSeparator" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.text.fieldSeparator"),
				"default" => ","
			),
			"rowSeparator" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.text.rowSeparator"),
				"default" => "#"
			)		
	   );

		$this->queryStructure =	wfMessage("sprf.format.text.query.structure");
		$this->complexTypes = array();
	}

	function generateHtmlContainerCode( $options ) {
		return "";
	}

	function generateJavascriptCode( $options, $prefixes ) {
		return "";
	}

	function generateLaunchScript( $options ) {
		return "";
	}

	function generateConfig( $options ) {
		return "";
	}

	function sparql2text($options){

		try {
			$endpointName = $this->getParameterValue($options,'sparqlEndpoint');
			$endpointData = $this->getSparqlEndpointByName($endpointName);
			$query=$this->getParameterValue($options,'sparqlEscapedQuery');
			$fieldSeparator=$this->getParameterValue($options,'fieldSeparator');
			$rowSeparator=$this->getParameterValue($options,'rowSeparator');
			$client = new SparqlClient($endpointData['url']);
		
			$resp=$client->doQuery($query);
			if (isset($resp->returnCode)){
				if ($resp->returnCode==200){
					$obj=json_Decode($resp->responseBody,true);
					$headers=$obj['head']['vars'];
					$s = array();
					foreach ($obj['results']['bindings'] as $row) {
						$r = array();
						foreach ($headers as $col) {
							$val= $row[$col]['value'];
							/* Helper function that changes a URL string in such a way that it
	 * can be used in wikitext without being turned into a hyperlink,
	 * while still displaying the same characters. The use of
	 * &lt;nowiki&gt; is avoided, since the resulting strings may be
	 * inserted during parsing, after this has been stripped.
	 */
							$nval=str_replace( ':', '&#58;', $val );
							array_push($r,$nval);
						}
						array_push($s,$r);

					}
					$str = array();
					foreach ($s as $value) {
						array_push($str,implode($fieldSeparator,$value));
					}
					
					$output=implode($rowSeparator, $str);
					return  $output;
				} else {
					return "";
				}
			} else {
				return "";
			}
		} catch (Exception $ex){
			return "error".$ex->getMessage();
		}
	}

}
