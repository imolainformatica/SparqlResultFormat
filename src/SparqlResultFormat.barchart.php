<?php

class SparqlResultFormatBarChart extends SparqlResultFormatBase implements SparqlFormat {

		function __construct() {
		$this->name = wfMessage( "sprf.format.barchart.title" );
		$this->description = wfMessage( "sprf.format.barchart.description" );
	   $this->params = [
			"divId" => [
					"mandatory" => true,
					"description" => wfMessage( "sprf.param.divId" )
				],
			"sparqlEndpoint" => [
					"mandatory" => true,
					"description" => wfMessage( "sprf.param.sparqlEndpoint" )
				],
			"sparqlEscapedQuery" => [
					"mandatory" => true,
					"description" => wfMessage( "sprf.param.sparqlEscapedQuery" )
				],
			"divStyle" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.divStyle" )
				],
			"spinnerImagePath" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.spinnerImagePath" )
				],
			"divCssClass" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.divCssClass" )
				],
			"divCssClassFullScreen" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.divCssClassFullScreen" )
				],
			"seriesConfiguration" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.seriesConfiguration" ),
					"example" => wfMessage( "sprf.param.seriesConfiguration.example" )
				],
			"extraOption" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.extraOption" )
				]

	   ];

	   $this->extraOpts = [
			"chart.title" => [
					"description" => wfMessage( "sprf.options.chart.title" ),
					"default" => "",
					"example" => "|extraOption=sprf.options.chart.title:New title"
				],
				"chart.direction" => [
					"description" => wfMessage( "sprf.options.chart.direction" ),
					"default" => "vertical",
					"example" => "|extraOption=chart.direction:horizontal"
				],
				"chart.bar.width" => [
					"description" => wfMessage( "sprf.options.chart.bar.width" ),
					"default" => "auto",
					"example" => "|extraOption=chart.bar.width:10"
				],
				"chart.bar.margin" => [
					"description" => wfMessage( "sprf.options.chart.bar.margin" ),
					"default" => "8",
					"example" => "|extraOption=chart.bar.margin:10"
				],
				"chart.bar.padding" => [
					"description" => wfMessage( "sprf.options.chart.bar.padding" ),
					"default" => "10",
					"example" => "|extraOption=chart.bar.margin:10"
				],
				"chart.axis.x.label" => [
					"description" => wfMessage( "sprf.options.chart.axis.x.label" ),
					"default" => "",
					"example" => ""
				],
				"chart.axis.y.label" => [
					"description" => wfMessage( "sprf.options.chart.axis.y.label" ),
					"default" => "",
					"example" => ""
				],
				"chart.axis.x.label.font.size" => [
					"description" => wfMessage( "sprf.options.chart.axis.x.label.font.size" ),
					"default" => "14pt",
					"example" => "|extraOption=chart.axis.x.label.font.size:20pt"
				],
				"chart.axis.y.label.font.size" => [
					"description" => wfMessage( "sprf.options.chart.axis.y.label.font.size" ),
					"default" => "14pt",
					"example" => "|extraOption=chart.axis.y.label.font.size:20pt"
				],
				"chart.axis.x.font.size" => [
					"description" => wfMessage( "sprf.options.chart.axis.x.font.size" ),
					"default" => "10pt",
					"example" => "|extraOption=chart.axis.x.font.size:14pt"
				],
				"chart.axis.y.font.size" => [
					"description" => wfMessage( "sprf.options.chart.axis.y.font.size" ),
					"default" => "10pt",
					"example" => "|extraOption=chart.axis.y.font.size:14pt"
				],
				"chart.axis.x.angle" => [
					"description" => wfMessage( "sprf.options.chart.axis.x.angle" ),
					"default" => "-30",
					"example" => "|extraOption=chart.axis.x.angle:-20"
				],
				"chart.axis.y.angle" => [
					"description" => wfMessage( "sprf.options.chart.axis.y.angle" ),
					"default" => "0",
					"example" => "|extraOption=chart.axis.y.angle:-20"
				],
				"chart.legend.show" => [
					"description" => wfMessage( "sprf.options.chart.legend.show" ),
					"default" => "true",
					"example" => "|extraOption=chart.legend.show:false"
				],
				"chart.legend.location" => [
					"description" => wfMessage( "sprf.options.chart.legend.location" ),
					"default" => "ne",
					"example" => "|extraOption=chart.legend.location:s"
				],
				"chart.height.automatic" => [
					"description" => wfMessage( "sprf.options.chart.height.automatic" ),
					"default" => "false",
					"example" => "|extraOption=chart.height.automatic:true"
				],
				"chart.axis.label.max.length" => [
					"description" => wfMessage( "sprf.options.chart.axis.label.max.length" ),
					"default" => "15",
					"example" => "|extraOption=chart.axis.label.max.length:30"
				]
	   ];
		   $this->queryStructure = wfMessage( "sprf.format.barchart.query.structure" ) . wfMessage( "sprf.format.barchart.query.structure.example" );
	 }

	function generateHtmlContainerCode( $options ) {
		$divId = $this->getParameterValue( $options, 'divId', '' );
		$divStyle = $this->getParameterValue( $options, 'divStyle', '' );
		$divCssClass = $this->getParameterValue( $options, 'divCssClass', '' );
		$escapedQuery = $this->getParameterValue( $options, 'sparqlEscapedQuery', '' );
		$htmlContainer = "<div id='$divId-container' style='$divStyle' class='$divCssClass'>
			<div id='$divId' style='width:100%; height:100%;' sparql-query='$escapedQuery'></div></div>";
		return $htmlContainer;
	}

	function generateJavascriptCode( $options, $prefixes ) {
		$config = $this->generateConfig( $options );
		$launch = $this->generateLaunchScript( $options );
		$register = $this->jsRegisterFunction( $launch );
		$output = "$prefixes
				$config
				$register				
			";
		return $output;
	}

	function generateLaunchScript( $options ) {
		$divId = $this->getParameterValue( $options, 'divId', '' );
		$launchScript = "
					config.sparql=$('#$divId').attr('sparql-query');
			mw.loader.using( ['ext.SparqlResultFormat.main'], function () {
             mw.loader.using( 'ext.SparqlResultFormat.barchart', function () {
                      spqlib.sparql2BarChart(config);
              } );
        } );";
		return $launchScript;
	}

	function generateConfig( $options ) {
		global $wgScriptPath;
		$endpointIndex = $this->getParameterValue( $options, 'sparqlEndpoint', '' );
		$endpointData = $this->getSparqlEndpointByName( $endpointIndex );
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = $this->getSparqlEndpointBasicAuthString( $endpointData );
		$divId = $this->getParameterValue( $options, 'divId', '' );
		$divStyle = $this->getParameterValue( $options, 'divStyle', '' );
		$escapedQuery = $this->getParameterValue( $options, 'sparqlEscapedQuery', '' );
		$spinnerImagePath = $this->getParameterValue( $options, 'spinnerImagePath', "$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif" );

		$divCssClass = $this->getParameterValue( $options, 'divCssClass', '' );
		$divCssClassFullScreen = $this->getParameterValue( $options, 'divCssClassFullScreen', '' );

		$seriesConfiguration = $this->getParameterValue( $options, 'seriesConfiguration', '{}' );

		$extraOption = $this->getParameterValue( $options, 'extraOption', '' );
		$this->checkExtraOptions( $extraOption );
		$extraOptionString = implode( "||", $extraOption );

		$config = "var config = {};
			config.divId = '$divId';
			config.endpoint='$endpoint';
			config.endpointName='$endpointIndex';
			config.queryPrefixes=prefixes;
			config.spinnerImagePath='$spinnerImagePath';
			config.divCssClass='$divCssClass';
			config.divCssClassFullScreen='$divCssClassFullScreen';
			config.seriesConfiguration=$seriesConfiguration;	
			config.extraOptionsString=\"$extraOptionString\";";

		return $config;
	}

}
