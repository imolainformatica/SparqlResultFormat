var spqlib = ( function ( $, undefined ) {
	'use strict';
	
    var VERSION = "0.0.1";
	
	var reg = [];

	function sparql2Table(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.table.renderTable, config,spqlib.table.preQuery,spqlib.table.failQuery);
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
		var splitQueryByUnion = config.splitQueryByUnion || false;
		if (splitQueryByUnion) {
			var queries = spqlib.util.splitQueryByUnion(config.sparqlWithPrefixes);
			var step = 100/(queries.length);
			config.step = step;
			
			$( "#"+config.divId).on( "done", function() {
				var progress = 0 + step;
				var idContainer = config.divId+"-container";
				var progressBar = $( "#"+idContainer).next().find(".progress-bar");
				var currentProgress = parseInt(progressBar.attr("aria-valuenow"));
				var newProgress = currentProgress + parseInt(config.step);
				if (100 - newProgress < config.step){
					newProgress = 100;
				}
				progressBar.attr("aria-valuenow",newProgress);
				var perc = newProgress+"%";
				progressBar.css("width",perc);
				progressBar.text(perc);
				var i=1; 
				if (queries[i]){
					spqlib.util.doQuery(config.endpoint, queries[i], spqlib.graph.addNodes, config,null,spqlib.graph.failQuery);
				} else {
					$( "#"+ config.divId+"-container").next().hide();
				}
				//serializzo le chiamate 
				$( "#"+config.divId).on( "singleQueryDone", function() {
					i++;
					if (queries[i]){
						spqlib.util.doQuery(config.endpoint, queries[i], spqlib.graph.addNodes, config,null,spqlib.graph.failQuery);
					} else {
						//nascondo la progress bar
						$( "#"+ config.divId+"-container").next().hide();
					}
				});
			});
			if (queries.length>0){
				spqlib.util.doQuery(config.endpoint, queries[0], spqlib.graph.render, config,spqlib.graph.preQuery,spqlib.graph.failQuery);
			}
		} else {
			spqlib.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.graph.render, config,spqlib.graph.preQuery,spqlib.graph.failQuery);
		}
	}
	
	function sparql2BarChart(config){
		var chartId = config.divId;
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		parseExtraOptions(config);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.barchart.render, config,spqlib.barchart.preQuery,spqlib.barchart.failQuery);
	}
	
	function sparql2PieChart(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		parseExtraOptions(config);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.piechart.render, config);
	}
	
	function sparql2DonutChart(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		parseExtraOptions(config);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.donutchart.render, config);
	}
	
	function sparql2CSV(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.csv.render, config);
	}
	
	function sparql2BubbleChart(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		parseExtraOptions(config);
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.bubblechart.render, config,spqlib.bubblechart.preQuery,spqlib.bubblechart.failQuery);
	}
	
	function sparql2Treemap(config){
		if (!config.sparqlWithPrefixes && config.sparql && config.queryPrefixes){
			config.sparqlWithPrefixes = spqlib.util.addPrefixes(config.sparql,config.queryPrefixes);
		}
		this.util.doQuery(config.endpoint, config.sparqlWithPrefixes, spqlib.treemap.render, config,spqlib.treemap.preQuery,spqlib.treemap.failQuery);
	}
	
	function addToRegistry(id,elem){
		if (elem){
			reg[id]=elem;
		}
	}
	
	function getById(id){
		if (reg[id]){
			return reg[id];
		}
		return;
	}
	
	function parseExtraOptions(config){
		if (!config.extraOptions){
			config.extraOptions={};
		}
		if (config.extraOptionsString){
			config.extraOptions = spqlib.util.splitPropertySet(config.extraOptionsString);
		} 
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
		sparql2BubbleChart : sparql2BubbleChart,
		sparql2CSV : sparql2CSV,
		sparql2Treemap : sparql2Treemap,
		addToRegistry : addToRegistry,
		getById : getById
		//...other kind of output format here
	};
	
}( jQuery ) );
	



//Alias $j to jQuery for backwards compatibility
window.$j = jQuery;

//Attach to window and globally alias
window.spqlib = spqlib;