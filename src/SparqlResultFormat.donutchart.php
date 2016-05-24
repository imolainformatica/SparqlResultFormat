<?php

class SparqlResultFormatDonutChart extends SparqlResultFormatBase implements SparqlFormat{
	
		function __construct() {
			
		$this->name = wfMessage("sprf.format.donutchart.title");
		$this->description = wfMessage("sprf.format.donutchart.description");
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
			"extraOption" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.extraOption")
			),
	   );
	   
	   $this->extraOpts = array(
			"chart.title" => array(
					"description" => wfMessage("sprf.options.chart.title"),
					"default" => "",
					"example" => "|extraOption=chart.title:New Title"
				)
	   
	   );
	   $this->queryStructure = wfMessage("sprf.format.donutchart.query.structure").wfMessage("sprf.format.donutchart.query.structure.example");
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
		$register = $this->jsRegisterFunction($launch);
		$output = "$prefixes
				$config
				$register				
			";
		return $output;	
	}
	
	
	function generateLaunchScript($options){
		$launchScript = "config.sparql=$('#$divId').attr('sparql-query');
		mw.loader.using( ['ext.SparqlResultFormat.main'], function () {
             mw.loader.using( 'ext.SparqlResultFormat.donutchart', function () {
                      spqlib.sparql2DonutChart(config);
              } );
        } );";
		return $launchScript;
	}
	
	
	function generateConfig($options){
		global $wgScriptPath;
		$endpointIndex = $this->getParameterValue($options,'sparqlEndpoint','');
		$endpointData = $this->getSparqlEndpointByName($endpointIndex);
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = $this->getSparqlEndpointBasicAuthString($endpointData);		
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle = $this->getParameterValue($options,'divStyle','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery','');
		$spinnerImagePath = $this->getParameterValue($options,'spinnerImagePath',"$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif");
		
		$divCssClass = $this->getParameterValue($options,'divCssClass',''); 
		$divCssClassFullScreen = $this->getParameterValue($options,'divCssClassFullScreen','');
		
		$extraOption = $this->getParameterValue($options,'extraOption','');
		$this->checkExtraOptions($extraOption);
		if (is_array($extraOption)){
			$extraOptionString = implode("||", $extraOption);	
		} else {
			$extraOptionString = $extraOption;
		}		
		
		$config = "var config = {};
			config.divId = '$divId';
			config.endpoint='$endpoint';
			config.queryPrefixes=prefixes;
			config.basicAuthBase64String='$basicAuthBase64String';
			config.spinnerImagePath='$spinnerImagePath';
			config.divCssClass='$divCssClass';
			config.divCssClassFullScreen='$divCssClassFullScreen';
			config.extraOptionsString=\"$extraOptionString\";";	
			
		return $config;
	}	
	
	
}
?>