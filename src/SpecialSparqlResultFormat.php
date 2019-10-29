<?php
class SpecialSparqlResultFormat extends SpecialPage {

	public function __construct() {
		parent::__construct( 'SparqlResultFormat', '' );
	}

	public function execute( $par ) {
		$this->setHeaders();
		$this->outputHeader();

		$output = $this->getOutput();
		$output->addHTML( "<style>
			.ui-widget-header {
				border:none !important;
				border-bottom: 1px solid #aaaaaa !important;
			}
			
			span.mandatory-True {
				font-weight: bold;
			}
			
			.ui-widget-content{
				border:none !important;
			}
			h2 {
				font-weight:bold;
			}
			.indent {
				padding-left:50px;
			}
			.ii-sprf-badge{
				display: inline-block;
				min-width: 10px;
				padding: 3px 7px;
				font-size: x-small;
				font-weight: 300;
				
				line-height: 1;
				vertical-align: baseline;
				white-space: nowrap;
				text-align: center;
				border-radius: 4px;
			} 
			
			.ii-sprf-since-badge {
				background-color: #236b9b;
				color: #ffffff;
			}
			
			.ii-sprf-deprecated-badge {
				background-color: #ffc800;
				color: #000000;
			}
			
		</style>" );

		$formats = array(
			"table" => new SparqlResultFormatTable,
			"csv" => new SparqlResultFormatCSV,
			"piechart" => new SparqlResultFormatPieChart,
			"donutchart" => new SparqlResultFormatDonutChart,
			"barchart" => new SparqlResultFormatBarChart,
			"bubblechart" => new SparqlResultFormatBubbleChart,
			"treemap" => new SparqlResultFormatTreemap,
			"graph" => new SparqlResultFormatGraph,
			"text" => new SparqlResultFormatText
		);
		//tab
		$output->addHTML("<h1>".wfMessage("sprf.common.step1")."</h1>");
		$localSettingsExample = " ".'$wgSparqlEndpointDefinition'."['<b>&lt;endpoint name&gt;</b>'] = array(
			<div class='indent'>'url' =>'<b>&lt;endpoint url&gt;</b>',
			<div>'basicAuth' => array( /*optional*/</div>
			<div class='indent'>	'user' => '<b>&lt;basic auth user&gt;</b>',</div>
			<div class='indent'>	'password' => '<b>&lt;basic auth password&gt;</b>'</div>
			<div>),</div>
			<div></div>
			<div>'connectionTimeout' => 0, /*in seconds*/</div>
		<div>'requestTimeout' => 30,/*in seconds*/</div>
		<div>'verifySSLCertificate' => false, /*to disable server certificate verification*/</div>
			<div>'prefixes' => array( /*optional*/</div>
					<div class='indent'>'skos' => 'http://www.w3.org/2004/02/skos/core#',</div>
					<div class='indent'>'foaf' => 'http://xmlns.com/foaf/0.1/',</div>
					<div class='indent'>'rdf' => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',</div>
					<div class='indent'>'rdfs' => 'http://www.w3.org/2000/01/rdf-schema#',</div>
					<div class='indent'>'owl' => 'http://www.w3.org/2002/07/owl#',</div>
					<div class='indent'>'<b>&lt;prefix&gt;</b>' => '<b>&lt;namespace&gt;</b>',</div>
					<div class='indent'>...</div>
				<div>)</div>
				</div>
			<div>);</div>
			";

		$output->addHTML( $localSettingsExample );
		$output->addHTML( "<div>" . wfMessage( "sprf.common.step1.explain" ) . "</div>" );

		$output->addHTML( "<h1>" . wfMessage( "sprf.common.step2" ) . "</h1>" );

		$output->addHTML( "<div id='tabs'>" );
		$output->addHTML( "<ul>" );
		foreach ( $formats as $key => $value ) {
			$formatName = $value->getName();
			$output->addHTML( "<li><a href='#$key'>$formatName</a></li>" );
		}
		$output->addHTML( "</ul>" );

		foreach ( $formats as $key => $value ) {
			$formatName = $value->getName();
			$output->addHTML( "<div id='$key'><h1 style='background: #cbc8c8; padding: 5px; border-radius: 5px;'>$formatName</h1>" );
			$output->addHTML( "<h2>" . wfMessage( "sprf.common.description" ) . "</h2>" );
			$desc = $value->getDescription();
			$output->addHTML( "<div class='description'>$desc</div>" );
			$output->addHTML( "<h2>" . wfMessage( "sprf.common.usage" ) . "</h2>" );
			$usage = wfMessage( "sprf.format.$key.usage" );
			$output->addHTML( "<div class='usage'>$usage</div>" );
			$output->addHTML( "<h2>" . wfMessage( "sprf.common.parameters" ) . "</h2>" );
			$this->paramDefinitionToHtml( $output, $value );
			$queryStructure = $value->getQueryStructure();
			if ( !empty( $queryStructure ) ) {
				$output->addHTML( "<h2>" . wfMessage( "sprf.common.queryStructure" ) . "</h2>" );
				$output->addHTML( "<div class='query-structure'>$queryStructure</div>" );
			}
			$output->addHTML( "</div>" );
		}
		$output->addHTML( "</div><!--chiusura tabs div -->" );

		$output->addHTML( "<script type='text/javascript'>
			$(function() {
				mw.loader.using('jquery.ui.tabs',function(){
					$('#tabs').tabs();
				});
			  });
		</script>" );
	}

	private function paramDefinitionToHtml( $output, $format ) {
		$params = $format->getParams();
		$complexTypes=$format->getComplexTypes();
		//$output->addHTML(print_r($complexTypes,true));
		$this->printParamTable( $output, $params,$complexTypes );

		$extra = $format->getExtraOptions();
		if ( is_array( $extra ) && count( $extra ) > 0 ) {
			$output->addHTML( "<h2>" . wfMessage( "sprf.special.extra.options" ) . "</h2>" );
			$this->printParamTable( $output, $extra,$complexTypes );
		}
	}

	private function printParamTable( $output, $data,$complexTypes ) {
		$header = ( "<tr><th>" . wfMessage( "sprf.special.parameter.name" ) . "</th><th>" . wfMessage( "sprf.special.parameter.description" ) . "</th>
		<th>" . wfMessage( "sprf.special.parameter.mandatory" ) . "</th><th>" . wfMessage( "sprf.special.parameter.default" ) . "</th><th>" . wfMessage( "sprf.special.parameter.example" ) . "</th></tr>" );
		$rows = "";
		foreach ( $data as $key => $value ) {
			$description = $value['description'];
			$since = isset($value['since']) ? $value['since'] : false;
			$useComplexType=isset($value['useComplexType']) ? $value['useComplexType'] : null;
			$mandatory = isset( $value['mandatory'] ) ? ( $value['mandatory'] == true ? "True" : "False" ) : "False";
			$default = isset( $value['default'] ) ? $value['default'] : "";
			$example = isset( $value['example'] ) ? $value['example'] : "";
			$deprecated = isset( $value['deprecated'] ) ? $value['deprecated'] : false;
			$rows .= "<tr><td> $key ". ($deprecated ? "<span class='ii-sprf-badge ii-sprf-deprecated-badge'>".wfMessage( "sprf.special.parameter.deprecated")."</span>" : "")." ". ($since!=false ? "<span class='ii-sprf-badge ii-sprf-since-badge'>".wfMessage( "sprf.special.parameter.since",$since )."</span>" : "") 
			."</td><td>$description ".$this->generateParametersTable($complexTypes,$useComplexType)."</td><td>"
			."<span class='mandatory-$mandatory'>$mandatory</span></td><td>$default</td><td>$example</td></tr>";
		}
		$output->addHTML( "<table class='wikitable'><tbody>$header$rows</tbody></table>" );
	}
	
	private function generateParametersTable($paramsList,$cpName){
		
		if (is_null($cpName) || empty($cpName)){
			return "";
		}
		$rows = "";
		$name = $cpName[0];
		$data = $paramsList[$name];
		$header = ( "<tr><th>" . wfMessage( "sprf.special.parameter.name" ) . "</th><th>" . wfMessage( "sprf.special.parameter.description" ) . "</th>
		<th>" . wfMessage( "sprf.special.parameter.mandatory" ) . "</th><th>" . wfMessage( "sprf.special.parameter.default" ) . "</th><th>" . wfMessage( "sprf.special.parameter.example" ) . "</th></tr>" );
		
		foreach ( $data as $key => $value ) {
			$description = $value['description'];
			$since = isset($value['since']) ? $value['since'] : false;
			$mandatory = isset( $value['mandatory'] ) ? ( $value['mandatory'] == true ? "True" : "False" ) : "False";
			$default = isset( $value['default'] ) ? $value['default'] : "";
			$example = isset( $value['example'] ) ? $value['example'] : "";
			$deprecated = isset( $value['deprecated'] ) ? $value['deprecated'] : false;
			$rows .= "<tr><td> $key ". ($deprecated ? "<span class='ii-sprf-badge ii-sprf-deprecated-badge'>".wfMessage( "sprf.special.parameter.deprecated")."</span>" : "")." ". ($since!=false ? "<span class='ii-sprf-badge ii-sprf-since-badge'>".wfMessage( "sprf.special.parameter.since",$since )."</span>" : "") 
			."</td><td>$description </td><td>"
			."<span class='mandatory-$mandatory'>$mandatory</span></td><td>$default</td><td>$example</td></tr>";
		}
		return "<table class='wikitable'><tbody>$header$rows</tbody></table>";
		
	}

}
