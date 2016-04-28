<?php
class SpecialSparqlResultFormat extends SpecialPage {
	
	public function __construct() {
		parent::__construct( 'SparqlResultFormat', '' );
	}
	
	
	public function execute( $par ) {
		$this->setHeaders();
		$this->outputHeader();
		
		$output = $this->getOutput();
		$output->addHTML("<style>
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
		</style>");
		
		$formats = array(
			"table" => new SparqlResultFormatTable,
			"csv" => new SparqlResultFormatCSV,
			"piechart" => new SparqlResultFormatPieChart,
			"donutchart" => new SparqlResultFormatDonutChart,
			"barchart" => new SparqlResultFormatBarChart,
			"bubblechart" => new SparqlResultFormatBubbleChart,
			"treemap" => new SparqlResultFormatTreemap,
			"graph" => new SparqlResultFormatGraph
		);
		//tab
		$output->addHTML("<div id='tabs'>");
		$output->addHTML("<ul>");
		foreach ($formats as $key => $value) {
			$formatName = $value->getName();
			$output->addHTML("<li><a href='#$key'>$formatName</a></li>");
		}
		$output->addHTML("</ul>");
		
		foreach ($formats as $key => $value) {
			$output->addHTML("<div id='$key'>");
			$output->addHTML("<h2>".wfMessage("sprf.common.description")."</h2>");
			$desc = $value->getDescription();
			$output->addHTML("<div class='description'>$desc</div>");
			$output->addHTML("<h2>".wfMessage("sprf.common.usage")."</h2>");
			$usage = wfMessage("sprf.format.$key.usage");
			$output->addHTML("<div class='usage'>$usage</div>");
			$output->addHTML("<h2>".wfMessage("sprf.common.parameters")."</h2>");
			$this->paramDefinitionToHtml($output,$value);
			$queryStructure = $value->getQueryStructure();
			if (!empty($queryStructure)){
				$output->addHTML("<h2>".wfMessage("sprf.common.queryStructure")."</h2>");
				$output->addHTML("<div class='query-structure'>$queryStructure</div>");
			}
			$output->addHTML("</div>");
		}
		$output->addHTML("</div><!--chiusura tabs div -->");
		
		$output->addHTML("<script type='text/javascript'>
			$(function() {
				mw.loader.using('jquery.ui.tabs',function(){
					$('#tabs').tabs();
				});
			  });
		</script>");		
	}
	
	private function paramDefinitionToHtml($output,$format){
		
		$params = $format->getParams();	
		$this->printParamTable($output,$params);
	
		$extra = $format->getExtraOptions();
		if (is_array($extra) && sizeof($extra)>0){
			$output->addHTML("<h2>".wfMessage("sprf.special.extra.options")."</h2>");
			$this->printParamTable($output,$extra);
		}
		
	}
	
	private function printParamTable($output,$data){
		$header = ("<tr><th>".wfMessage("sprf.special.parameter.name")."</th><th>".wfMessage("sprf.special.parameter.description")."</th>
		<th>".wfMessage("sprf.special.parameter.mandatory")."</th><th>".wfMessage("sprf.special.parameter.default")."</th><th>".wfMessage("sprf.special.parameter.example")."</th></tr>");
		$rows = "";
		foreach ($data as $key => $value) {
			$description = $value['description'];
			$mandatory = isset($value['mandatory']) ? ($value['mandatory']==true ? "True" : "False") : "False";
			$default = isset($value['default']) ? $value['default'] : "";
			$example = isset($value['example']) ? $value['example'] : "";
			$deprecated = isset($value['deprecated']) ? $value['deprecated'] : false;
			if ($deprecated){
				$key = "<del>$key</del>";
				$description = "<del>$description</del>";
			}
			$rows.="<tr><td> $key </td><td>$description</td><td><span class='mandatory-$mandatory'>$mandatory</span></td><td>$default</td><td>$example</td></tr>";
		}		
		$output->addHTML("<table class='wikitable'><tbody>$header$rows</tbody></table>");
		
	}
	
	
	
	
}


?>