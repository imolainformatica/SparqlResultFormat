<?php

class SparqlResultFormatGraph extends SparqlResultFormatBase implements SparqlFormat{
	
		function __construct() {
		$this->name = wfMessage("sprf.format.graph.title");
		$this->description = wfMessage("sprf.format.graph.description");
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
				"nodeConfiguration" => array(
					"mandatory" => false,
					"description" => ""
				),
			"edgeConfiguration" => array(
					"mandatory" => false,
					"description" => ""
				),
				"rootElement" => array(
					"mandatory" => false,
					"description" => ""
				),
				"rootElementColor" => array(
					"mandatory" => false,
					"description" => ""
				),
				"rootElementImage" => array(
					"mandatory" => false,
					"description" => ""
				),
				"showLegend" => array(
					"mandatory" => false,
					"description" => ""
				),
				"defaultNodeColor" => array(
					"mandatory" => false,
					"description" => ""
				),
				"defaultEdgeColor" => array(
					"mandatory" => false,
					"description" => ""
				),
				"splitQueryByUnion" => array(
					"mandatory" => false,
					"description" => ""
				),
				"minZoom" => array(
					"mandatory" => false,
					"description" => ""
				),
				"maxZoom" => array(
					"mandatory" => false,
					"description" => ""
				),
				"layout" => array(
					"mandatory" => false,
					"description" => ""
				),"layoutOptions" => array(
					"mandatory" => false,
					"description" => ""
				),
				"maxWordLength" => array(
					"mandatory" => false,
					"description" => ""
				),"maxLabelLength" => array(
					"mandatory" => false,
					"description" => ""
				),
				"nodeStyle" => array(
					"mandatory" => false,
					"description" => ""
				),
				"edgeStyle" => array(
					"mandatory" => false,
					"description" => ""
				),
				"labelLinkPattern" => array(
					"mandatory" => false,
					"description" => ""
				),
				"categoryLinkPattern" => array(
					"mandatory" => false,
					"description" => ""
				)
	   );       
	             
	   $extraOpts = array(
			"chart.title" => array(
					"description" => "",
					"default" => "",
					"example" => ""
				)
	   
	   );
    }
	
	
	function generateHtmlContainerCode($options){
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle =  $this->getParameterValue($options,'divStyle','');
		$divCssClass =  $this->getParameterValue($options,'divCssClass','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery','');
		$htmlContainer = "<div id='$divId-container' style='$divStyle' class='$divCssClass ii-graph-container'>
			<div id='$divId' class='cytoscape-graph' style='width:100%; height:100%;' sparql-query='$escapedQuery'></div></div>";
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
             mw.loader.using( 'ext.SparqlResultFormat.graph', function () {
                      spqlib.sparql2Graph(config);
              } );
        } );";
		return $launchScript;
	}
	
	
	function generateConfig($options){
		global $wgSparqlEndpointDefinition;
		global $wgScriptPath;
		global $wgServer;
		$endpointName = $this->getParameterValue($options,'sparqlEndpoint','');
		$endpointData = $wgSparqlEndpointDefinition[$endpointName ];
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = empty($endpointData['basicAuthString']) ? '' : $endpointData['basicAuthString'] ;		
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle = $this->getParameterValue($options,'divStyle','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery','');
		$spinnerImagePath = $this->getParameterValue($options,'spinnerImagePath',"$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif");
		
		$divCssClass = $this->getParameterValue($options,'divCssClass',''); 
		$nodeConfiguration = $this->getParameterValue($options,'nodeConfiguration','{}');
		$edgeConfiguration = $this->getParameterValue($options,'edgeConfiguration','{}');
		$rootElement = $this->getParameterValue($options,'rootElement','');
		$rootElementColor = $this->getParameterValue($options,'rootElementColor','');
		$rootElementImage = $this->getParameterValue($options,'rootElementImage','');
		$showLegend = $this->getParameterValue($options,'showLegend','true');
		$defaultNodeColor = $this->getParameterValue($options,'defaultNodeColor','#CCC');
		$defaultEdgeColor = $this->getParameterValue($options,'defaultEdgeColor','#CCC');
		$splitQueryByUnion = $this->getParameterValue($options,'splitQueryByUnion','false');
		$minZoom = $this->getParameterValue($options,'minZoom',1);
		$maxZoom = $this->getParameterValue($options,'maxZoom',1);
		$layout = $this->getParameterValue($options,'layout','dagre');
		$maxWordLength = $this->getParameterValue($options,'maxWordLength',12);
		$maxLabelLength = $this->getParameterValue($options,'maxLabelLength',30);
		$layoutOptions = $this->getParameterValue($options,'layoutOptions','{}');
		$nodeStyle  = $this->getParameterValue($options,'nodeStyle','{}');
		$edgeStyle = $this->getParameterValue($options,'edgeStyle','{}');
		$labelLinkPattern = $this->getParameterValue($options,'labelLinkPattern',"$wgServer$wgScriptPath/index.php/{%s}");
		$categoryLinkPattern = $this->getParameterValue($options,'categoryLinkPattern',"$wgServer$wgScriptPath/index.php/Category:{%s}");
		
		
		/*$extraOption = $this->getParameterValue($options,'extraOption','');
		if (is_array($extraOption)){
			$extraOptionString = implode("||", $extraOption);	
		} else {
			$extraOptionString = '';
		}*/
		
		$config = "var config = {};
			config.divId = '$divId';
			config.endpoint='$endpoint';
			config.sparql=$('#$divId').attr('sparql-query');
			config.queryPrefixes=prefixes;
			config.basicAuthBase64String='$basicAuthBase64String';
			config.spinnerImagePath='$spinnerImagePath';
			config.divCssClass='$divCssClass';
			config.nodeConfiguration=$nodeConfiguration;
			config.edgeConfiguration=$edgeConfiguration;
			config.rootElement='$rootElement';
			config.rootElementColor='$rootElementColor';
			config.rootElementImage='$rootElementImage';
			config.showLegend='$showLegend';
			config.defaultNodeColor='$defaultNodeColor';
			config.defaultEdgeColor='$defaultEdgeColor';
			config.splitQueryByUnion='$splitQueryByUnion';
			config.minZoom=$minZoom;
			config.maxZoom=$maxZoom;
			config.layout='$layout';
			config.maxWordLength=$maxWordLength;
			config.maxLabelLength=$maxWordLength;
			config.layoutOptions=$layoutOptions;
			config.nodeStyle=$nodeStyle;
			config.edgeStyle=$edgeStyle;
			config.labelLinkPattern='$labelLinkPattern';
			config.categoryLinkPattern='$categoryLinkPattern';";	
			
		return $config;
	}	
	
	
}
?>