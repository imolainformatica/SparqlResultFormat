<?php

namespace SparqlResultFormat\Tests;

use SMW\DIWikiPage;
use SparqlResultFormat\Tests\Utils\UtilityFactory;
use SparqlResultFormat\Tests\Utils\Validators\HtmlValidator;
use Title;
use PHPUnit\Framework\TestCase;

/**
 * @group semantic-mediawiki
 * @group medium
 *
 * @license GNU GPL v2+
 * @since 3.0
 *
 * @author Stephan Gambke
 */
class ParserHtmlTestCaseProcessor extends TestCase {

	/**
	 * @var HtmlValidator
	 */
	private $htmlValidator;

	/**
	 * @var PageReader
	 */
	private $pageReader;

	/**
	 * @param HtmlValidator $htmlValidator
	 */
	public function __construct( HtmlValidator $htmlValidator ) {
		parent::__construct();
		$this->htmlValidator = $htmlValidator;
		$this->pageReader = UtilityFactory::getInstance()->newPageReader();
	}

	/**
	 * @return boolean
	 */
	public function canUse() {
		return $this->htmlValidator->canUse();
	}

	/**
	 * @param array $case
	 */
	public function process( array $case ) {

		if ( !isset( $case[ 'subject' ] ) ) {
			return;
		}

		if ( isset( $case[ 'about' ] ) ) {
			$this->setName( $case[ 'about' ] );
		}

		$this->assertParserHtmlOutputForCase( $case );
	}

	/**
	 * @param array $case
	 */
	private function assertParserHtmlOutputForCase( array $case ) {

		if ( !isset( $case[ 'assert-output' ] ) ) {
			return;
		}

		$outputText = $this->getOutputText( $case );

		if ( $this->isSetAndTrueish( $case[ 'assert-output' ], 'to-be-valid-html' ) ) {
			$this->htmlValidator->assertThatHtmlIsValid(
				$outputText,
				$case[ 'about' ]
			);
		}

		if ( $this->isSetAndTrueish( $case[ 'assert-output' ], 'to-contain' ) ) {
			$this->htmlValidator->assertThatHtmlContains(
				$case[ 'assert-output' ][ 'to-contain' ],
				$outputText,
				$case[ 'about' ]
			);
		}

		if ( $this->isSetAndTrueish( $case[ 'assert-output' ], 'not-contain' ) ) {
			$this->htmlValidator->assertThatHtmlNotContains(
				$case[ 'assert-output' ][ 'not-contain' ],
				$outputText,
				$case[ 'about' ]
			);
		}
	}

	/**
	 * @param array $case
	 * @return string
	 */
	private function getOutputText( array $case ) {

		/*$subject = DIWikiPage::newFromText(
			$case[ 'subject' ],
			isset( $case[ 'namespace' ] ) ? constant( $case[ 'namespace' ] ) : NS_MAIN
		);*/
		$title = Title::makeTitleSafe(
			isset( $case[ 'namespace' ] ) ? constant( $case[ 'namespace' ] ) : NS_MAIN,
			str_replace( ' ', '_', $case['subject'] ) ,
			null,
			null
		); 
		$parserOutput = $this->pageReader->getParserOutputFromEdit(
			$title
		);

		if ( !$this->isSetAndTrueish( $case[ 'assert-output' ], [ 'withOutputPageContext', 'onPageView' ] ) ) {
			return $parserOutput->getText();
		}

		$context = new \RequestContext();
		$context->setTitle( $title );

		if ( $this->isSetAndTrueish( $case[ 'assert-output' ], 'withOutputPageContext' ) ) {
			// Ensures the OutputPageBeforeHTML hook is run
			$context->getOutput()->addParserOutput( $parserOutput );
		} else {
			\Article::newFromTitle( $title, $context )->view();
		}

		return $context->getOutput()->getHTML();

	}

	/**
	 * @param $array
	 * @param string | string[] $keys
	 * @return bool True if any of the $keys is defined in $array and true-ish
	 */
	private function isSetAndTrueish( $array, $keys ) {

		$keys = (array)$keys;

		foreach ( $keys as $key ) {
			if ( isset( $array[ $key ] ) && $array[ $key ] ) {
				return true;
			}
		}

		return false;
	}

}
