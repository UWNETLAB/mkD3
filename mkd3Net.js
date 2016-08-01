var w = 800;
var h = 400;
var outerPadding = 70;
var relWidth = 0.8;
var rpysFile = undefined;
var citFile = undefined;
var ShowToolTip = true;
var radius = 20;
var height = w;
var width = w;

function CitationGraph(edgeFile, nodeFile){

  // This will need to include initDiv, etc.
  // Create SVG element
  var svg = d3.select("div")
              .style("padding-bottom", "80%")
              .append("svg")
              .attr("id", "networkPlot")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 800 800")
              .classed("svg-content", true);
              // .attr("width", width)
              // .attr("height", height);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
                     .alphaDecay(0.1)
                     .force("link", d3.forceLink().id(function(d) {
                       return d.ID;
                     })
                     .distance([10]))
                     .force("charge", d3.forceManyBody().strength([-8]))
                     .force("collide", d3.forceCollide().radius([1]))
                     .force("x", d3.forceX(width / 2))
                     .force("y", d3.forceY(height / 2))
                     .force("center", d3.forceCenter(width/2, height/2));

  d3.csv(nodeFile, function(error, nodes){
  if (error){
  console.log(error);
  } else {
  d3.csv(edgeFile, row, function(error, edges){
  if (error){
    console.log(error);
  } else {
    assignDegree(edges, nodes);
    initToolTip();

    // Create a scale for the radius
    var rScale = d3.scaleLinear()
                   .domain([0,
                            d3.max(nodes, function(d){return d.degree;})])
                  //  .range([width/Math.sqrt(nodes.length)/20, width/Math.sqrt(nodes.length)/5]);
                   .range([3, 20]);

    // Create the links (aka edges)
    var link = svg.append("g")
                  .attr("class", "links")
                  .selectAll("line")
                  .data(edges)
                  .enter()
                  .append("line")
                  .attr("stroke-width", 2);

    // Create the nodes
    var node = svg.append("g")
                  .attr("class", "nodes")
                  .selectAll("circle")
                  .data(nodes)
                  .enter()
                  .append("circle")
                  .classed("hidden", function(d){if(d.degree == undefined){return true;}else return false})
                  // .attr("r", function(d){if(d.degree == undefined){return 3;}else{return d.degree/4 + 3;}})
                  .attr("r", function(d){
                    if (d.degree != undefined){
                      return rScale(d.degree);
                    } else {
                        return rScale(0);
                    }})
                  .attr("fill", "steelblue")
                  .on("mouseover", function(d){
                    d3.select(this)
                      .attr("fill", "pink")

                    // Fix the node's position
                    d.fx = d.x;
                    d.fy = d.y;

                    // Make tooltip
                    var xPos = event.clientX + 20;
                    var yPos = event.clientY - 20;
                    makeNetworkToolTip(xPos, yPos, d);

                    // Repel nodes
                    repelNodes(simulation, d);
                  })
                  .on("mouseout", function(d){
                    d3.select(this)
                      .attr("fill", "steelblue");

                    // Unfix the node's position
                    d.fx = null;
                    d.fy = null;

                    // Remove the tooltip
                    d3.select("#tooltip")
                      .classed("hidden", true);

                    simulation.force("collide", d3.forceCollide().radius([1]));
                    simulation.alphaTarget(0).restart();

                  })

    simulation
         .nodes(nodes)
         .on("tick", ticked);

    simulation
         .force("link")
         .links(edges)
        //  .distance(function(d){return 40;})s
         .distance([width/Math.sqrt(nodes.length)]); // Relative Distance

    simulation
         .force("charge")
         .strength(function(d){
           if(d.degree != undefined){
             return -width/1.5/Math.sqrt(nodes.length);
           } else {
             return -1;
           }})

    simulation
         .force("collide")
         .radius(function(d){
           if (d.degree != undefined){
             return rScale(d.degree);
           } else {
               return rScale(0);
           }})

    // simulation
    //     .force("x")
    //     .strength([0])
    //
    // simulation
    //     .force("y")
    //     .strength([0])

    function ticked() {
      link
         .attr("x1", function(d) { return d.source.x; })
         .attr("y1", function(d) { return d.source.y; })
         .attr("x2", function(d) { return d.target.x; })
         .attr("y2", function(d) { return d.target.y; });

      node
         .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
         .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height- radius, d.y)); });
    }

    makeNetworkIcons(svg);
  }})
  }});
}

