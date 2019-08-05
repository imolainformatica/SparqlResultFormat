<?php

class SparqlResultFormatTable extends SparqlResultFormatBase implements SparqlFormat {

	function __construct() {
		$this->name = wfMessage( "sprf.format.table.title" );
		$this->description = wfMessage( "sprf.format.table.description" );

       $this->params = array(
			"divId" => array(
					"mandatory" => true,
					"description" => wfMessage("sprf.param.divId")
				),
			"sparqlEscapedQuery" => array(
					"mandatory" => true,
					"description" => wfMessage("sprf.param.sparqlEscapedQuery")
				),
			"sparqlEndpoint" => array(
				"mandatory" => true,
				"description" => wfMessage("sprf.param.sparqlEndpoint")
			),
			"spinnerImagePath" => array(
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.spinnerImagePath" ),
					"default" => ""
				),
			"divStyle" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.divStyle")
			),
			"tableClass" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.tableClass")
			),
			"columnConfiguration" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.columnConfiguration")
			),
			"cssEvenRowClass" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.cssEvenRowClass")
			),
			"cssOddRowClass" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.cssOddRowClass")
			),
			"cssEvenTdClass" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.cssEvenTdClass")
			),
			"cssOddTdClass" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.cssOddTdClass")
			),
			"noResultMessage" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.noResultMessage")
			),
			"csvExport" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.csvExport"),
				"default" =>"false"
			),
			"csvFileName" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.csvFileName"),
				"default" =>"export.csv"
			),
			"csvLinkLabel" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.csvLinkLabel")
			),
			"linkBasePath" => array(
				"mandatory" => false,
				"description" => wfMessage("sprf.param.linkBasePath"),
				"deprecated" => true
			)	
	   );   
		$this->queryStructure =	wfMessage("sprf.format.table.query.structure");
	}

	function generateHtmlContainerCode( $options ) {
		$divId = $this->getParameterValue( $options, 'divId', '' );
		$divStyle = $this->getParameterValue( $options, 'divStyle', '' );
		$escapedQuery = $this->getParameterValue( $options, 'sparqlEscapedQuery', '' );
		$htmlContainer = "<div id='$divId-container' class='table-container'>
			<div id='$divId' style='$divStyle' sparql-query='" . rawurlencode( $escapedQuery ) . "'></div></div>";
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
		$launchScript = "config.sparql=decodeURIComponent($('#$divId').attr('sparql-query'));
		mw.loader.using( ['ext.SparqlResultFormat.main','jquery.tablesorter'], function () {
             mw.loader.using( 'ext.SparqlResultFormat.table', function () {
                      spqlib.sparql2Table(config);
              } );
        } );";

		$sortableTable = "$('#$divId').on( 'done', function() {
             var sortableTables = $('#$divId').find( 'table.sortable' );
             if ( sortableTables.length ) {         
                sortableTables.tablesorter();   
             }
         });";
		 return $launchScript . $sortableTable;
	}

	function generateConfig( $options ) {
		global $wgServer;
		global $wgScriptPath;
		$endpointIndex = $this->getParameterValue( $options, 'sparqlEndpoint', '' );
		$endpointData = $this->getSparqlEndpointByName( $endpointIndex );
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = $this->getSparqlEndpointBasicAuthString( $endpointData );

		$divId = $this->getParameterValue( $options, 'divId', '' );
		$divStyle = $this->getParameterValue( $options, 'divStyle', '' );
		$escapedQuery = $this->getParameterValue( $options, 'sparqlEscapedQuery', '' );
		$tableClass = $this->getParameterValue( $options, 'tableClass', '' );
		$columnConfiguration = $this->getParameterValue( $options, 'columnConfiguration', '{}' );
		$cssEvenRowClass = $this->getParameterValue( $options, 'cssEvenRowClass', '' );
		$cssOddRowClass = $this->getParameterValue( $options, 'cssOddRowClass', '' );
		$cssEvenTdClass = $this->getParameterValue( $options, 'cssEvenTdClass', '' );
		$cssOddTdClass = $this->getParameterValue( $options, 'cssOddTdClass', '' );
		$noResultMessage = $this->getParameterValue( $options, 'noResultMessage', '' );
		$linkBasePath = $this->getParameterValue( $options, 'linkBasePath', "$wgServer$wgScriptPath/index.php/" );
		$spinnerImagePath = $this->getParameterValue( $options, 'spinnerImagePath', "$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif" );
		$csvExport = $this->getParameterValue( $options, 'csvExport', 'false' );
		$csvFileName = $this->getParameterValue( $options, 'csvFileName', 'export.csv' );
		$csvLinkLabel = $this->getParameterValue( $options, 'csvLinkLabel', 'Export as CSV' );
		$csvDownloadAction = "$wgScriptPath/extensions/SparqlResultFormat/api/download/";

		$config = "var config = {};
			config.divId = '$divId';
			config.tableClass='$tableClass';
			config.columnConfiguration=$columnConfiguration;
			config.cssEvenRowClass='$cssEvenRowClass';
			config.cssOddRowClass='$cssOddRowClass';
			config.cssEvenTdClass='$cssEvenTdClass';
			config.cssOddTdClass='$cssOddTdClass';
			config.noResultMessage='$noResultMessage';
			config.endpointName='$endpointIndex';
			config.endpoint='$endpoint';
			//config.sparql=$('#$divId').attr('sparql-query');
			config.queryPrefixes=prefixes;
			config.basicAuthBase64String='$basicAuthBase64String';
			config.linkBasePath='$linkBasePath';
			config.csvExport='$csvExport';
			config.csvFileName='$csvFileName';
			config.csvLinkLabel='$csvLinkLabel';
			config.csvFormAction='$csvDownloadAction';
			config.spinnerImagePath='$spinnerImagePath';";

		return $config;
	}

}
