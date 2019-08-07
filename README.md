# SparqlResultFormat

[![Build Status](https://travis-ci.org/imolainformatica/SparqlResultFormat.svg?branch=master)](https://travis-ci.org/imolainformatica/SparqlResultFormat)

SparqlResultFormat is a free, open-source extension to [MediaWiki](https://www.semantic-mediawiki.org/wiki/MediaWiki) that lets you query different Sparql endpoints and represent output data in various formats.

## Requirements

- PHP 5.3 or later
- MediaWiki 1.25 or later

## Installation

Once you have downloaded the code, place the 'SparqlResultFormat' directory within your
MediaWiki 'extensions' directory. Then add the following code to your LocalSettings.php file:

```php
wfLoadExtension( 'SparqlResultFormat' );
```


## Documentation

The documentation can be found directly on the **Special:SparqlResultFormat** page on your mediawiki after the installation.


## License

[MIT](LICENSE.md)