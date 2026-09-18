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
    if ( isset( $_REQUEST['png_file_name'] ) ) {
		$filename = $_REQUEST['png_file_name'];
		$base64strImg = $_POST['png_string'];
		$data = explode( ',', $base64strImg );
		header( "Content-Disposition: attachment; filename=\"" . $filename . "\"" );
		header( 'Content-Type: application/force-download' );
		echo base64_decode( $data[1] );
	}

} catch ( Exception $e ) {
	echo 'Caught exception: ',  $e->getMessage(), "\n";
	http_response_code( 400 );
}
