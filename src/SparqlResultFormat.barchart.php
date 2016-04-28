<?php

class SparqlResultFormatBarChart extends SparqlResultFormatBase implements SparqlFormat{
	
		function __construct() {
			
		$this->name = wfMessage("sprf.format.barchart.title");
		$this->description = wfMessage("sprf.format.barchart.description");
       $this->params = array(
			"divId" => array(
					"mandatory" => true,
					"description" => wfMessage("sprf.param.divId")
				),
			"sparqlEndpoint" => array(
					"mandatory" => true,
					"description" => wfMessage("sprf.param.sparqlEndpoint")
				),
			"sparqlEscapedQuery" => array(
					"mandatory" => true,
					"description" => wfMessage("sprf.param.sparqlEscapedQuery")
				),
			"divStyle" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.divStyle")
				),
			"spinnerImagePath" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.spinnerImagePath")
				),
			"divCssClass" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.divCssClass")
				),
			"divCssClassFullScreen" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.divCssClassFullScreen")
				),
			"seriesConfiguration" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.seriesConfiguration"),
					"example" =>  wfMessage("sprf.param.seriesConfiguration.example")
				),
			"extraOption" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.extraOption")
				)
		
	   );
	   
	   $this->extraOpts = array(
			"chart.title" => array(
					"description" => wfMessage("sprf.options.chart.title"),
					"default" => "",
					"example" => "|extraOption=sprf.options.chart.title:New title"
				),
				"chart.direction" => array(
					"description" => wfMessage("sprf.options.chart.direction"),
					"default" => "vertical",
					"example" => "|extraOption=chart.direction:horizontal"
				),
				"chart.bar.width" => array(
					"description" => wfMessage("sprf.options.chart.bar.width"),
					"default" => "",
					"example" => "|extraOption=chart.bar.width:10"
				),
				"chart.bar.margin" => array(
					"description" => wfMessage("sprf.options.chart.bar.margin"),
					"default" => "8",
					"example" => "|extraOption=chart.bar.margin:10"
				),
				"chart.bar.padding" => array(
					"description" => wfMessage("sprf.options.chart.bar.padding"),
					"default" => "10",
					"example" => "|extraOption=chart.bar.margin:10"
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
				"chart.axis.x.angle" => array(
					"description" => wfMessage("sprf.options.chart.axis.x.angle"),
					"default" => "-30",
					"example" => "|extraOption=chart.axis.x.angle:-20"
				),
				"chart.axis.y.angle" => array(
					"description" => wfMessage("sprf.options.chart.axis.y.angle"),
					"default" => "0",
					"example" => "|extraOption=chart.axis.y.angle:-20"
				),
				"chart.legend.show" => array(
					"description" => wfMessage("sprf.options.chart.legend.show"),
					"default" => "true",
					"example" => "|extraOption=chart.legend.show:false"
				),
				"chart.legend.location" => array(
					"description" => wfMessage("sprf.options.chart.legend.location"),
					"default" => "ne",
					"example" => "|extraOption=chart.legend.location:s"
				),
				"chart.height.automatic" => array(
					"description" => wfMessage("sprf.options.chart.height.automatic"),
					"default" => "false",
					"example" => "|extraOption=chart.height.automatic:true"
				),
				"chart.axis.label.max.length" => array(
					"description" => wfMessage("sprf.options.chart.height.automatic"),
					"default" => "15",
					"example" => "|extraOption=chart.axis.label.max.length:30"
				),
				
	   
	   );
    }
	
	
	function generateHtmlContainerCode($options){
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle =  $this->getParameterValue($options,'divStyle','');
		$divCssClass =  $this->getParameterValue($options,'divCssClass','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery','');
		$htmlContainer = "<div id='$divId-container' style='$divStyle' class='$divCssClass'>
			<div id='$divId' style='width:100%; height:100%;' sparql-query='$escapedQuery'></div></div>";
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
             mw.loader.using( 'ext.SparqlResultFormat.barchart', function () {
                      spqlib.sparql2BarChart(config);
              } );
        } );";
		return $launchScript;
	}
	
	
	function generateConfig($options){
		global $wgSparqlEndpointDefinition;
		global $wgScriptPath;
		$endpointName = $this->getParameterValue($options,'sparqlEndpoint','');
		$endpointData = $wgSparqlEndpointDefinition[$endpointName ];
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = empty($endpointData['basicAuthString']) ? '' : $endpointData['basicAuthString'] ;		
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle = $this->getParameterValue($options,'divStyle','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery','');
		$spinnerImagePath = $this->getParameterValue($options,'spinnerImagePath',"$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif");
		
		$divCssClass = $this->getParameterValue($options,'divCssClass',''); 
		$divCssClassFullScreen = $this->getParameterValue($options,'divCssClassFullScreen','');
		
		$seriesConfiguration = $this->getParameterValue($options,'seriesConfiguration','{}');
		
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
			config.divCssClass='$divCssClass';
			config.divCssClassFullScreen='$divCssClassFullScreen';
			config.seriesConfiguration=$seriesConfiguration;	
			config.extraOptionsString='$extraOptionString';";	
			
		return $config;
	}	
	
	
}
?>