<?php

$wgExtensionMessagesFiles['SparqlResultFormat'] = __DIR__ . '/SparqlResultFormat.i18n.magic.php';

/*$wgHooks['ParserGetVariableValueSwitch'][] = 'wfAssignValueToGlobalVariable';
function wfAssignValueToGlobalVariable(&$parser, &$cache, &$magicWordId, &$ret,&$frame) {

  global $fusekiPortNumber;
  global $externalFusekiUrl;

  switch($magicWordId) {
  case 'MAG_FUSEKI_PORT_NUMBER':
     $ret = "ciao";
     break;
  case 'MAG_FUSEKI_EXT_URL':
     global $smwgSparqlQueryEndpoint;
     if ( $externalFusekiUrl==="") {
       wfDebug( __METHOD__ . ": Franco; valore di -$smwgSparqlQueryEndpoint- \n " );
        $ret = $smwgSparqlQueryEndpoint;
     } else {
        $ret = $externalFusekiUrl;
     }
	 $ret="pippo";
     break;
  default:
     break;
  }

  return true;
}*/

$wgExtensionCredits['SparqlResultFormat'][] = array(
        'name' => 'SparqlResultFormat',
        'author' => '',
        'version' => '1.0',
        'description' => 'permette di effettuare query sparql a endpoint e di visualizzarle in diversi formati',
);

$dir = dirname( __FILE__ );

$wgResourceModules['ext.SparqlResultFormat.all'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'scripts' => array('js/ii.sparql.main.js'),
 	'dependencies' => array('ext.SparqlResultFormat.formats')
);


$wgResourceModules['ext.SparqlResultFormat.graph'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'scripts' => array('js/ii.sparql.main.js'),
 	'dependencies' => array('ext.SparqlResultFormat.formats.graph')
);

$wgResourceModules['ext.SparqlResultFormat.table'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'scripts' => array('js/ii.sparql.main.js'),
 	'dependencies' => array('ext.SparqlResultFormat.formats.table')
);

$wgResourceModules['ext.SparqlResultFormat.barchart'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'styles' => array(
        'css/jquery.jqplot.min.css' => array('media' => 'screen')),		
	'scripts' => array('js/ii.sparql.main.js',
	    'js/ii.sparql.format.barchart.js',
		'js/ii.jqplot.js',
		'js/libs/jqplot/jquery.jqplot.min.js',
		'js/libs/jqplot/jqplot.barRenderer.js',
		'js/libs/jqplot/jqplot.highlighter.js',
		'js/libs/jqplot/jqplot.categoryAxisRenderer.js',
		'js/libs/jqplot/jqplot.canvasTextRenderer.js',
		'js/libs/jqplot/jqplot.canvasAxisTickRenderer.js',
		'js/libs/jqplot/jqplot.canvasAxisLabelRenderer.js'),
);

$wgResourceModules['ext.SparqlResultFormat.piechart'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'styles' => array(
        'css/jquery.jqplot.min.css' => array('media' => 'screen')),		
	'scripts' => array('js/ii.sparql.main.js',
	    'js/ii.sparql.format.piechart.js',
		'js/ii.jqplot.js',
		'js/libs/jqplot/jquery.jqplot.min.js',
		'js/libs/jqplot/jqplot.barRenderer.js',
		'js/libs/jqplot/jqplot.highlighter.js',
		'js/libs/jqplot/jqplot.categoryAxisRenderer.js',
		'js/libs/jqplot/jqplot.canvasTextRenderer.js',
		'js/libs/jqplot/jqplot.canvasAxisTickRenderer.js',
		'js/libs/jqplot/jqplot.canvasAxisLabelRenderer.js',
		'js/libs/jqplot/jqplot.pieRenderer.js'),
);

$wgResourceModules['ext.SparqlResultFormat.formats'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'dependencies' => array('ext.SparqlResultFormat.formats.table','ext.SparqlResultFormat.formats.graph','ext.SparqlResultFormat.formats.barchart')
);

$wgResourceModules['ext.SparqlResultFormat.formats.table'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'scripts' => array('js/ii.sparql.format.table.js','js/dagre.min.js','js/cytoscape-dagre.js','js/cytoscape-qtip.js'/*,'js/dagre.core.js'*/)
);

$wgResourceModules['ext.SparqlResultFormat.formats.graph'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'scripts' => array('js/ii.sparql.format.graph.js','js/ii.cytoscape.js','js/libs/cytoscape.js','js/libs/dagre.min.js','js/libs/cytoscape-dagre.js','js/libs/cytoscape-qtip.js'/*,'js/dagre.core.js'*/)
);

$wgResourceModules['ext.SparqlResultFormat.formats.barchart'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlResultFormat',
	'scripts' => array('js/ii.sparql.format.barchart.js','js/libs/jqplot/jquery.jqplot.min.js','js/libs/jqplot/jqplot.barRenderer.js')
);


/*$wgHooks['MagicWordwgVariableIDs'][] = 'wfDeclareGlobalVariableIDs';
function wfDeclareGlobalVariableIDs( &$customVariableIds ) {
        $customVariableIds[] = 'MAG_FUSEKI_PORT_NUMBER';
        $customVariableIds[] = 'MAG_FUSEKI_EXT_URL';
        return true;
}*/
