<?php

class SparqlResultFormatTreemap extends SparqlResultFormatBase implements SparqlFormat{
	
	function __construct() {
		
		$this->name = wfMessage("sprf.format.treemap.title");
		$this->description = wfMessage("sprf.format.treemap.description");
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
				"rootElement" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.rootElement")
				),
				"leavesLinkPattern" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.leavesLinkPattern")
				),
				"openLinkOnLeaves" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.openLinkOnLeaves")
				)
	   );
	   $this->queryStructure = wfMessage("sprf.format.treemap.query.structure");
	}
	function generateHtmlContainerCode($options){
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle = $this->getParameterValue($options,'divStyle',''); //isset($options['divStyle']) ? $options['divStyle'] : '';
		$divCssClass = $this->getParameterValue($options,'divCssClass','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery',''); //$options['sparqlEscapedQuery'];
		$htmlContainer = "<div id='$divId-container' style='$divStyle' class='$divCssClass'>
			<div id='$divId' style='width:100%; height:100%;' class='d3-treemap' sparql-query='$escapedQuery'></div>
				<div id='tooltip-treemap' class='hidden' <p><strong id='heading'></strong></p>
				<p><span id='tooltip-text'></span></p>
				</div>
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
             mw.loader.using( 'ext.SparqlResultFormat.treemap', function () {
                      spqlib.sparql2Treemap(config);
              } );
        } );";
		return $launchScript;
	}
	
	
	function generateConfig($options){
		global $wgSparqlEndpointDefinition;
		global $wgScriptPath;
		$endpointName = $options['sparqlEndpoint'];
		$endpointData = $wgSparqlEndpointDefinition[$endpointName];
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = empty($endpointData['basicAuthString']) ? '' : $endpointData['basicAuthString'] ;		
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle = $this->getParameterValue($options,'divStyle','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery','');
		$spinnerImagePath = $this->getParameterValue($options,'spinnerImagePath',"$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif");
		
		$divCssClass = $this->getParameterValue($options,'divCssClass',''); //$options['divCssClass'];
		$divCssClassFullScreen = $this->getParameterValue($options,'divCssClassFullScreen','');  //$options['divCssClassFullScreen'];
		$rootElement = $this->getParameterValue($options,'rootElement','');
		$leavesLinkPattern = $this->getParameterValue($options,'leavesLinkPattern','');
		$openLinkOnLeaves =  $this->getParameterValue($options,'openLinkOnLeaves','false');
	
		
		$config = "var config = {};
			config.divId = '$divId';
			config.endpoint='$endpoint';
			config.sparql=$('#$divId').attr('sparql-query');
			config.queryPrefixes=prefixes;
			config.basicAuthBase64String='$basicAuthBase64String';
			config.spinnerImagePath='$spinnerImagePath';
			config.leavesLinkPattern='$leavesLinkPattern';
			config.rootElement='$rootElement';
			config.openLinkOnLeaves='$openLinkOnLeaves';

			
			";	
			
		return $config;
	}
	
	/*function generateContainer($options){
		$divId = $options['divId'];
		$divStyle = isset($options['divStyle']) ? $options['divStyle'] : '';
		$divCssClass = isset($options['divCssClass']) ? $options['divCssClass'] : '';
		$escapedQuery = $options['sparqlEscapedQuery'];
		$htmlContainer = "<div id='$divId-container' style='$divStyle' class='$divCssClass'>
			<div id='$divId' style='width:100%; height:100%;' class='d3-treemap' sparql-query='$escapedQuery'></div>
				<div id='toooltip-treemap' class='hidden' <p><strong id='heading'></strong></p>
				<p><span id='tooltip-text'></span></p>
				</div>
			</div>";
		return $htmlContainer;
		
	}*/
	
	
	
}
?>