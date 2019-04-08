<?php

if (getenv( 'MW_INSTALL_PATH' )=== false){
	putenv("MW_INSTALL_PATH=".__DIR__."/../../../../");
}
//echo getenv( 'MW_INSTALL_PATH' );


require __DIR__ . '/../../../../includes/WebStart.php';
//require __DIR_.'SparqlEndpointCall.php';



// URL safety checks
if ( !$wgRequest->checkUrlExtension() ) {
	return;
}

$query="";
$sparqlEndpoint="";

try {
	if (!isset($_POST['endpointName'])){
		throw new Exception('Cannot find "endpointName" parameter'); 
	} else {
		$endpointName=$_POST['endpointName'];
	}


	if (!isset($wgSparqlEndpointDefinition[$endpointName])){
		throw new Exception('Cannot find sparql endpoint with name '.$endpointName); 
	} else {
		$sparqlEndpoint=$wgSparqlEndpointDefinition[$endpointName]['url'];
		if (isset($wgSparqlEndpointDefinition[$endpointName]['basicAuth'])){
			$user=$wgSparqlEndpointDefinition[$endpointName]['basicAuth']['user'];
			$password=$wgSparqlEndpointDefinition[$endpointName]['basicAuth']['password'];
		}
	}

	if (!isset($_POST['query'])){
		throw new Exception('Cannot find "query" parameter'); 
	} else {
		$query=$_POST['query'];
	}

	// set post fields
	$post = [
		'query'   => urlencode($query),
	];

	//url-ify the data for the POST
	foreach($post as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
	rtrim($fields_string, '&');

	$ch = curl_init($sparqlEndpoint);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
	curl_setopt($ch, CURLOPT_VERBOSE, true);
	if (isset($user) && isset($password)){
		curl_setopt($ch, CURLOPT_USERPWD, "$user:$password");
	}
	$headers = array(
		'Content-Type:application/x-www-form-urlencoded; charset=UTF-8',
		'Accept: application/sparql-results+json'
	);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);


	// execute!
	$response = curl_exec($ch);
	$rc=curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$ct=curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
	// close the connection, release resources used
	curl_close($ch);
	header('Content-Type: '.$ct,true);
	http_response_code ($rc);
	echo $response;
} catch (Exception $e){
	echo 'Caught exception: ',  $e->getMessage(), "\n";
	http_response_code (400);
}





?>