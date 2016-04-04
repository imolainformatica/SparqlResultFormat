
(function(spqlib, $) {

	var t = [];
	
	
	spqlib.d3 = (function(){
		
		var defaultMousemove = function(d) {
		  var xPosition = d3.event.pageX + 5;
		  var yPosition = d3.event.pageY + 5;

		  d3.select("#tooltip")
			.style("left", xPosition + "px")
			.style("top", yPosition + "px");
		  d3.select("#tooltip-text")
			.html("<span class='treemap-tooltip-instance-name'>"+d["name"]+"</span> </br>Value: "+d["value"]);
		  d3.select("#tooltip").classed("hidden", false);
		};
		
		var defaultMouseout = function() {
		    d3.select("#tooltip").classed("hidden", true);
		};
		
		var defaultLeavesClickCallback = function(d) { 
			if(!d.children){
				window.open(d.url); 
			}
		}

	    function drawTreemap(res,config){
			$("#"+config.divId).html("");
			var margin = {top: 40, right: 0, bottom: 0, left: 0};
			var width = $("#"+config.divId).outerWidth(true);
			var height = $("#"+config.divId).outerHeight(true)- margin.top - margin.bottom;
			//width = config.width || 960,
			//height = config.height || 500 ,
			var formatNumber = d3.format(",d");
			var transitioning;
			var x = d3.scale.linear()
				.domain([0, width])
				.range([0, width]);

			var y = d3.scale.linear()
				.domain([0, height])
				.range([0, height]);
				
			var treemap = d3.layout.treemap()
				.children(function(d, depth) { return /*depth ? null :*/ d._children; })
				.sort(function(a, b) { return a.value - b.value; })
				.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
				.round(false);
				

			

							
			var svg = d3.select("#"+config.divId).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.bottom + margin.top)
				.style("margin-left", -margin.left + "px")
				.style("margin.right", -margin.right + "px")
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.style("shape-rendering", "crispEdges");
				
			var grandparent = svg.append("g")
				.attr("class", "grandparent");

			grandparent.append("rect")
				.attr("y", -margin.top)
				.attr("width", width)
				.attr("height", margin.top);

			grandparent.append("text")
				.attr("x", 6)
				.attr("y", 6 - margin.top)
				.attr("dy", ".75em");
				
			setTimeout(function(root) {
				  initialize(res);
				  accumulate(res);
				  layout(res);
				  display(res,true);

				  function initialize(root) {
					root.x = root.y = 0;
					root.dx = width;
					root.dy = height;
					root.depth = 0;
				  }

				  // Aggregate the values for internal nodes. This is normally done by the
				  // treemap layout, but not here because of our custom implementation.
				  // We also take a snapshot of the original children (_children) to avoid
				  // the children being overwritten when when layout is computed.
				  function accumulate(d) {
					return (d._children = d.children)
						? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
						: d.value;
				  }

				  // Compute the treemap layout recursively such that each group of siblings
				  // uses the same size (1×1) rather than the dimensions of the parent cell.
				  // This optimizes the layout for the current zoom state. Note that a wrapper
				  // object is created for the parent node for each group of siblings so that
				  // the parent’s dimensions are not discarded as we recurse. Since each group
				  // of sibling was laid out in 1×1, we must rescale to fit using absolute
				  // coordinates. This lets us use a viewport to zoom.
				  function layout(d) {
					if (d._children) {
					  treemap.nodes({_children: d._children});
					  d._children.forEach(function(c) {
						c.x = d.x + c.x * d.dx;
						c.y = d.y + c.y * d.dy;
						c.dx *= d.dx;
						c.dy *= d.dy;
						c.parent = d;
						layout(c);
					  });
					}
				  }

				  function display(d,wrap) {
					grandparent
						.datum(d.parent)
						.on("click", transition)
					  .select("text")
						.text(name(d));

					var g1 = svg.insert("g", ".grandparent")
						.datum(d)
						.attr("class", "depth");

					var g = g1.selectAll("g")
						.data(d._children)
					  .enter().append("g");

					  g.attr("class",function(d){ 
						   return spqlib.util.sanitizeString(d.name);
					  });
					  
					g.filter(function(d) { return d._children; })
						.classed("children", true)
						.on("click", transition)
						.on("mousemove", config.mousemoveCallback || defaultMousemove)
						.on("mouseout", config.mouseoutCallback || defaultMouseout);
						
					g.filter(function(d) { return !d._children; })
						.classed("leaves", true);
					g.selectAll(".leaves")
						.on("click", defaultLeavesClickCallback )


					g.selectAll(".child")
						.data(function(d) { return d._children || [d]; })
					  .enter().append("rect")
						.attr("class", "child")
						.call(rect);

					g.append("rect")
						.attr("class", "parent")
						.call(rect)
					  .append("title")
						.text(function(d) { return formatNumber(d.value); });
						
					g.append("text")
						.attr("dy", ".75em")
						.text(function(d) {
							return d.name; 
							})
						.call(text)
						.call(wrap ? wordWrap : empty)
						
					function transition(d) {
						d3.select("#tooltip").classed("hidden", true);
					  var g2 = display(d,false)

					  // Update the domain only after entering new elements.
					  x.domain([d.x, d.x + d.dx]);
					  y.domain([d.y, d.y + d.dy]);

					  // Enable anti-aliasing during the transition.
					  svg.style("shape-rendering", null);

					  // Draw child nodes on top of parent nodes.
					  svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

					  // Fade-in entering text.
					  g2.selectAll("text").style("fill-opacity", 0);
					  g2.selectAll("rect").call(rect);
					  g2.selectAll("text").call(text).call(wordWrap).style("fill-opacity", 1);
						g1.remove();
					}

					return g;
				  }

				  function text(text) {
					text.attr("x", function(d) { 
						return x(d.x) + 6; 
					})
						.attr("y", function(d) {
							return y(d.y) + 6; 
							});
				  }

				  function rect(rect) {
					rect.attr("x", function(d) { 
					return x(d.x); })
						.attr("y", function(d) { 
						return y(d.y); })
						.attr("width", function(d) { 
						return x(d.x + d.dx) - x(d.x); })
						.attr("height", function(d) { 
						return y(d.y + d.dy) - y(d.y); });
				  }
				  
				  function empty(text){
					  //do nothing
				  }
				  
				  function wordWrap(text) {
					  text.each(function() {
						var text = d3.select(this);
						var words = text.text().split(/\s+/).reverse();
						var	word;
						var	line = [];
						var	lineNumber = 0;
						var	lineHeight = 1.1; // ems
						var	y = text.attr("y");
						var	x = text.attr("x");
						var	dy = parseFloat(text.attr("dy"));
						var	tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
						var maxWidth = d3.select(this.previousElementSibling).attr("width");
						var maxHeight = d3.select(this.previousElementSibling).attr("height");
						//devo calcolare la size del rettangolo contenitore
						while (word = words.pop()) {
						  line.push(word);
						  tspan.text(line.join(" "));
						  var tspanHeight = window.getComputedStyle(tspan.node(), null).getPropertyValue("font-size").replace("px","");
						  var altezzaLibera = tspanHeight*(lineNumber+2)+6 < maxHeight;
						  if (!altezzaLibera){
							  line.push("...");
							  tspan.text(line.join(" "));
							  break;
						  }
						  if (tspan.node().getComputedTextLength()+6 > maxWidth && altezzaLibera ) {
							line.pop();
							tspan.text(line.join(" "));
							line = [word];
							tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
						  }
						}
					  });

				  }
				  
				 
				  function name(d) {
					return d.parent
						? name(d.parent) + "." + d.name
						: d.name;
				  }
				},0);
		}
		
		return { 
		     drawTreemap:drawTreemap
		}

	});

}(spqlib, jQuery));











