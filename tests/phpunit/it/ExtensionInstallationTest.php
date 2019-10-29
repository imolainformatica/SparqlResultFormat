<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class ExtensionInstallationTest extends TestCase
{
	
	public function testCanAccessSpecialVersionPage(): void
    {
		$ch = curl_init("http://localhost:80/index.php/Special:Version");
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_exec($ch);
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		echo __CLASS__ ." - ". __FUNCTION__ ." Special:Version return code: $httpcode";
        $this->assertEquals($httpcode,200);
    }
	
	
    public function testCanAccessSpecialPage(): void
    {
		$ch = curl_init("http://localhost:80/index.php/Special:SparqlResultFormat");
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_exec($ch);
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		echo __CLASS__ ." - ". __FUNCTION__ ." Special:SparqlResultFormat page return code: $httpcode";
        $this->assertEquals($httpcode,200);
    }
}