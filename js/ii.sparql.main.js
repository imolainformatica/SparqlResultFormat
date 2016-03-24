var spqlib = ( function ( $, undefined ) {
	'use strict';
	
    var VERSION = "0.0.1";

	function sparql2Table(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.table.renderTable, config);
	}
	
	function sparql2GraphExplorer(config){
		spqlib.graph.initHtml(config);
		if (config.rootElement && !config.sparql){
			config.sparql=spqlib.graph.generateInitialQuery(config.rootElement);
		}
	    config.globalConfiguration=createColorConfiguration(config.nodeConfiguration,config.edgeConfiguration);
		config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.graph.renderGraphExplorer, config);
	}
	
	function sparql2Graph(config){
		spqlib.graph.initHtml(config);
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.graph.render, config,spqlib.graph.preQuery,spqlib.graph.failQuery);
	}
	
	function sparql2BarChart(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.barchart.render, config);
	}
	
	function sparql2PieChart(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.piechart.render, config);
	}
	
	function sparql2DonutChart(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.donutchart.render, config);
	}
	
	function sparql2CSV(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.csv.render, config);
	}

	
	function createColorConfiguration(nodeConfiguration, edgeConfiguration) {

		var colorConf = [];
		for (var i = 0; i < nodeConfiguration.length; i++) {
			var cat = nodeConfiguration[i];
			colorConf[cat.category] = {
				name : cat.category,
				group : 'node',
				color : cat.nodeColor
			};
			if (cat.explore) {
				colorConf[cat.category].explore = cat.explore;
			}
		}
		for (var i = 0; i < edgeConfiguration.length; i++) {
			var rel = edgeConfiguration[i];
			colorConf[rel.relation] = {
				name : rel.relation,
				group : 'edge',
				color : rel.edgeColor
			};
		}
		return colorConf;
	}
	

		return {
		VERSION : VERSION,
		sparql2Table : sparql2Table,
		sparql2Graph : sparql2Graph,
		sparql2GraphExplorer : sparql2GraphExplorer,
		sparql2BarChart : sparql2BarChart,
		sparql2PieChart : sparql2PieChart,
		sparql2DonutChart : sparql2DonutChart,
		sparql2CSV : sparql2CSV
		//...other kind of output format here
	};
	
}( jQuery ) );
	



//Alias $j to jQuery for backwards compatibility
window.$j = jQuery;

//Attach to window and globally alias
window.spqlib = spqlib;