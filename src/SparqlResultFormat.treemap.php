<?php

class SparqlResultFormatTreemap extends SparqlResultFormatBase implements SparqlFormat {

	function __construct() {
		$this->name = wfMessage( "sprf.format.treemap.title" );
		$this->description = wfMessage( "sprf.format.treemap.description" );
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
				"rootElement" => [
					"mandatory" => true,
					"description" => wfMessage( "sprf.param.rootElement" )
				],
				"leavesLinkPattern" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.leavesLinkPattern" )
				],
				"openLinkOnLeaves" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.openLinkOnLeaves" )
				]
	   ];
	   $this->queryStructure = wfMessage( "sprf.format.treemap.query.structure" ) . wfMessage( "sprf.format.treemap.query.structure.example" );
	}
	function generateHtmlContainerCode( $options ) {
		$divId = $this->getParameterValue( $options, 'divId', '' );
		$divStyle = $this->getParameterValue( $options, 'divStyle', '' ); // isset($options['divStyle']) ? $options['divStyle'] : '';
		$divCssClass = $this->getParameterValue( $options, 'divCssClass', '' );
		$escapedQuery = $this->getParameterValue( $options, 'sparqlEscapedQuery', '' ); // $options['sparqlEscapedQuery'];
		$htmlContainer = "<div id='$divId-container' style='$divStyle' class='$divCssClass'>
			<div id='$divId' style='width:100%; height:100%;' class='d3-treemap' sparql-query='$escapedQuery'></div>
				<div id='tooltip-treemap' class='hidden' <p><strong id='heading'></strong></p>
				<p><span id='tooltip-text'></span></p>
				</div>
			</div>";
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
             mw.loader.using( 'ext.SparqlResultFormat.treemap', function () {
                      spqlib.sparql2Treemap(config);
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
		$spinnerImagePath = $this->getParameterValue( $options, 'spinnerImagePath', "$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif" );
		$divCssClass = $this->getParameterValue( $options, 'divCssClass', '' );
		$divCssClassFullScreen = $this->getParameterValue( $options, 'divCssClassFullScreen', '' );
		$rootElement = $this->getParameterValue( $options, 'rootElement', '' );
		$leavesLinkPattern = $this->getParameterValue( $options, 'leavesLinkPattern', '' );
		$openLinkOnLeaves = $this->getParameterValue( $options, 'openLinkOnLeaves', 'false' );

		$config = "var config = {};
			config.divId = '$divId';
			config.endpoint='$endpoint';
			config.endpointName='$endpointIndex';
			config.queryPrefixes=prefixes;
			config.divCssClass='$divCssClass';
			config.divCssClassFullScreen='$divCssClassFullScreen';
			config.spinnerImagePath='$spinnerImagePath';
			config.leavesLinkPattern='$leavesLinkPattern';
			config.rootElement='$rootElement';
			config.openLinkOnLeaves='$openLinkOnLeaves';

			
			";

		return $config;
	}

}
