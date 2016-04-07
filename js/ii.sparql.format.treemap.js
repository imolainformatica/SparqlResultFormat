spqlib.treemap = (function () {
	var my = { };
	/**
	 * funzione di callback di default dopo la chiamata ajax all'endpoint sparql.  
	 */
	my.chartImpl = function () {
		return spqlib.d3();
	}
	
	my.exportAsImage = function(){
	}
	
	my.toggleFullScreen = function(graphId){

	}
	
	my.preQuery = function(configuration){
		$("#"+configuration.divId+"-legend").hide();
		if (configuration.spinnerImagePath){
			$("#"+configuration.divId).html("<div class='loader'><img src='"+configuration.spinnerImagePath+"' style='vertical-align:middle;'></div>");
		} else {
			$("#"+configuration.divId).html("Loading...");
		}
	}
	
	my.failQuery = function(configuration,jqXHR,textStatus){
		$("#"+configuration.divId).html("");
		$("#"+configuration.divId).html(spqlib.util.generateErrorBox(textStatus));
		throw new Error("Error invoking sparql endpoint "+textStatus+" "+JSON.stringify(jqXHR));
	}
	
	my.render = function (json, config) {
		$("#"+config.divId+"-legend").show();
		$("#"+config.divId).html("");
		var head = json.head.vars;
		var data = json.results.bindings;
		if (!head || head.length<2){
			throw "Too few fields in sparql result. Need at least 2 columns";
		}
		var parent_label_field = head[0];
		var child_label_field = head[1];
		var value_field = (head[2] ? head[2] : false);
		var obj = {};
		
		for (var i = 0; i < data.length; i++) {
			var parent = spqlib.util.getSparqlFieldValue(data[i][parent_label_field]);
			if (!obj[parent]){
				obj[parent]={name:parent, children:[]}
			}
			var child = spqlib.util.getSparqlFieldValue(data[i][child_label_field]);
			var val = 1;
			if (value_field){
				val = spqlib.util.getSparqlFieldValueToNumber(data[i][value_field]);
				if (val==""){val=1;}
			}
			if (!obj[child]){
				obj[child]={name:parent, children:[],value:val}
			}
			obj[parent].children.push(child);
		}
		var root = config.rootElement;
		var res = createStructure(root,obj,config);
		var chartId = config.divId;
		var chart = {
			res:res,
			config:config,
			resize:spqlib.treemap.chartImpl().drawTreemap
		}
		spqlib.treemap.chartImpl().drawTreemap(res,config);
		spqlib.addToRegistry(chartId,chart); 
	}
	
	function createStructure(elem,obj,config){
		var res = {name:elem,children:[]};
		if (obj[elem].children.length==0){
			//è una foglia
			var url="";
			var linkPattern = config.leavesLinkPattern;
			if (linkPattern){
				url = spqlib.util.formatString(linkPattern,elem);
			} else if (config.linkBasePath){
				url = config.linkBasePath+elem;
			}
			return {name:elem,value:obj[elem].value,url:url};
		}
		for (var i = 0; i < obj[elem].children.length; i++) {
			var child = obj[elem].children[i];
			res.children.push(createStructure(child,obj,config));		
		}
		return res;
	}
	

	return my;
}());