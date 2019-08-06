<?php

interface SparqlFormat {

	/*function generateLaunchScript($options);

	function generateConfig($options);

	function generateContainer($options);*/

	function generateHtmlContainerCode( $options );

	function generateJavascriptCode( $options, $prefixes );
}
