var spqlib = ( function ( $, undefined ) {
	'use strict';

	// this file must be load only once
	var VERSION = '1.0.0',
	 reg = [];

	function addToRegistry( id, elem ) {
		if ( elem ) {
			reg[ id ] = elem;
		}
	}

	function getById( id ) {
		if ( reg[ id ] ) {
			return reg[ id ];
		}
		return;
	}

	return {
		VERSION: VERSION,
		addToRegistry: addToRegistry,
		getById: getById
	};

}( jQuery ) );

// Alias $j to jQuery for backwards compatibility
window.$j = jQuery;

// Attach to window and globally alias
window.spqlib = spqlib;
