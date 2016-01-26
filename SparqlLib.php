<?php

$wgExtensionMessagesFiles['SparqlLib'] = __DIR__ . '/SparqlLib.i18n.magic.php';

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

$wgExtensionCredits['SparqlLib'][] = array(
        'name' => 'sparql library',
        'author' => '',
        'version' => '1.0',
        'description' => '',
);

$dir = dirname( __FILE__ );


$wgResourceModules['ext.sparqlLib.main'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlLib',
	'scripts' => array('js/cytoscape.imola.js'),
 	'dependencies' => array('ext.sparqlLib.libs')
);

$wgResourceModules['ext.sparqlLib.libs'] = array(
	'localBasePath' => $dir,
	'remoteExtPath' => 'SparqlLib',
	'scripts' => array('js/cytoscape.js','js/dagre.min.js','js/cytoscape-dagre.js','js/cytoscape-qtip.js'/*,'js/dagre.core.js'*/)
);

/*$wgHooks['MagicWordwgVariableIDs'][] = 'wfDeclareGlobalVariableIDs';
function wfDeclareGlobalVariableIDs( &$customVariableIds ) {
        $customVariableIds[] = 'MAG_FUSEKI_PORT_NUMBER';
        $customVariableIds[] = 'MAG_FUSEKI_EXT_URL';
        return true;
}*/
