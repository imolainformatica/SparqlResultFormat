<?php

class SparqlResultFormatCSV extends SparqlResultFormatBase implements SparqlFormat{
	
	const DEFAULT_FILENAME = 'export.csv';
	const DEFAULT_SEPARATOR = ';';
	const DEFAULT_LABEL = 'Download as CSV';
	
	function __construct() {
		$this->name = wfMessage("sprf.format.csv.title");
		$this->description = wfMessage("sprf.format.csv.description");
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
			"scriptPath" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.scriptPath"),
					"deprecated" => true
				),
			"headerMapping" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.headerMapping"),
					"example" => wfMessage("sprf.param.headerMapping.example")
				),
			"filename" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.filename"),
					"default" => self::DEFAULT_FILENAME
				),
			"separator" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.separator"),
					"default" => self::DEFAULT_SEPARATOR
				),
			"linkButtonLabel" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.linkButtonLabel")
				),
			"linkButtonCSSClass" => array(
					"mandatory" => false,
					"description" => wfMessage("sprf.param.linkButtonCSSClass")
				),
			"label" => array(
					"mandatory" => false,
					"description" =>  wfMessage("sprf.param.label"),
					"default" => self::DEFAULT_LABEL
				)
	   );
	   
	   $this->queryStructure =	wfMessage("sprf.format.csv.query.structure");
    }
	
	
	function generateJavascriptCode($options,$prefixes){
		global $wgScriptPath;
		$endpointIndex = $this->getParameterValue($options,'sparqlEndpoint','');
		$endpointData = $this->getSparqlEndpointByName($endpointIndex);
		$endpoint = $endpointData['url'];
		$basicAuthBase64String = $this->getSparqlEndpointBasicAuthString($endpointData);	
		$divId = $options['divId'];
		$divStyle = $this->getParameterValue($options,'divStyle','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery',''); 		
		$headerMapping = $this->getParameterValue($options,'headerMapping','{}'); 
		$filename = $this->getParameterValue($options,'filename',self::DEFAULT_FILENAME); 
		$separator = $this->getParameterValue($options,'separator',self::DEFAULT_SEPARATOR); 
		
		$js = "

			function downloadCSV(){
				$prefixes
				mw.loader.using(['ext.SparqlResultFormat.main'],function(){
					mw.loader.using( ['ext.SparqlResultFormat.csv'],function(){
						var config = {};
						config.divId = '$divId';
						config.endpoint='$endpoint';
						config.sparql=$('#$divId').attr('sparql-query');
						config.queryPrefixes=prefixes;
						config.basicAuthBase64String='$basicAuthBase64String';
						config.headerMapping = $headerMapping;
						config.filename = '$filename';
						config.separator = '$separator';
						spqlib.sparql2CSV(config);
						
					});
				});
				
			}";
		return $js;
	}
	
	function generateHtmlContainerCode($options){
		global $wgScriptPath;
		
		$divId = $this->getParameterValue($options,'divId','');
		$divStyle = $this->getParameterValue($options,'divStyle','');
		$escapedQuery = $this->getParameterValue($options,'sparqlEscapedQuery',''); 
		$linkButtonCSSClass = $this->getParameterValue($options,'linkButtonCSSClass','');
		$linkButtonLabel = $this->getParameterValue($options,'linkButtonLabel','');
		$csvDownloadAction = "$wgScriptPath/extensions/SparqlResultFormat/getCSV.php";
		$label = $this->getParameterValue($options,'label',self::DEFAULT_LABEL);
		
		$formHtml = "<form id='$divId-form' action=\"$csvDownloadAction\" method='POST'>
			<input type='hidden' name='csv_text' value=''>
			<input type='hidden' name='csv_file_name' value=''>";
		if (empty($linkButtonLabel)){
			$formHtml.="<a onclick='javascript:downloadCSV()'>$label</a>";
		} else {
			$formHtml.="<button class='$linkButtonCSSClass' type='button' onclick='javascript:downloadCSV()'>$linkButtonLabel</button>";
		}
		$formHtml.="</form>";
		
		$htmlContainer = "<div id='$divId' style='$divStyle' sparql-query='$escapedQuery' class='sparql-to-csv'>$formHtml</div>";
		return $htmlContainer;
		
	}
	
	
	
}
?>