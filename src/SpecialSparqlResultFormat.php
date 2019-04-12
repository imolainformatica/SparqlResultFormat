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
		</style>" );

		$formats = [
			"table" => new SparqlResultFormatTable,
			"csv" => new SparqlResultFormatCSV,
			"piechart" => new SparqlResultFormatPieChart,
			"donutchart" => new SparqlResultFormatDonutChart,
			"barchart" => new SparqlResultFormatBarChart,
			"bubblechart" => new SparqlResultFormatBubbleChart,
			"treemap" => new SparqlResultFormatTreemap,
			"graph" => new SparqlResultFormatGraph
		];
		// tab
		$output->addHTML( "<h1>" . wfMessage( "sprf.common.step1" ) . "</h1>" );
		$localSettingsExample = " " . '$wgSparqlEndpointDefinition' . "['<b>&lt;endpoint name&gt;</b>'] = array(
			<div class='indent'>'url' =>'<b>&lt;endpoint url&gt;</b>',
			<div>'basicAuth' => array( /*optional*/</div>
			<div class='indent'>	'user' => '<b>&lt;basic auth user&gt;</b>',</div>
			<div class='indent'>	'password' => '<b>&lt;basic auth password&gt;</b>'</div>
			<div>),</div>
			<div></div>
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
			$output->addHTML( "<div id='$key'>" );
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
		$this->printParamTable( $output, $params );

		$extra = $format->getExtraOptions();
		if ( is_array( $extra ) && count( $extra ) > 0 ) {
			$output->addHTML( "<h2>" . wfMessage( "sprf.special.extra.options" ) . "</h2>" );
			$this->printParamTable( $output, $extra );
		}
	}

	private function printParamTable( $output, $data ) {
		$header = ( "<tr><th>" . wfMessage( "sprf.special.parameter.name" ) . "</th><th>" . wfMessage( "sprf.special.parameter.description" ) . "</th>
		<th>" . wfMessage( "sprf.special.parameter.mandatory" ) . "</th><th>" . wfMessage( "sprf.special.parameter.default" ) . "</th><th>" . wfMessage( "sprf.special.parameter.example" ) . "</th></tr>" );
		$rows = "";
		foreach ( $data as $key => $value ) {
			$description = $value['description'];
			$mandatory = isset( $value['mandatory'] ) ? ( $value['mandatory'] == true ? "True" : "False" ) : "False";
			$default = isset( $value['default'] ) ? $value['default'] : "";
			$example = isset( $value['example'] ) ? $value['example'] : "";
			$deprecated = isset( $value['deprecated'] ) ? $value['deprecated'] : false;
			if ( $deprecated ) {
				$key = "<del>$key</del>";
				$description = "<del>$description</del>";
			}
			$rows .= "<tr><td> $key </td><td>$description</td><td><span class='mandatory-$mandatory'>$mandatory</span></td><td>$default</td><td>$example</td></tr>";
		}
		$output->addHTML( "<table class='wikitable'><tbody>$header$rows</tbody></table>" );
	}

}
