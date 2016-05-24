# Changelog

## 1.0.5
24/05/2016
aggiunto loader e messaggio di errore in sparql2bubble e sparql2piechart
cambiato modo di caricamento lato client in modo da essere compatibile con mediawiki 1.26


## 1.0.4
23/05/2016
aggiunta magic word smwSparqlDefaultGraph per leggere da template il valore della variabile $smwgSparqlDefaultGraph di semantic mediawiki

## 1.0.3
18/05/2016
sparql2graph: corretta gestione delle istanze appartenenti a più di una categoria

## 1.0.2
18/05/2016

sparql2graph: aggiunto controllo per evitare di aggiungere 2 volte lo stesso arco (tale situazione capita quando il parent o il child appartengono a più di una categoria)


## 1.0.1
11/05/2016

Corretto gestione caratteri strani in query sparql in sparql2graph
Corretto stile css contenitore legenda in sparql2graph


## 1.0.0
06/05/2016

Prima versione dell'estensione: Supporta 8 formati di output: BarChart, PieChart, BubbleChart, DonutChart, Treemap, Graph, Html Table e CSV