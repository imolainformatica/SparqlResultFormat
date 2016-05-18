Questo progetto contiene l'implementazione dell'estensione Mediawiki SparqlResultFormat.

# Installazione
1) Posizionarsi nella cartella extensions della vostra installazione mediawiki e lanciare il seguente comando
```
git clone http://git.imolinfo.it/piattaforma_semantica/SparqlResultFormat.git
```
2) Modificare il LocalSettings.php aggiungendo la seguente istruzione

```php
<?php
wfLoadExtension( 'SparqlResultFormat' );
```
3) Verificare che l'estensione sia correttamente installanta nella pagina speciale **Special:Version** del vostro mediawiki. 

4) Raggiungere la pagina speciale **Special:SparqlResultFormat** per vedere la documentazione sull'utilizzo delle magic words e dei vari parametri.

5) Enjoy!