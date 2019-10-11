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
