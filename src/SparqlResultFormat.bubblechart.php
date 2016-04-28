<?php

class SparqlResultFormatBubbleChart extends SparqlResultFormatBase implements SparqlFormat{
	
	function __construct() {
		
		$this->name = wfMessage("sprf.format.bubblechart.title");
		$this->description = wfMessage("sprf.format.bubblechart.description");
       $this->params = array(
			"divId" => array(
					"mandatory" => true,
					"description" => ""
				),
			"sparqlEndpoint" => array(
					"mandatory" => true,
					"description" => ""
				),
			"sparqlEscapedQuery" => array(
					"mandatory" => true,
					"description" => ""
				),
			"divStyle" => array(
					"mandatory" => false,
					"description" => ""
				),
			"spinnerImagePath" => array(
					"mandatory" => false,
					"description" => ""
				),
			"divCssClass" => array(
					"mandatory" => false,
					"description" => ""
				),
			"divCssClassFullScreen" => array(
					"mandatory" => false,
					"description" => ""
				),
			"extraOption" => array(
				"mandatory" => false,
				"description" => ""
			),
	   );
	   
	    $this->extraOpts = array(
			"chart.title" => array(
					"description" => wfMessage("sprf.options.chart.title"),
					"default" => "",
					"example" => "|extraOption=sprf.options.chart.title:New title"
				),
				"chart.axis.x.label" => array(
					"description" => wfMessage("sprf.options.chart.axis.x.label"),
					"default" => "",
					"example" => ""
				),
				"chart.axis.y.label" => array(
					"description" => wfMessage("sprf.options.chart.axis.y.label"),
					"default" => "",
					"example" => ""
				),
				"chart.axis.x.label.font.size" => array(
					"description" => wfMessage("sprf.options.chart.axis.x.label"),
					"default" => "14pt",
					"example" => "|extraOption=chart.axis.x.label.font.size:20pt"
				),
				"chart.axis.y.label.font.size" => array(
					"description" => wfMessage("sprf.options.chart.axis.y.label.font.size"),
					"default" => "14pt",
					"example" => "|extraOption=chart.axis.y.label.font.size:20pt"
				),
				"chart.axis.x.font.size" => array(
					"description" => wfMessage("sprf.options.chart.axis.x.font.size"),
					"default" => "10pt",
					"example" => "|extraOption=chart.axis.x.font.size:14pt"
				),
				"chart.axis.y.font.size" => array(
					"description" => wfMessage("sprf.options.chart.axis.y.font.size"),
					"default" => "10pt",
					"example" => "|extraOption=chart.axis.y.font.size:14pt"
				),
				"chart.legend.column.asset" => array(
					"description" => wfMessage("sprf.options.chart.legend.column.asset"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.legend.column.radius" => array(
					"description" => wfMessage("sprf.options.chart.legend.column.radius"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.legend.show" => array(
					"description" => wfMessage("sprf.options.chart.legend.show"),
					"default" => "true",
					"example" => "|extraOption=chart.legend.show:false"
				),
				"chart.tooltip.x.label" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.x.label"),
					"default" => "",
					"example" => "|extraOption=chart.tooltip.x.label:"
				),
				"chart.tooltip.y.label" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.y.label"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.tooltip.r.label" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.r.label"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.legend.show" => array(
					"description" => wfMessage("sprf.options.chart.legend.show"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.tooltip.asset.label.pattern" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.asset.label.pattern"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.tooltip.asset.link.show" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.asset.link.show"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.tooltip.asset.label.link.pattern" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.asset.label.link.pattern"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.tooltip.x.value.pattern" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.x.value.pattern"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.tooltip.y.value.pattern" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.y.value.pattern"),
					"default" => "",
					"example" => "|extraOption="
				),
				"chart.tooltip.r.value.pattern" => array(
					"description" => wfMessage("sprf.options.chart.tooltip.r.value.pattern"),
					"default" => "",
					"example" => "|extraOption="
				)
	   );
	   
	}
	
	
	function generateHtmlContainerCode($options){
		$divId = $this->getParameterValue($options,'divId',''); //$options['divId'];
		$divStyle = $this->getParameterValue($options,'divStyle',''); //isset($options['divStyle']) ? $options['divStyle'] : '';
		$divCssClass = $this->getParameterValue($options,'divCssClass','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery',''); //$options['sparqlEscapedQuery'];
		$htmlContainer = "
		<div style='position: absolute; z-index: 99; left: 0px; top: 0px; display: none;' id='tooltip1b' class='jqplot-highlighter-tooltip'></div>
		<div id='$divId-container' style='$divStyle' class='$divCssClass'>
			<div id='$divId' style='width:100%; height:100%;' sparql-query='$escapedQuery'></div>
			<div id='$divId-legend' class='legend-table-container'></div>
			</div>";
		return $htmlContainer;
	}
	
	function generateJavascriptCode($options,$prefixes){
		$config = $this->generateConfig($options);
		$launch= $this->generateLaunchScript($options);
		$output = "$(document).ready(function(){
				$prefixes
				$config
				$launch
			});";
		return $output;	
	}
	
	function generateLaunchScript($options){
		$launchScript = "mw.loader.using( ['ext.SparqlResultFormat.main'], function () {
             mw.loader.using( 'ext.SparqlResultFormat.bubblechart', function () {
                      spqlib.sparql2BubbleChart(config);
              } );
        } );";
		return $launchScript;
	}
	
	
	function generateConfig($options){
		global $wgSparqlEndpointDefinition;
		global $wgScriptPath; 
		$endpointName = $this->getParameterValue($options,'sparqlEndpoint','');
		$endpointData = $wgSparqlEndpointDefinition[$endpointName];
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = empty($endpointData['basicAuthString']) ? '' : $endpointData['basicAuthString'] ;		
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle = $this->getParameterValue($options,'divStyle','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery',''); //$options['sparqlEscapedQuery'];
		$spinnerImagePath = $this->getParameterValue($options,'spinnerImagePath',"$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif");
		
		$divCssClass = $this->getParameterValue($options,'divCssClass','');
		$divCssClassFullScreen = $this->getParameterValue($options,'divCssClassFullScreen','');
		
		
		$extraOption = $this->getParameterValue($options,'extraOption','');
		$this->checkExtraOptions($extraOption);
		$extraOptionString = implode("||", $extraOption);		
		
		$config = "var config = {};
			config.divId = '$divId';
			config.endpoint='$endpoint';
			config.sparql=$('#$divId').attr('sparql-query');
			config.queryPrefixes=prefixes;
			config.basicAuthBase64String='$basicAuthBase64String';
			config.spinnerImagePath='$spinnerImagePath';
			config.extraOptionsString='$extraOptionString';";	
			
		return $config;
	}

	
	
	
}
?>