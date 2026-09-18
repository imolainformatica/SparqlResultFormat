( function () {
	// This module can finish loading (and run) before the page's own inline
	// <script> blocks — generated per chart by generateJavascriptCode() and
	// emitted further down in the page body — have had a chance to push
	// their entry onto window.sparqlResultFormatsElements. Whether that race
	// is won or lost depends on ResourceLoader's bundling/caching state for
	// a given request, so it isn't reliably one way or the other.
	//
	// This module declares no dependencies (not even on jQuery), so waiting
	// on jQuery's ready() isn't safe here — jQuery itself may not be loaded
	// yet. Checking document.readyState directly avoids that, and also
	// avoids the classic "listener added after the event already fired,
	// so it never runs" bug that a bare DOMContentLoaded listener has: if
	// the document has already finished parsing by the time this script
	// runs, that event has already come and gone.
	function startAll() {
		var el, conf, i;
		if ( window.sparqlResultFormatsElements ) {
			for ( i = 0; i < window.sparqlResultFormatsElements.length; i++ ) {
				el = window.sparqlResultFormatsElements[ i ];
				conf = el.config;
				el.start( conf );
			}
		}
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', startAll );
	} else {
		startAll();
	}
}() );
