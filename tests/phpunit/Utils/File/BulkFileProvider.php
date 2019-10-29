<?php

namespace SparqlResultFormat\Tests\Utils\File;

use RuntimeException;

/**
 * @license GNU GPL v2+
 * @since 2.1
 *
 * @author mwjames
 */
class BulkFileProvider {

	/**
	 * @var string
	 */
	private $path = null;

	/**
	 * @var string
	 */
	private $extension = 'json';

	/**
	 * @since 2.1
	 *
	 * @param string $path
	 */
	public function __construct( $path ) {
		$this->path = $path;
	}

	/**
	 * @since 2.1
	 *
	 * @param string $extension
	 */
	public function searchByFileExtension( $extension ) {
		$this->extension = $extension;
	}

	/**
	 * @since 2.1
	 *
	 * @return array
	 */
	public function getFiles() {


		$iterator = $this->findByExtension($this->path, $this->extension );

		$files = [];

		foreach ( $iterator as $file => $value ) {
			$fileInfo = pathinfo( $file );
			$files[$fileInfo['filename'] . ' (' . substr( md5( $file ), 0, 5 ) .')'] = $file;
		}

		asort( $files );

		return $files;
	}
	
	private function findByExtension($dir, $extension ) {

		if ( !is_dir( $dir ) ) {
			throw new RuntimeException( "Unable to access {$dir}!" );
		}

		$iterator = new \RecursiveIteratorIterator(
			new \RecursiveDirectoryIterator( $dir )
		);

		$matches = new \RegexIterator(
			$iterator, '/^.+\.' . $extension . '$/i',
			\RecursiveRegexIterator::GET_MATCH
		);

		if ( $this->sort !== null ) {
			$matches = iterator_to_array(
				$matches
			);

			usort( $matches, [ $this, "sort_$this->sort" ] );
		}

		return $matches;
	}

}
