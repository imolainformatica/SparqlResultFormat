spqlib.util = (function () {
	var my = { };
	
	/**
    * aggiunge in testa i prefissi con i vari namespace in modo che non debbano essere ripetuti in ogni query
    **/
	my.addPrefixes = function (sparql, prefixes) {
		if (prefixes) {
			var prefs = "";
			for (var i = 0; i < prefixes.length; i++) {
				var obj = prefixes[i];
				prefs += "prefix " + obj.pre + ":<" + obj.ns + ">\n";
			}
			return prefs + "\n" + sparql;
		} else {
			return sparql;
		}
	};
	
	my.htmlEncode = function (value){
	  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
	  //then grab the encoded contents back out.  The div never exists on the page.
	  return $('<div/>').text(value).html();
	};	
	
	my.cutLongLabel = function (value,maxLength, maxWordLength){
			if (!maxLength){
				maxLength = 30; //sparqlLib.CONSTANTS.DEFAULT_LABEL_MAX_LENGTH;
			}
			if (value){
				value = this.splitLongWords(value,maxWordLength);
				if (value.length>maxLength){
						return value.substring(0,maxLength)+"...";
				} else {
					return value;
				}
			}
		},

		my.splitLongWords =	function (value, maxWordLength){
			if (value){
					if (!maxWordLength){
						maxWordLength=12; //sparqlLib.CONSTANTS.DEFAULT_WORD_MAX_LENGTH;
					}
					var words = value.split(" ");
					var res = "";
					for (var i = 0; i < words.length; i++) {
							if (words[i].length > maxWordLength){
								var n = words[i].length / maxWordLength;
								var a = words[i];
								var b = '\n';
								for (var j = 0; j < n; j++) {	
									a = [a.slice(0, maxWordLength*(j+1)+j), b, a.slice(maxWordLength*(j+1)+j)].join('');
								}
								res+=a+" ";
							} else {
								res +=words[i]+" ";
							}					
					}
					return res.trim();
			}	
		};
		
		/**
		 * simple function for cloning objects
		 */
		my.cloneObject = function(obj) {
			var clone = {};
			for(var i in obj) {
				if (Array.isArray(obj[i])){
					clone[i]=[];
					for (var j=0;j<obj[i].length;j++){
						clone[i][j] = spqlib.util.cloneObject(obj[i][j]);
					}
				} else if(typeof(obj[i])=="object" && obj[i] != null) {
					clone[i] = spqlib.util.cloneObject(obj[i]);
				} else {
					clone[i] = obj[i];
				}
			}
			if (!i){ //tipo semplice
				return obj;
			} else {
				return clone;
			}
		};

        	
        
        /**
		 * effettua la chiamata asincrona all'endpoint sparql. al termine viene
		 * richiamata la funzione di callback passata come parametro
		 */
        my.doQuery = function query(endpoint, sparql, successCallback, configuration,preQueryCallback,failCallback) {
        	var mime = "application/sparql-results+json";
			/*if (configuration.format && configuration.format=="csv"){
				mime = "text/csv";
			} */
        	//mettere loading
			if (preQueryCallback && typeof preQueryCallback=="function"){
				preQueryCallback(configuration);
			}
			var basicAuthBase64String = configuration.basicAuthBase64String || false; 
        	var jqxhr = $.ajax({
					url:endpoint,
					type:'POST',
					beforeSend: function(xhr) {
						if (basicAuthBase64String){
							xhr.setRequestHeader('Authorization', 'Basic ' + basicAuthBase64String);
						}
						xhr.setRequestHeader("Accept", mime);
					},
					data:{query:sparql}
        	}).done(function(json) {
        		successCallback(json, configuration);
        	}).fail(function(jqXHR, textStatus, errorThrown) {
				if (failCallback && typeof failCallback=="function"){
					failCallback(configuration,jqXHR,textStatus);
				}
        	}).always(function() {
        	});
        	// Set another completion function for the request above
        	jqxhr.always(function() {
        	});
        };
		
	my.generateErrorBox = function(message) {
		var html = "<div class='alert alert-danger' role='alert'><span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span><span class='sr-only'>Error:</span>"
				+ message + "</div>";
		return html;
	}
		
	
	my.getSparqlFieldValue = function(field){
		if (field){
			return field.value;
		} else {
			return "";
		}
	}
	
	my.getSparqlFieldValueToNumber = function(field){
		if (field){
			return Number(field.value);
		} else {
			return "";
		}
	}

	

	return my;
}());