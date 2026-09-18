<?php

if ( getenv( 'MW_INSTALL_PATH' ) === false ) {
	putenv( "MW_INSTALL_PATH=" . __DIR__ . "/../../../../" );
}

require __DIR__ . '/../../../../includes/WebStart.php';

// NOTE: WebRequest::checkUrlExtension() was removed in MediaWiki 1.39
// (it mitigated an old Internet Explorer MIME-sniffing issue that no
// longer applies to any modern browser; MediaWiki core itself dropped
// the check outright, with no replacement). The call used to sit here.

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
