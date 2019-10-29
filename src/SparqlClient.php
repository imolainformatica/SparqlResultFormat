<?php

namespace SparqlResultFormat;

class SparqlClient  {
	
	private $sparqlEndpoint = "";
	private $connectionTimeout = 30;
	private $requestTimeout = 30;
	private $user = null;
	private $password = null;
	private $sslServerCertificateVerification = true;

	function __construct($endpoint) {
		$this->sparqlEndpoint=$endpoint;
	 }
	 
	 public function getSparqlEndpoint(){
		return $this->sparqlEndpoint;
	}

	public function setSparqlEndpoint($sparqlEndpoint){
		$this->sparqlEndpoint = $sparqlEndpoint;
	}

	public function getConnectionTimeout(){
		return $this->connectionTimeout;
	}

	public function setConnectionTimeout($connectionTimeout){
		$this->connectionTimeout = $connectionTimeout;
	}

	public function getRequestTimeout(){
		return $this->requestTimeout;
	}

	public function setRequestTimeout($requestTimeout){
		$this->requestTimeout = $requestTimeout;
	}

	public function getUser(){
		return $this->user;
	}

	public function setUser($user){
		$this->user = $user;
	}

	public function getPassword(){
		return $this->password;
	}

	public function setPassword($password){
		$this->password = $password;
	}

	public function getSslServerCertificateVerification(){
		return $this->sslServerCertificateVerification;
	}

	public function setSslServerCertificateVerification($sslServerCertificateVerification){
		$this->sslServerCertificateVerification = $sslServerCertificateVerification;
	}
	 
	 
	public function doQuery($query){
		$post = array(
			'query'   => $query,
		);
		$fields_string = "";
		$fields_string = http_build_query( $post );
		$ch = curl_init( $this->sparqlEndpoint );
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $fields_string );

		curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, $this->connectionTimeout );
		curl_setopt( $ch, CURLOPT_TIMEOUT, $this->requestTimeout ); // timeout in seconds
		curl_setopt( $ch, CURLOPT_VERBOSE, false );
		if ( !empty( $this->user ) && !empty( $this->password ) ) {
			curl_setopt( $ch, CURLOPT_USERPWD, "$this->user:$this->password" );
		}
		if (isset($this->sslServerCertificateVerification)){
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $this->sslServerCertificateVerification);
		}
		$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : "SparqlResultFormat Sparql CURL";
		$headers = array(
			"Content-Type:application/x-www-form-urlencoded; charset=UTF-8",
			"Accept: application/sparql-results+json",
			"User-Agent: $userAgent"
		);
		curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers );

		// execute!
		$response = curl_exec( $ch );
		$rc = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
		$ct = curl_getinfo( $ch, CURLINFO_CONTENT_TYPE );
		if (curl_errno($ch)){
			throw new \Exception('Error: '.curl_error($ch));
		}
		// close the connection, release resources used
		curl_close( $ch );
		return (object) [
			'responseBody' => $response,
			'returnCode' => $rc,
			'contentType' => $ct
		];
		
		
	}

}
