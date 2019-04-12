<?php

class SparqlResultFormatPieChart extends SparqlResultFormatBase implements SparqlFormat {

		function __construct() {
		$this->name = wfMessage( "sprf.format.piechart.title" );
		$this->description = wfMessage( "sprf.format.piechart.description" );
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
			"extraOption" => [
				"mandatory" => false,
				"description" => wfMessage( "sprf.param.extraOption" )
			],
	   ];

	   $this->extraOpts = [
			"chart.title" => [
					"description" => wfMessage( "sprf.options.chart.title" ),
					"default" => "",
					"example" => "|extraOption=chart.title:New Title"
				],
				"chart.series.color" => [
					"description" => wfMessage( "sprf.options.chart.series.color" ),
					"default" => "",
					"example" => "|extraOption=chart.series.color:[ 'red','#000000','FFAACC']"
				],
				"chart.serie.label" => [
					"description" => wfMessage( "sprf.options.chart.serie.label" ),
					"default" => "",
					"example" => "|extraOption=chart.serie.label:series label"
				],
				"chart.tooltip.label.link.show" => [
					"description" => wfMessage( "sprf.options.chart.tooltip.label.link.show" ),
					"default" => "",
					"example" => "|extraOption=chart.tooltip.label.link.show:false"
				],
				"chart.tooltip.label.link.pattern" => [
					"description" => wfMessage( "sprf.options.chart.tooltip.label.link.pattern" ),
					"default" => "",
					"example" => "|extraOption=chart.tooltip.label.link.pattern:http://www.google.it?q={%s}"
				],
				"chart.tooltip.label.pattern" => [
					"description" => wfMessage( "sprf.options.chart.tooltip.label.pattern" ),
					"default" => "{%s}",
					"example" => "|extraOption=chart.tooltip.label.pattern:Category {%s}"
				],
				"chart.tooltip.value.pattern" => [
					"description" => wfMessage( "sprf.options.chart.tooltip.value.pattern" ),
					"default" => "{%d}",
					"example" => "|extraOption=chart.tooltip.value.pattern:{%d} €"
				]
	   ];
	   $this->queryStructure = wfMessage( "sprf.format.piechart.query.structure" ) . wfMessage( "sprf.format.piechart.query.structure.example" );
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
		$launchScript = "config.sparql=$('#$divId').attr('sparql-query');
		mw.loader.using( ['ext.SparqlResultFormat.main'], function () {
             mw.loader.using( 'ext.SparqlResultFormat.piechart', function () {
                      spqlib.sparql2PieChart(config);
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
			config.extraOptionsString=\"$extraOptionString\";";

		return $config;
	}

}
