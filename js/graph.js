function incomingEdgesCount(node,edges){
	var count = 0 ;
	for(var i=0;i<edges.length;i++){
		if(edges[i].target.name==node){
			count += 1;
		}
	}
	return count;
}

function outgoingEdgesCount(node,edges){
	var count = 0 ;
	for(var i=0;i<edges.length;i++){
		if(edges[i].source.name==node){
			count += 1;
		}
	}
	return count;
}

function drawGraph(){
	function graphVizZoom() {
	  graphZoomContainer.attr("transform","translate(" + d3.event.translate + ")"+ " scale(" + d3.event.scale + ")");
	}	
	var links = [
	  {source: "Microsoft", target: "Amazon", type: "suit", weight: "10"},
	  {source: "Microsoft", target: "HTC", type: "suit", weight: "20"},
	  {source: "Samsung", target: "Apple", type: "suit", weight: "5"},
	  {source: "Motorola", target: "Apple", type: "suit", weight: "50"},
	  {source: "Nokia", target: "Apple", type: "suit", weight: "10"},
	  {source: "HTC", target: "Apple", type: "suit", weight: "14"},
	  {source: "Kodak", target: "Apple", type: "suit", weight: "10"},
	  {source: "Microsoft", target: "Barnes & Noble", type: "suit", weight: "25"},
	  {source: "Microsoft", target: "Foxconn", type: "suit", weight: "30"},
	  {source: "Oracle", target: "Google", type: "suit", weight: "30"},
	  {source: "Apple", target: "HTC", type: "suit", weight: "10" },
	  {source: "Microsoft", target: "Inventec", type: "suit", weight: "10"},
	  {source: "Samsung", target: "Kodak", type: "suit", weight: "10"},
	  {source: "LG", target: "Kodak", type: "suit", weight: "10"},
	  {source: "RIM", target: "Kodak", type: "suit", weight: "20"},
	  {source: "Sony", target: "LG", type: "suit", weight: "10"},
	  {source: "Kodak", target: "LG", type: "suit", weight: "2"},
	  {source: "Apple", target: "Nokia", type: "suit", weight: "35"},
	  {source: "Qualcomm", target: "Nokia", type: "suit", weight: "40"},
	  {source: "Apple", target: "Motorola", type: "suit", weight: "10"},
	  {source: "Microsoft", target: "Motorola", type: "suit", weight: "10"},
	  {source: "Motorola", target: "Microsoft", type: "suit", weight: "10"},
	  {source: "Huawei", target: "ZTE", type: "suit", weight: "20"},
	  {source: "Ericsson", target: "ZTE", type: "suit", weight: "10"},
	  {source: "Kodak", target: "Samsung", type: "suit", weight: "15"},
	  {source: "Apple", target: "Samsung", type: "suit", weight: "30"},
	  {source: "Kodak", target: "RIM", type: "suit", weight: "15"},
	  {source: "Nokia", target: "Qualcomm", type: "suit", weight: "10"},
	  {source: "Nokia", target: "Nokia", type: "suit", weight: "10"}
	];

	var nodes = {};

	var scale = d3.scale.linear().domain([2,50]).range([1,8]);
	// Compute the distinct nodes from the links.
	links.forEach(function(link) {
	  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
	  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
	});
	
	var width = document.getElementById("graphviz").offsetWidth,
	    height = document.getElementById("sidepanel").offsetHeight;

	var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", graphVizZoom);


	var force = d3.layout.force()
	    .nodes(d3.values(nodes))
	    .links(links)
	    .size([width, height])
	    .linkDistance(100)
	    .charge(-300)
	    .on("tick", tick)
	    .start();

	var svg = d3.select("#graphviz").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .call(zoom)
	    .on("dblclick.zoom", null);

	var graphZoomContainer = svg.append("g").attr("class","graphzoomcontainer");
	// Per-type markers, as they don't inherit styles.
	graphZoomContainer.append("defs").selectAll("marker")
	    .data(["suit", "licensing", "resolved"])
	  	.enter().append("marker")
	    .attr("id", function(d) { return d; })
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 15)
	    .attr("refY", 0)
	    .attr("markerWidth", 12)
	    .attr("markerHeight", 12)
	    .attr("orient", "auto")
	    .attr("markerUnits","userSpaceOnUse")
	  	.append("path")
	  	.style("fill","brown")
	    .attr("d", "M0,-5L10,0L0,5");

	var path = graphZoomContainer.append("g").selectAll("path")
	    .data(force.links())
	  	.enter().append("path")
	    .attr("class", "link")
	    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
	    .style("stroke-width",function(d){
	    	return scale(parseInt(d.weight));
	    });

	var circle = graphZoomContainer.append("g").selectAll("circle")
	    .data(force.nodes())
	  	.enter().append("circle")
	    .attr("r", 6)
	    .call(force.drag)
	    .on("mouseover",function(d){
			path.transition().duration(1000).style("opacity",function(o){
				if(o.source.name==d.name){
					return 1;
				}else{
					return 0.2;
				}
			});	    
	    })
	    .on("mouseout",function(){
	    	path.transition().duration(500).style("opacity",1);
	    })
	    .style("cursor","pointer")
	    .on("click",function(d){
	    	$("#selectedstationname").text(d.name);
	    	var inDegree = incomingEdgesCount(d.name,links);
	    	var outDegree = outgoingEdgesCount(d.name,links);
	    	$("#selectedstationindegree").text(inDegree);
	    	$("#selectedstationoutdegree").text(outDegree);
	    });

	var text = graphZoomContainer.append("g").selectAll("text")
	    .data(force.nodes())
	  	.enter().append("text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .text(function(d) { return d.name; });

	// Use elliptical arc path segments to doubly-encode directionality.
	function tick() {
	  path.attr("d", linkArc);
	  circle.attr("transform", transform);
	  text.attr("transform", transform);
	}

	function linkArc(d) {
	  /*var dx = d.target.x - d.source.x,
	      dy = d.target.y - d.source.y,
	      dr = Math.sqrt(dx * dx + dy * dy);
	  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	  */
	  var x1 = d.source.x,
          y1 = d.source.y,
          x2 = d.target.x,
          y2 = d.target.y,
          dx = x2 - x1,
          dy = y2 - y1,
          dr = Math.sqrt(dx * dx + dy * dy),

          drx = dr,
          dry = dr,
          xRotation = 0,
          largeArc = 0,
          sweep = 1;

          // Self edge.
          if ( x1 === x2 && y1 === y2 ) {
            xRotation = 45;

            largeArc = 1;

            drx = 15;
            dry = 9;
            
            x2 = x2 + 1;
            y2 = y2 + 1;                      
          } 

     return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
	}

	function transform(d) {
	  return "translate(" + d.x + "," + d.y + ")";
	}

	d3.select("#somefilter").on("change",function(){
		updateViz();		
	});

	function updateViz(){
		path.remove();
		circle.remove();
		text.remove();

		links = [
		  {source: "Kodak", target: "Samsung", type: "suit", weight: "15"},
		  {source: "Apple", target: "Samsung", type: "suit", weight: "30"},
		  {source: "Kodak", target: "RIM", type: "suit", weight: "15"},
		  {source: "Nokia", target: "Qualcomm", type: "suit", weight: "10"}	  
		];
		
		nodes = {};

		links.forEach(function(link) {
		  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
		  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		});
		
		force = d3.layout.force()
			    .nodes(d3.values(nodes))
			    .links(links)
			    .size([width, height])
			    .linkDistance(60)
			    .charge(-300)
			    .on("tick", tick)
			    .start();

		graphZoomContainer.append("defs").selectAll("marker")
	    .data(["suit", "licensing", "resolved"])
	    .enter().append("marker")
	    .attr("id", function(d) { return d; })
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 15)
	    .attr("refY", 0)
	    .attr("markerWidth", 12)
	    .attr("markerHeight", 12)
	    .attr("orient", "auto")
	    .attr("markerUnits","userSpaceOnUse")
	  	.append("path")
	  	.style("fill","brown")
	    .attr("d", "M0,-5L10,0L0,5");

		path = graphZoomContainer.append("g").selectAll("path")
		    .data(force.links())		    
		  	.enter().append("path")
		    .attr("class", function(d) { return "link " + d.type; })
		    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
		    .style("stroke-width",function(d){
		    	return scale(parseInt(d.weight));
		    });

		circle = graphZoomContainer.append("g").selectAll("circle")
		    .data(force.nodes())
		  	.enter().append("circle")
		    .attr("r", 6)
		    .call(force.drag)
		    .on("mouseover",function(d){
			path.transition().duration(1000).style("opacity",function(o){
				if(o.source.name==d.name){
					return 1;
				}else{
					return 0.2;
				}
			});	    
		    })
		    .on("mouseout",function(){
		    	path.transition().duration(500).style("opacity",1);
		    })
		    .style("cursor","pointer")
		    .on("click",function(d){
		    	$("#selectedstationname").text(d.name);
		    	var inDegree = incomingEdgesCount(d.name,links);
		    	var outDegree = outgoingEdgesCount(d.name,links);
		    	$("#selectedstationindegree").text(inDegree);
		    	$("#selectedstationoutdegree").text(outDegree);
		    });


		text = graphZoomContainer.append("g").selectAll("text")
		    .data(force.nodes())
		  	.enter().append("text")
		    .attr("x", 8)
		    .attr("y", ".31em")
		    .text(function(d) { return d.name; });

		// Use elliptical arc path segments to doubly-encode directionality.
		function tick() {
		  path.attr("d", linkArc);
		  circle.attr("transform", transform);
		  text.attr("transform", transform);
		}

		function linkArc(d) {
			  var x1 = d.source.x,
	          y1 = d.source.y,
	          x2 = d.target.x,
	          y2 = d.target.y,
	          dx = x2 - x1,
	          dy = y2 - y1,
	          dr = Math.sqrt(dx * dx + dy * dy),

	          drx = dr,
	          dry = dr,
	          xRotation = 0,
	          largeArc = 0,
	          sweep = 1;

	          // Self edge.
	          if ( x1 === x2 && y1 === y2 ) {
	            xRotation = 45;

	            largeArc = 1;

	            drx = 15;
	            dry = 9;
	            
	            x2 = x2 + 1;
	            y2 = y2 + 1;                      
	          } 

	     	return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
		}

		function transform(d) {
		  return "translate(" + d.x + "," + d.y + ")";
		}

	}

}