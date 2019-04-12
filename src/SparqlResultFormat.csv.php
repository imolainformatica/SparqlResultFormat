<?php

class SparqlResultFormatCSV extends SparqlResultFormatBase implements SparqlFormat {

	const DEFAULT_FILENAME = 'export.csv';
	const DEFAULT_SEPARATOR = ';';
	const DEFAULT_LABEL = 'Download as CSV';

	function __construct() {
		$this->name = wfMessage( "sprf.format.csv.title" );
		$this->description = wfMessage( "sprf.format.csv.description" );
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
			"scriptPath" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.scriptPath" ),
					"deprecated" => true
				],
			"headerMapping" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.headerMapping" ),
					"example" => wfMessage( "sprf.param.headerMapping.example" )
				],
			"filename" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.filename" ),
					"default" => self::DEFAULT_FILENAME
				],
			"separator" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.separator" ),
					"default" => self::DEFAULT_SEPARATOR
				],
			"linkButtonLabel" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.linkButtonLabel" )
				],
			"linkButtonCSSClass" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.linkButtonCSSClass" )
				],
			"label" => [
					"mandatory" => false,
					"description" => wfMessage( "sprf.param.label" ),
					"default" => self::DEFAULT_LABEL
				]
	   ];

	   $this->queryStructure =	wfMessage( "sprf.format.csv.query.structure" );
	}

	function generateLaunchScript( $options ) {
		$divId = $this->getParameterValue( $options, 'divId', '' );
		$launchScript = "
		
					  //config.rootElement = spqlib.util.htmlDecode(config.rootElement);
                      //spqlib.sparql2CSV(config);			  
						  $('#$divId-click').click(function() {
							  mw.loader.using( ['ext.SparqlResultFormat.main'], function () {
									mw.loader.using( 'ext.SparqlResultFormat.csv', function () {	
										config.sparql=$('#$divId').attr('sparql-query');								
										spqlib.sparql2CSV(config)
									});
								} );
							} );
              ";
		return $launchScript;
	}

	function generateJavascriptCode( $options, $prefixes ) {
		$launch = $this->generateLaunchScript( $options );
		$config = $this->generateConfig( $options );
		$register = $this->jsRegisterFunction( $launch );
		$output = "$prefixes
				$config
				$register				
			";
		return $output;
	}

	function generateConfig( $options ) {
		global $wgScriptPath;
		$endpointIndex = $this->getParameterValue( $options, 'sparqlEndpoint', '' );
		$endpointData = $this->getSparqlEndpointByName( $endpointIndex );
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = $this->getSparqlEndpointBasicAuthString( $endpointData );
		$divId = $options['divId'];
		$divStyle = $this->getParameterValue( $options, 'divStyle', '' );
		$escapedQuery = $this->getParameterValue( $options, 'sparqlEscapedQuery', '' );
		$headerMapping = $this->getParameterValue( $options, 'headerMapping', '{}' );
		$filename = $this->getParameterValue( $options, 'filename', self::DEFAULT_FILENAME );
		$separator = $this->getParameterValue( $options, 'separator', self::DEFAULT_SEPARATOR );
		$config = "var config = {};
						config.divId = '$divId';
						config.endpoint='$endpoint';
						config.endpointName='$endpointIndex';
						config.queryPrefixes=prefixes;
						config.headerMapping = $headerMapping;
						config.filename = '$filename';
						config.separator = '$separator';";
		return $config;
	}

	function generateHtmlContainerCode( $options ) {
		global $wgScriptPath;

		$divId = $this->getParameterValue( $options, 'divId', '' );
		$divStyle = $this->getParameterValue( $options, 'divStyle', '' );
		$escapedQuery = $this->getParameterValue( $options, 'sparqlEscapedQuery', '' );
		$linkButtonCSSClass = $this->getParameterValue( $options, 'linkButtonCSSClass', '' );
		$linkButtonLabel = $this->getParameterValue( $options, 'linkButtonLabel', '' );
		$csvDownloadAction = "$wgScriptPath/extensions/SparqlResultFormat/api/download/index.php";
		$label = $this->getParameterValue( $options, 'label', self::DEFAULT_LABEL );

		$formHtml = "<form id='$divId-form' action=\"$csvDownloadAction\" method='POST'>
			<input type='hidden' name='csv_text' value=''>
			<input type='hidden' name='csv_file_name' value=''>";
		if ( empty( $linkButtonLabel ) ) {
			$formHtml .= "<a id='$divId-click'>$label</a>";
		} else {
			$formHtml .= "<button id='$divId-click' class='$linkButtonCSSClass' type='button' >$linkButtonLabel</button>";
		}
		$formHtml .= "<span id='$divId-loader' class='loader' style='display:none;'><img src='$wgScriptPath/extensions/SparqlResultFormat/img/spinner.gif'/></span><span id='$divId-error-status' class='csv-error-status' style='display:none;'><i class='fas fa-exclamation-triangle' style='color: #e60606d1;'></i></span></form>";

		$htmlContainer = "<div id='$divId' style='$divStyle' sparql-query='$escapedQuery' class='sparql-to-csv'>$formHtml</div>";
		return $htmlContainer;
	}

}
