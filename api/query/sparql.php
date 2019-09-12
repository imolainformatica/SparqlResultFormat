<?php

if ( getenv( 'MW_INSTALL_PATH' ) === false ) {
	putenv( "MW_INSTALL_PATH=" . __DIR__ . "/../../../../" );
}

require __DIR__ . '/../../../../includes/WebStart.php';

function setHTTPStatusCode($code){
	if (false === function_exists('http_response_code')) {
		header("X-returnCode: $code",true,$code);
	}else {
		http_response_code( $code );
	}
}


// URL safety checks
if ( !$wgRequest->checkUrlExtension() ) {
	return;
}

$query = "";
$sparqlEndpoint = "";

try {
	if ( !isset( $_POST['endpointName'] ) ) {
		throw new Exception( 'Cannot find "endpointName" parameter' );
	} else {
		$endpointName = $_POST['endpointName'];
	}

	$connectionTimeout = 10;
	$requestTimeout = 30;// seconds

	if ( !isset( $wgSparqlEndpointDefinition[$endpointName] ) ) {
		throw new Exception( 'Cannot find sparql endpoint with name ' . $endpointName );
	} else {
		$ep = $wgSparqlEndpointDefinition[$endpointName];
		$sparqlEndpoint = $ep['url'];
		if ( isset( $ep['basicAuth'] ) ) {

			$user = $ep['basicAuth']['user'];
			$password = $ep['basicAuth']['password'];
		}
		if ( isset( $ep['connectionTimeout'] ) ) {
			$connectionTimeout = $ep['connectionTimeout'];
		}
		if ( isset( $ep['requestTimeout'] ) ) {
			$requestTimeout = $ep['requestTimeout'];
		}
		if (isset($ep['verifySSLCertificate'])){
			$sslServerCertificateVerification=$ep['verifySSLCertificate'];
		} else {
			$sslServerCertificateVerification=true;
		}
	}

	if ( !isset( $_POST['query'] ) ) {
		throw new Exception( 'Cannot find "query" parameter' );
	} else {
		$query = $_POST['query'];
	}
} catch ( Exception $e ) {
	echo 'Caught exception: ',  $e->getMessage(), "\n";
	setHTTPStatusCode(400);
	exit();
}
	
	
try {
	// set post fields
	$post = array(
		'query'   => $query,
	);
	$fields_string = "";
	$fields_string = http_build_query( $post );
	$ch = curl_init( $sparqlEndpoint );
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	curl_setopt( $ch, CURLOPT_POSTFIELDS, $fields_string );

	curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, $connectionTimeout );
	curl_setopt( $ch, CURLOPT_TIMEOUT, $requestTimeout ); // timeout in seconds
	curl_setopt( $ch, CURLOPT_VERBOSE, false );
	if ( isset( $user ) && isset( $password ) ) {
		curl_setopt( $ch, CURLOPT_USERPWD, "$user:$password" );
	}
	if (isset($sslServerCertificateVerification)){
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $sslServerCertificateVerification);
	}
	$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : "SparqlResultFormat Sparql CURL";
	$headers = array(
		"Content-Type:application/x-www-form-urlencoded; charset=UTF-8",
		"Accept: application/sparql-results+json",
		"User-Agent: $userAgent"
	);
	curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers );

	// execute!
	$response = curl_exec( $ch );
	$rc = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	$ct = curl_getinfo( $ch, CURLINFO_CONTENT_TYPE );
	if (curl_errno($ch)){
		throw new Exception('Error: '.curl_error($ch));
	}
	// close the connection, release resources used
	curl_close( $ch );
	header( 'Content-Type: ' . $ct, true );
	setHTTPStatusCode($rc);
	echo $response;
} catch ( Exception $e ) {
	echo 'Caught exception: ',  $e->getMessage(), "\n";
	setHTTPStatusCode(500);
}
