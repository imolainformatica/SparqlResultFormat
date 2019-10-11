<?php

if ( getenv( 'MW_INSTALL_PATH' ) === false ) {
	putenv( "MW_INSTALL_PATH=" . __DIR__ . "/../../../../" );
}

require __DIR__ . '/../../../../includes/WebStart.php';

// URL safety checks
if ( !$wgRequest->checkUrlExtension() ) {
	return;
}

try {
	if ( isset( $_REQUEST['csv_file_name'] ) ) {
		$filename = $_REQUEST['csv_file_name'];
		header( "Content-type: application/octet-stream" );
		header( "Content-Disposition: attachment; filename=\"" . $filename . "\"" );
		$data = stripcslashes( $_REQUEST['csv_text'] );
		echo $data;
	} 
} catch ( Exception $e ) {
	echo 'Caught exception: ',  $e->getMessage(), "\n";
	http_response_code( 400 );
}
