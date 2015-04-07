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
	
	var links = [];

	var nodes = {};
	//console.log(minWeight,maxWeight)
	var scale = d3.scale.log().domain([1,5]).range([1,4]);
	// Compute the distinct nodes from the links.
	links.forEach(function(link) {
	  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
	  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
	});
	
	var width = document.getElementById("graphviz").offsetWidth,
	    height = document.getElementById("graphviz").offsetHeight;

	var zoom = d3.behavior.zoom()
    .scaleExtent([0.2, 10])
    .on("zoom", graphVizZoom);


	var force = d3.layout.force()
	    .nodes(d3.values(nodes))
	    .links(links)
	    .size([width, height])
	    .linkDistance(150)
	    .charge(-1000)
	    .on("tick", tick)
	    .alpha(-1)
	    .start();

	var svg = d3.select("#graphviz").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .call(zoom)
	    .on("dblclick.zoom", null);

	var graphZoomContainer = svg.append("g").attr("class","graphzoomcontainer");
	// Per-type markers, as they don't inherit styles.
	graphZoomContainer.append("defs").selectAll("marker")
	    .data(["directed"])
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

	d3.select("#applyfilterbutton").on("click",function(){
		updateGraphViz();		
		drawBarChart();
		//d3.select("#donutchart1").append("svg");
		drawDonutChart1();
		drawDonutChart2();
	});

	function updateGraphViz(){
		path.remove();
		circle.remove();
		text.remove();
		//console.log(minWeight,maxWeight)
		
		//links = [];
		//computeLinks();
		computeLinksForDates();
		//console.log(minWeight,maxWeight)
		scale = d3.scale.log().domain([minWeight,maxWeight]).range([1,4]);
		links = globalLinks.slice();
		//console.log(links);

		nodes = {};

		links.forEach(function(link) {
		  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
		  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		});
		
		force = d3.layout.force()
			    .nodes(d3.values(nodes))
			    .links(links)
			    .size([width, height])
			    .linkDistance(150)
	    		.charge(-1000)
			    .on("tick", tick)
			    .alpha(1)
			    .start();

		graphZoomContainer.append("defs").selectAll("marker")
	    .data(["directed", "licensing", "resolved"])
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
		    	//console.log(parseInt(d.weight))
		    	//console.log(scale(parseInt(d.weight)))		    	
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
					return 0.1;
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

function drawBarChart(){

nv.addGraph(function() {
  var chart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
      .tooltips(false)        //Don't show tooltips
      .showValues(true)       //...instead, show the bar value right on top of each bar.
      ;

      

  d3.select('#barchart svg')
      .datum(tempBar)
      .call(chart);

console.log(tempBar)

  nv.utils.windowResize(chart.update);
  //d3.selectAll(".tick").remo();
  return chart;
});

}

function drawDonutChart1(){
	//Donut chart example
nv.addGraph(function() {
  var chart = nv.models.pieChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .showLabels(true)     //Display pie labels
      .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
      .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
      .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
      .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
      ;

    d3.select("#donutchart1 svg")
        .datum(exampleData())
        .transition().duration(350)
        .call(chart);

  return chart;
});

//Pie chart example data. Note how there is only a single array of key-value pairs.
function exampleData() {
  return  [
      { 
        "label": "One",
        "value" : 20
      } , 
      { 
        "label": "Two",
        "value" : 10
      }
    ];
}
}

function drawDonutChart2(){
	//Donut chart example
nv.addGraph(function() {
  var chart = nv.models.pieChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .showLabels(true)     //Display pie labels
      .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
      .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
      .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
      .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
      ;

    d3.select("#donutchart2 svg")
        .datum(exampleData())
        .transition().duration(350)
        .call(chart);

  return chart;
});

//Pie chart example data. Note how there is only a single array of key-value pairs.
function exampleData() {
  return  [
      { 
        "label": "One",
        "value" : 25
      } , 
      { 
        "label": "Two",
        "value" : 5
      }
    ];
}
}