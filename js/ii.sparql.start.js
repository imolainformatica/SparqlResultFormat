( function () {
	var el, conf, i;
	if ( window.sparqlResultFormatsElements ) {
		for ( i = 0; i < window.sparqlResultFormatsElements.length; i++ ) {
			el = window.sparqlResultFormatsElements[ i ];
			conf = el.config;
			el.start( conf );
		}
	}
}() );
