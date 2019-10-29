<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use SparqlResultFormat\SparqlClient;

final class SparqlClientTest extends TestCase
{
	const wikidataEndpoint = "https://query.wikidata.org/sparql";
	
	const nonExistentEndpoint = "https://blablabla";
	
	const queryOK = "SELECT DISTINCT ?country ?countryLabel ?population { ?country wdt:P31 wd:Q6256 ; wdt:P1082 ?population . SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" }}GROUP BY ?population ?countryLabel ?country ORDER BY DESC(?population) limit 3";
	
	const queryKO = "SELECT DISTINCTXXX ?country ?countryLabel ?population { ?country wdt:P31 wd:Q6256 ; wdt:P1082 ?population . SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" }}GROUP BY ?population ?countryLabel ?country ORDER BY DESC(?population) limit 3";
	
	public function testQueryOK(): void
    {
		$client = new SparqlClient(self::wikidataEndpoint);
		$resp = $client->doQuery(self::queryOK);
		$array = json_decode($resp->responseBody);
		$this->assertEquals($resp->returnCode,200);
		$this->assertEquals($resp->contentType,"application/sparql-results+json;charset=utf-8");
		$this->assertTrue(isset($array->head));
		$this->assertTrue(isset($array->head->vars));
		$this->assertEquals(count($array->head->vars),3);
		$this->assertTrue(isset($array->results));
		$this->assertTrue(isset($array->results->bindings));
		$this->assertEquals(count($array->results->bindings),3);
    }
	
    public function testQueryKOWithSyntaxError(): void
    {
		$client = new SparqlClient(self::wikidataEndpoint);
		$resp = $client->doQuery(self::queryKO);
		$this->assertEquals($resp->returnCode,400);
		$this->assertEquals($resp->contentType,"text/plain");
    }
	
	
	/**
     * @expectedException Exception
	 * @expectedExceptionMessage Error: Failed to connect to blablabla port 443: Connection refused
     */
	public function testQueryKONonExistentEndpoint(): void
    {
		$client = new SparqlClient(self::nonExistentEndpoint);
		$resp = $client->doQuery(self::queryOK);
    }
	
	//altri test case
	// - timeout
	// - verifica certificato con flag di verifica a true o false
	//
	
	
}