// This function was garnered from d3js.org/d3.v4.js
// Citation here
function map$1(object, f){
  var map = new Map;

  // Copy the constructor
  if (object instanceof Map) object.each(function(value, key){map.set(key,value);});

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
  var i = -1;
  var n = object.length;
  var o;

  if (f == null) while (++i <n) map.set(i, object[i]);
  else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to a map
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

function assignDegree(edges, nodes){
  var nodeById = map$1(nodes, function(d){return d.ID;})

  // Assign Degree to nodes
  for (var e = 0; e < edges.length; e++){
    // Add to the source's degree and outdegree
    source = edges[e].source;
    deg = nodeById.get(source).degree;
    odeg = nodeById.get(source).degreeO;
    if (deg == undefined && odeg == undefined){
      nodeById.get(source).degree = 1;
      nodeById.get(source).degreeO = 1;
    } else if (deg != undefined && odeg == undefined){
      nodeById.get(source).degree += 1;
      nodeById.get(source).degreeO = 1;
    } else if (deg != undefined && odeg != undefined){
      nodeById.get(source).degree += 1;
      nodeById.get(source).degreeO += 1;
    }

    // Add to the target's degree and indegree
    target = edges[e].target;
    deg = nodeById.get(target).degree;
    ideg = nodeById.get(target).degreeI;
    if (deg == undefined && ideg == undefined){
      nodeById.get(target).degree = 1;
      nodeById.get(target).degreeI = 1;
    } else if (deg != undefined && ideg == undefined){
      nodeById.get(target).degree += 1;
      nodeById.get(target).degreeI = 1;
    } else if (deg != undefined && ideg != undefined){
      nodeById.get(target).degree += 1;
      nodeById.get(target).degreeI += 1;
    }

  }
}

function initToolTip(){
  var divToolTip = document.createElement('div');
  var paragraph = document.createElement('p');
  var sp = document.createElement('span');
  sp.id = "value";

  paragraph.appendChild(sp);
  divToolTip.appendChild(paragraph);
  document.body.appendChild(divToolTip);
  divToolTip.id = "tooltip";
  divToolTip.className = "hidden";
}

function makeNetworkToolTip(xPos, yPos, d){
  // Update the tooltip position and values
  d3.select("#tooltip")
    .style("left", xPos + "px")
    .style("top", yPos + "px")
    .select("#value")
    .html("<strong>" + d.ID + "</strong><br/>" +
          "Degree: <strong>" + getAttr("degree") + "</strong><br/>" +
          "In Degree: <strong>" + getAttr("degreeI") + "</strong><br/>" +
          "Out Degree: <strong>" + getAttr('degreeO') + "</strong>")

  function getAttr(type){
    if (d[type] == undefined){return 0;}
    else {return d[type]}
  }

  // Show the tooltip
    d3.select("#tooltip").classed("hidden", false);
}

function repelNodes(simulation, d){
  simulation.force("collide", d3.forceCollide().radius(function(d2){
              if (d2.ID == d.ID){return 30;}
              else {return 1;}
            }))

  if (!d3.event.active){
    simulation.alphaTarget(0.3).restart();
  }
}

function makeNetworkIcons(svg){
  var showIsolates = false;

  function isolatesButton(selection){
    infox = 0;
    infoy = 0;

    selection
      .append("text")
      .attr("id", "showHideText")
      .text("Show Isolates")
      .attr("x", infox)
      .attr("y", infoy)
      .attr("font-size", "24px");
  }


  svg.append("g")
     .call(isolatesButton)
     .attr("class", "info icon")
     .attr("transform", "translate(600,20)")
     .on("click", function(d){
       if (showIsolates == false){
         // Set showIsolates to false
         showIsolates = true;
         // Show the Isolates
         svg.selectAll("circle")
            .classed("hidden", false);
         // Change the icon to greyscale

         // Change the text to 'Hide Isolates'
         d3.select(this)
           .select("#showHideText")
           .text("Hide Isolates")
       } else {
         // Set showIsolates to false
         showIsolates = false;
         // Show the Isolates
         svg.selectAll("circle")
            .classed("hidden", function(d){if(d.degree == undefined){return true;}else return false});
         // Change the icon to greyscale

         // Change the text to 'Hide Isolates'
         d3.select(this)
           .select("#showHideText")
           .text("Show Isolates")

       }
     })
}

function row(d){
  // console.log(d);
  return {
     source: d.From,
     target: d.To
   };
}
