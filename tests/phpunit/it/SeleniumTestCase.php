<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class SeleniumTestCase extends PHPUnit_Extensions_SeleniumTestCase
{
	
	protected function setUp()
    {
        $this->setBrowser('firefox');
        $this->setBrowserUrl('http://localhost:80');
    }

    public function testTitle()
    {
        $this->url('http://localhost/');
        echo __CLASS__ ." - ". __FUNCTION__ ." ";
        $this->assertEquals('Example WWW Page', $this->title());
    }
}