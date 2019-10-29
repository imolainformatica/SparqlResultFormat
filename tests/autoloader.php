<?php

/**
 * Convenience autoloader to pre-register test classes
 *
 * Third-party users that require SMW as integration platform should
 * add the following to the bootstrap.php
 *
 * require __DIR__ . '/../../SemanticMediaWiki/tests/autoloader.php'
 */
if ( PHP_SAPI !== 'cli' && PHP_SAPI !== 'phpdbg' ) {
	die( 'Not an entry point' );
}

if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'MediaWiki is not available.' );
}

$basePath = getenv( 'MW_INSTALL_PATH' ) !== false ? getenv( 'MW_INSTALL_PATH' ) : __DIR__ . '/../../..';

if ( is_readable( $path = __DIR__ . '/../vendor/autoload.php' ) ) {
	$autoloadType = "Extension vendor autoloader";
} elseif ( is_readable( $path = $basePath . '/vendor/autoload.php' ) ) {
	$autoloadType = "MediaWiki vendor autoloader";
} else {
	die( 'To run the test suite it is required that packages are installed using Composer.' );
}

/*require __DIR__ . '/phpUnitEnvironment.php';
$phpUnitEnvironment = new PHPUnitEnvironment();

if ( $phpUnitEnvironment->hasDebugRequest( $GLOBALS['argv'] ) === false ) {
	$phpUnitEnvironment->emptyDebugVars();
}

$phpUnitEnvironment->writeNewLn( "SparqlResultFormat:", $phpUnitEnvironment->getVersion( 'smw' ) );
$phpUnitEnvironment->writeLn( "MediaWiki:", $phpUnitEnvironment->getVersion( 'mw', [ 'type' => $autoloadType ] ) );
$phpUnitEnvironment->writeLn( "Site language:", $phpUnitEnvironment->getSiteLanguageCode() );
$phpUnitEnvironment->writeNewLn( "Execution time:", $phpUnitEnvironment->executionTime() );
$phpUnitEnvironment->writeLn( "Debug logs:", ( $phpUnitEnvironment->enabledDebugLogs() ? 'Enabled' : 'Disabled' ) );
$phpUnitEnvironment->writeLn( "Xdebug:", ( ( $version = $phpUnitEnvironment->getXdebugInfo() ) ? $version : 'Disabled (or not installed)' ) );
$phpUnitEnvironment->writeNewLn();

unset( $phpUnitEnvironment );*/

/**
 * Available to aid third-party extensions therefore any change should be made with
 * care
 *
 * @since  2.0
 */
$autoloader = require $path;

$autoloader->addPsr4( 'SparqlResultFormat\\Tests\\Utils\\', __DIR__ . '/phpunit/Utils' );

$autoloader->addClassMap( [
	'SparqlResultFormat\SparqlClient'            => __DIR__ . '/../src/SparqlClient.php',
	'SparqlResultFormat\Tests\Integration\JsonTestCaseScriptRunner'    => __DIR__ . '/phpunit/JsonTestCaseScriptRunner.php',
	'SparqlResultFormat\Tests\JsonTestCaseFileHandler'     => __DIR__ . '/phpunit/JsonTestCaseFileHandler.php',
	'SparqlResultFormat\Tests\JsonTestCaseContentHandler'  => __DIR__ . '/phpunit/JsonTestCaseContentHandler.php',
	'SparqlResultFormat\Tests\ParserHtmlTestCaseProcessor'  => __DIR__ . '/phpunit/ParserHtmlTestCaseProcessor.php',
	'SparqlResultFormat\Tests\ParserTestCaseProcessor'  => __DIR__ . '/phpunit/ParserTestCaseProcessor.php',
] );

// 3.0
//class_alias( '\SMW\Tests\DatabaseTestCase', '\SMW\Tests\MwDBaseUnitTestCase' );

return $autoloader;