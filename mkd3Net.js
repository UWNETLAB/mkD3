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
var directed;
var weighted;
var darkColour = "#2479C1"
// var lightColour = "#FF9A20";
var lightColour = "#FF8A75"

// var darkColour = "cornflowerblue";
// var lightColour = "#EDBC64"

// var darkColour = "dodgerblue";
// var lightColour = "darkorange";

// var darkColour = "royalblue";
// var lightColour = "#E1B941"

function networkGraph(edgeFile, nodeFile, optionalAttrs = {}){
    // Define Constants
    var plotType = 'network';

    var directed = optionalAttrs['directed'] != undefined ? optionalAttrs['directed'] : false;
    var weighted = optionalAttrs['weighted'] != undefined ? optionalAttrs['weighted'] : true;
    var sizeBy = optionalAttrs['sizeBy'] != undefined ? optionalAttrs['sizeBy'] : "degree";
    var edgeWidth = optionalAttrs['edgeWidth'] != undefined ? optionalAttrs['edgeWidth']: 2;
    var colourBy = optionalAttrs['colourBy'] != undefined ? optionalAttrs['colourBy']: '#2479C1';
    darkColour = colourBy;

    // This initializes the divs everything will be placed into
    initNetworkDivs(plotType)
    initNetworkTable(plotType)
    initToolTip(plotType)
    initConsole(plotType)

    // Create the svg
    var plotName = "#" + plotType + "Plot"
    var svg = d3.select(plotName)
                .style("padding-bottom", "100%")
                .append("svg")
                .attr("id", plotType + "SVG")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 800 800")
                .classed("svg-content", true)

    // Initialize the simulation for the network
    var simulation = d3.forceSimulation()
                       .force("link", d3.forceLink()
                                        .id(function(d){return d.ID})
                                        // .distance(10))
                                        .distance(function(d){return 30 / d.weight}))
                       .force("charge", d3.forceManyBody()
                                          .strength(-8))
                       .force("collide", d3.forceCollide().radius([1]))
                       .force("x", d3.forceX(width/2))
                       .force("y", d3.forceY(height/2))
                       .force("center", d3.forceCenter(width/2, height/2));

    // Add icons
    makeIcons(svg, "steelblue", plotType)

    // Data Functions
    // **************
    function edgesRow(d){
      d.source= d.From;
      d.target= d.To;
      // if(d.weight == undefined ) d.weight=1;
      if(weighted == false || d.weight == undefined ) d.weight=1;
      d.selfRef = (d.From==d.To)
      return d
    }

    function nodesRow(d){
      d.degree= 0;
      if (directed){
        d.degreeIn= 0;
        d.degreeOut= 0;
      }
      return d
    }

    // Read in the edges and nodes and work with them
    d3.csv(nodeFile, nodesRow, function(error, nodes){
      // If there is an error, print it to the console
      if (error){console.log(error)}
      d3.csv(edgeFile, edgesRow, function(error, edges){
        // If there is an error, print it to the console
        if(error){console.log(error)}
        // Define Required Functions
        var nodeById = map$1(nodes, function(d){return d.ID;})

        // Perform Required Node calculations
        nodeCalculations(nodes, edges);

        // Create a scale for the nodes' radii
        // Note: domain depends on sizeBy parameter
        if (typeof(sizeBy) != 'number'){
          var rScale = d3.scaleLinear()
                         .domain([0, d3.max(nodes, function(d){return d[sizeBy]})])
                         .range([3,20])
        } else {
          var rScale = d3.scaleLinear()
                         .domain([sizeBy, sizeBy])
                         .range([sizeBy, sizeBy])
        }

        // Create a scale for the node's colour
        // This colour palette has been adapted from Stephen Few's Book 'Show Me the Numbers'
        var cScale = d3.scaleOrdinal(['#5da5da','#faa43a','#60bd68','#f17cb0',
                                      '#4d4d4d','#b2912f','#decf3f','#f15854', '#ABABAB']);
        // var cScale = d3.scaleOrdinal(d3.schemeCategory20)

        // Create a scale for the edges' opacity (alpha)
        var aScale = d3.scalePow()
                      //  .domain([d3.min(edges, function(d){return d.weight;}),
                      //           d3.max(edges, function(d){return d.weight;})])
                       .domain(d3.extent(edges, function(d){return d.weight;}))
                       .range([0.2, 1])
                       .exponent(8)

        // Create the edges (links) between nodes
        var link = svg.append("g")
                      .attr("class", "links")
                      .attr("id", "links")
                      .selectAll("path")
                      .data(edges)
                      .enter()
                      .append("path")
                      .attr("stroke-width", StrokeWidth(edgeWidth))
                      // .classed("hidden", function(e){return e.weight <= 1 })
                      .style("marker-end",  "url(#end)")
                      .style("opacity", function(d){
                        if (d.weight == undefined){
                          return 0.6;
                        } else {
                          return aScale(d.weight);
                        }
                      })

        // Add Arrows
        if (directed){
          // Create the end markers
          // Code adapted from http://bl.ocks.org/d3noob/5141278
          svg.append("svg:defs").selectAll("marker")
             .data(["end"])      // Different link/path types can be defined here
             .enter().append("svg:marker")    // This section adds in the arrows
             .attr("id", String)
             .attr("viewBox", "0 -5 10 10")
             .attr("refX", 10)
             .attr("refY", 0)
             .attr("markerWidth", 4)
             .attr("markerHeight", 3)
             .attr("orient", "auto")
             .append("svg:path")
             .attr("d", "M0,-5L10,0L0,5")
             .attr("fill", "404040")
             .style("opacity", "0.8")
        }

        // Create the nodes
        var node = svg.append("g")
                      .attr("class", "nodes")
                      .selectAll("circle")
                      .data(nodes)
                      .enter()
                      .append("circle")
                      .attr("fill", "steelblue")
                      .attr("fill", function(d){
                        return nodeAttr(d, colourBy, cScale)
                      })
                      // .classed("hidden", function(d){return d.degree == 0;})
                      .attr("r", function(d){
                        d.radius = nodeAttr(d, sizeBy, rScale);
                        return d.radius;
                      })
                      .on("mouseover", function(d){
                        d3.select(this)
                          .attr("fill", lightColour)

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
                          .attr("fill", nodeAttr(d, colourBy, cScale));

                        // Unfix the node's position
                        d.fx = null;
                        d.fy = null;

                        // Remove the tooltip
                        d3.select("#tooltip")
                          .classed("hidden", true);

                        simulation.force("collide", d3.forceCollide().radius([1]));
                        simulation.alphaTarget(0).restart();
                      })
                      .on("click", function(d){
                        makeNetworkTable(plotType, d.ID, edges)
                      })
                      .call(d3.drag()
                        .on("start", dragStarted)
                        .on("drag", dragged)
                        .on("end", dragEnded));

        // Adjust the simulation

        // Add Tick (progress simulation)
        simulation
             .nodes(nodes)
             .on("tick", ticked);

        // Update the Charge Force
        simulation
             .force("charge")
             .strength(function(d){
               if (d.degree == 0) {return -3}
               var max = d3.max(nodes, function(d){return d.degree})
               var factor = Math.pow(0.999, (6*nodes.length-7500)) + 1;
               return -factor * Math.cos((Math.PI * d.degree)/(max/2))-4;
               return -2500 * Math.cos((Math.PI * d.degree)/(max/2))-4;
             })

        // Update the Link Force
        simulation
              .force("link")
              .links(edges)
              .distance(function(d){
                // Create a link scale
                var lScale = d3.scaleLinear()
                               .domain(d3.extent(edges, function(d){
                                 return (d.source.degree + d.target.degree)/d.weight/d.weight;
                               }))
                               .range([7, width/2])

                // Use filter to copy the edges array
                var sortedEdges = edges.filter(function(d){return true});
                // var sortedEdges = edges;
                // Sort the edges by the sum of node degrees
                sortedEdges.sort(function(a,b){
                  var asum = a.source.degree + a.target.degree;
                  var bsum = b.source.degree + b.target.degree;
                  return asum - bsum;
                })
                // Find the 25th quartile value
                var edgeQuantile25 = d3.quantile(sortedEdges, 0.25, function(d){return d.source.degree + d.target.degree})

                // Use filter to copy the nodes array
                var sortedNodes = nodes.filter(function(d){return true})
                // var sortedNodes = nodes;
                // Sort the nodes by their degree
                sortedNodes.sort(function(a, b){
                  return a.degree - b.degree;
                })
                //Find the 75th quartile value
                var nodeQuantile75 = d3.quantile(sortedNodes, 0.75, function(d){return d.degree})

                // Find the degrees of the connected nodes
                sdeg = d.source.degree;
                tdeg = d.target.degree;
                if (sdeg > nodeQuantile75  && tdeg > nodeQuantile75  && sdeg + tdeg > edgeQuantile25){
                  return lScale((sdeg+tdeg)/d.weight/d.weight);
                }
                //  if (sdeg > 10 && tdeg > 10 && sdeg+tdeg > 30){return ((sdeg + tdeg)/d.weight/d.weight);}
                return Math.min(rScale(sdeg), rScale(tdeg)) +
                       Math.max(rScale(sdeg), rScale(tdeg)) + 5;
              })

        // Simulation Functions
        // ********************
        function ticked() {
          link.attr("d", function(d){
            // Total difference in x and y from source to target
            diffX = d.target.x - d.source.x;
            diffY = d.target.y - d.source.y;

            // Length of path from center of source node to center of target node
            pathLength = Math.sqrt((diffX*diffX)+(diffY*diffY));

            // x and y distances from center to outside edge of target node
            if (pathLength != 0){
              offsetX = (diffX * d.target.radius) / pathLength;
              offsetY = (diffY * d.target.radius) / pathLength;
            } else {
              offsetX = (diffX * d.target.radius);
              offsetY = (diffY * d.target.radius);
            }

            ret = "M" + d.source.x + "," + d.source.y + "L" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
            return ret
          })

          // link
          //    .attr("x1", function(d) { return d.source.x; })
          //    .attr("y1", function(d) { return d.source.y; })
          //    .attr("x2", function(d) { return d.target.x; })
          //    .attr("y2", function(d) { return d.target.y; });

          node
             .attr("cx", function(d) {return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
             .attr("cy", function(d) {return d.y = Math.max(radius, Math.min(height- radius, d.y)); });
        }

      })
    })

    // Drag Functions
    // **************
    function dragStarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragEnded(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

}

// Determines how stroke-width is calculated based on the edgeWidth parameter
function StrokeWidth(edgeWidth){
  if (typeof(edgeWidth) == 'number'){return edgeWidth}
  else {return function(d){return d[edgeWidth]}}
}

// Initialization Functions
// ************************
function initNetworkDivs(plotType){
  // Create the total container
  var container = document.createElement('div');
  container.id = plotType + "Container";
  container.className = "container";

  // Create the Visualization Area
  var visArea = document.createElement('div');
  visArea.id = plotType + "VisArea";
  visArea.className = "visArea";

  // Create the Options Panel
  var panel = document.createElement('div');
  panel.id = plotType + "Panel";
  panel.className = "panel";
  visArea.appendChild(panel);

  // Create the plot
  var plot = document.createElement('div')
  plot.id = plotType + "Plot"
  plot.className = "plot";
  visArea.appendChild(plot);

  container.appendChild(visArea);

  // Create the table
  var table = document.createElement('div')
  table.id = plotType + "TableContainer";
  table.className = "container";

  container.appendChild(table);

  document.body.appendChild(container);
}

// Data Functions
// **************

// Function adapted from d3js.org/d3.v4.js
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

function nodeCalculations(nodes, edges){
  // Find the degree, in-degree, and out-degree of each node and assign it
  degreeCalc(edges, nodes)
}

function degreeCalc(edges, nodes){
  var nodeById = map$1(nodes, function(d){return d.ID;})

  // Assign Degree to nodes
  for (var e = 0; e < edges.length; e++){
    weight = + edges[e].weight;
    // Add to the source's degree
    source = edges[e].source;
    nodeById.get(source).degree += weight;

    // Add to the target's degree
    target = edges[e].target;
    nodeById.get(target).degree += weight;

    // If the graph is directed, add to the in- and out-degrees
    if(directed){
      nodeById.get(target).degreeIn += weight;
      nodeById.get(source).degreeOut += weight;
    }
  }
}

// Table Functions
// ***************
function initNetworkTable(plotType){
  var header = "<thead><tr>" + "<th width=40%><b>Source Node</b></th>" +
                               "<th width=40%><b>Target Node</b></th>" +
                               "<th width=20%><b>Edge Weight</b></th>" +
               "</tr></thead>"

  initTable(plotType, header);

}

function initTable(plotType, header){
  // Initialize the table

  // Find the table container
  var divTable = document.getElementById(plotType + "TableContainer");

  // Create the title
  var title = document.createElement('p');
  title.id = plotType + "TableTitle";
  title.className = "title";
  divTable.appendChild(title);

  // Create the table
  var table = document.createElement('table');
  table.id = plotType + "Table";
  table.border = "0";
  table.cellpadding = "3";
  divTable.appendChild(table);

  // Add them to together and then to the document
  // var plotDiv = document.getElementById(plotType);
  // document.body.insertBefore(divTable, plotDiv.nextSibling);

  var tableName = "#" + plotType + "Table";
  d3.select(tableName)
             .html(header);

  header = d3.select(tableName)
             .html();
}

function makeNetworkTable(plotType, nodeID, edges){
  d3.select("#" + plotType + "TableTitle")
    .html(nodeID)

  var tableName = "#" + plotType + "Table";
  // Copy the header from the html
  header = d3.select(tableName)
             .html().split('<tbody>')[0];

  // Filter the edges
  var data = edges.filter(function(d){
    return d.source.ID == nodeID || d.target.ID == nodeID;
  })

  // Sort edges
  data = data.sort(function(a, b){
    // Sort by nodeID match
    // if (a.source.ID == nodeID && b.source.ID == nodeID) return 0;
    // if (a.source.ID == nodeID && b.source.ID != nodeID) return -1;
    // if (a.source.ID != nodeID && b.source.ID == nodeID) return 1;

    // Sort by source, then target
    // if (a.source.ID < b.source.ID)return -1;
    // if (a.source.ID > b.source.ID)return 1;
    // if (a.target.ID < b.target.ID)return -1;
    // if (a.target.ID > b.target.ID)return 1;
    // return 0;

    // Sort by edge weight, then source node, then target node
    if (b.weight - a.weight != 0) return b.weight - a.weight;
    if (a.source.ID < b.source.ID)return -1;
    if (a.source.ID > b.source.ID)return 1;
    if (a.target.ID < b.target.ID)return -1;
    if (a.target.ID > b.target.ID)return 1;

  })

  // Create the html for the table values
  rows = "<tbody>"
  // Iterate through each edge
  for (i=0; i < data.length; i++){
    rowvals = [data[i].source.ID, data[i].target.ID, data[i].weight]
    rows += "<tr>";
    // Append each piece of information for the rows
    for (var j=0; j < rowvals.length; j++){
      rows += "<td>" + rowvals[j] + "</td>";
    }
    rows += "</tr>"
  }
  rows += "</tbody>"

  // Write data into the table
  d3.select("#" + plotType + "Table")
    .html(header + rows);
}

// Tooltip Functions
// *****************
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
  // Automatically generate the tooltip information
  var html = "<strong>" + d.ID + "</strong></br>"
  for (var key in d){
    var exclude = {'ID': undefined,
                   'info': undefined,
                   'x': undefined,
                   'y': undefined,
                   'fx': undefined,
                   'fy': undefined,
                   'index': undefined,
                   'vy': undefined,
                   'vx': undefined,
                   'radius': undefined}
    if (!(key in exclude)){
      html += key.charAt(0).toUpperCase() + key.slice(1) + ": <strong>" + d[key] + "</strong><br/>"
    }
  }

  // Update the tooltip position and values
  d3.select("#tooltip")
    .style("left", xPos + "px")
    .style("top", yPos + "px")
    .select("#value")
    .html(html)
    // .html("<strong>" + d.ID + "</strong><br/>" +
    //       "Degree: <strong>" + getAttr("degree") + "</strong><br/>" +
    //       "In Degree: <strong>" + getAttr("degreeIn") + "</strong><br/>" +
    //       "Out Degree: <strong>" + getAttr('degreeO') + "</strong></br>")

  // function getAttr(type){
  //   if (d[type] == undefined){return 0;}
  //   else {return d[type]}
  // }

  // Show the tooltip
    d3.select("#tooltip").classed("hidden", false);
}


// SideBar Functions
// *****************
function initSideBar(plotType){
  // Initialize the sideBar
  var sideBar = document.createElement('div')
  sideBar.id = "SideBar" + plotType;
  sideBar.className = 'sideBar'

  // Find the object to insert before
  var svgGraph = document.getElementById(plotType + "Plot");
  var plotDiv = document.getElementById(plotType)
  plotDiv.insertBefore(sideBar, svgGraph)
}

// Console Functions
// *****************
function initConsole(plotType){
    // Initialize the console's container
    var divConsole = document.createElement('div');
    divConsole.id = "ConsoleContainer";
    divConsole.className = "console hidden";

    // Find the Object I want to insert before
    var visArea = document.getElementById(plotType+"VisArea");
    var plot = document.getElementById(plotType+"Plot");
    // Insert before
    visArea.insertBefore(divConsole, plot)

}

function makeConsole(nodes, edges, rScale){
  // Set up the Console's Canvas
  var canvas = d3.select("#ConsoleContainer")
                 .append("svg")
                 .attr("id", "ConsoleCanvas")
                 .attr("preserveAspectRatio", "xMinYMin meet")
                 .attr("viewBox", "0 0 800 100")

  // Node Options
  canvas.append("text")
    .text("Node Options")
    .attr("x", 200)
    .attr("y", 24)
    .attr("font-size", 24)
    .attr("text-anchor", "middle")

  // Isolates Toggle
  isolates(canvas)

  // Add ability to change node sizes
  sizeChange(canvas, rScale)

  // Edge Options
  canvas.append("text")
    .text("Edge Options")
    .attr("x", 600)
    .attr("y", 24)
    .attr("font-size", 24)
    .attr("text-anchor", "middle")

}

// Node Functions
function isolates(canvas){
  var showIsolates = false;

  function isolatesButton(selection){
    infox = 0;
    infoy = 0;

    selection
      .append("text")
      .attr("id", "showHideText")
      .text("Isolates")
      // .text("Show Isolates")
      .attr("x", infox + 10)
      .attr("y", infoy);

    selection
      .append("circle")
      .attr("r", 6)
      .attr("cx", 0)
      .attr("cy", -6)
      .attr("stroke", "#fff")
      .attr("stroke-width", "1px")
      .attr("fill", "gainsboro")
  }


  canvas.append("g")
     .call(isolatesButton)
    //  .attr("class", "info icon")
     .attr("transform", "translate(150,50)")
     .on("click", function(d){
       if (showIsolates == false){
         // Set showIsolates to true
         showIsolates = true;

         // Show the Isolates
         d3.select("#CitationNetworkPlot").selectAll("circle")
            .classed("hidden", false);

         // Change the icon to colour
         d3.select(this)
           .select("circle")
           .attr("fill", darkColour)

         // Change the text to 'Hide Isolates'
        //  d3.select(this)
        //    .select("#showHideText")
        //    .text("Hide Isolates")

       }
       else {
         // Set showIsolates to false
         showIsolates = false;

         // Hide the Isolates
         d3.select("#CitationNetworkPlot").selectAll("circle")
            .classed("hidden", function(d){return d.degree == 0;});

         // Change the icon to greyscale
         d3.select(this)
           .select("circle")
           .attr("fill", "gainsboro")

         // Change the text to 'Show Isolates'
        //  d3.select(this)
        //    .select("#showHideText")
        //    .text("Show Isolates")

       }
     })
}

function sizeChange(canvas, rScale){
  var IncDec;

  function sizeButton(selection){
    selection
      .append("text")
      .attr("id", "sizeText")
      .text("Size")
      .attr("x", 10)
      .on("click", function(d){IncDec = undefined})


    selection
      .append("text")
      .attr("id", "sizeText")
      .text("-")
      .attr("font-size", 20)
      .attr("x", 50)
      .on("click", function(d){IncDec = "decrease"})

      selection
        .append("text")
        .attr("id", "sizeText")
        .text("+")
        .attr("font-size", 20)
        .attr("x", 70)
        .on("click", function(d){IncDec = "increase"})

      selection
        .append("text")
        .attr("id", "sizeText")
        .text("(R)")
        .attr("x", 90)
        .on("click", function(d){IncDec = "reset"})

  }

  canvas.append("g")
        .call(sizeButton)
        .attr("transform", "translate(150,90)")
        .on("click", function(d){
          if (IncDec == "increase"){
            // Adjust the radius scale to create larger nodes
            newMin = rScale.range()[0] + 1;
            newMax = rScale.range()[1] + 1;
            rScale.range([newMin, newMax])
          }
          else if (IncDec == "decrease"){
            // Adjust the radius scale to create larger nodes
            newMin = rScale.range()[0] - 1;
            newMax = rScale.range()[1] - 1;
            rScale.range([newMin<2?2:newMin, newMax<2?2:newMax])
          }
          else if (IncDec == "reset"){
            // Revert radius scale
            rScale.range([3,20])
          }

          // Resize the nodes
          d3.select("#CitationNetworkPlot")
            .selectAll("circle")
            .attr("r", function(d){return rScale(d.degree)})

        })
}

function nodeAttr(d, key, scale){
  // console.log(d[key], key, scale)
  if (d[key] == undefined){return key}
  else {return scale(d[key])}
}

// Interactive Functions
// *********************
function repelNodes(simulation, d){
  simulation.force("collide", d3.forceCollide().radius(function(d2){
              if (d2.ID == d.ID){return 30;}
              else {return 1;}
            }))

  if (!d3.event.active){
    simulation.alphaTarget(0.3).restart();
  }
}

// Icon Functions
// **************
function makeIcons(svg, colour="grey", plotType){
  // Make the info button
  var colour = colour;

  function infoButton(selection){
    infox = 0;
    infoy = 0;
    selection
      .append("circle")
      .attr("r", 14)
      .attr("fill", colour)
      .attr("x", infox)
      .attr("y", infoy);

    selection
      .append("circle")
      .attr("class", "info")
      .attr("r", 11)
      .attr("cx", infox)
      .attr("cy", infoy)
      .attr("fill", "white");

    selection
      .append("text")
      .attr("class", "info")
      .text("i")
      .attr("x", infox)
      .attr("y", infoy+8)
      .attr("text-anchor", "middle")
      .attr("font-family", "Lucida Sans Unicode")
      .attr("font-size", "24px")
      .attr("fill", colour);

    selection
      .append("text")
      .text("Hide Pop-up Info")
      .attr("id", "showHideText")
      .attr("x", infox + 20)
      .attr("y", infoy + 10)
      .attr("font-size", "30px");

  }

  function tableButton(selection){
    // Make the table button
    var tabx = 0;
    var taby = 0;
    var tabw = 29;
    var tabh = 26;
    var tabb = 2;

    selection
      .append("rect")
      .attr("class", "colour")
      .attr("fill", colour)
      .attr("x", tabx)
      .attr("y", taby)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("width", tabw)
      .attr("height", tabh);

    selection
      .append("rect")
      .attr("class", "white")
      .attr("fill", "white")
      .attr("x", tabx+2)
      .attr("y", taby+6)
      .attr("width", tabw-4)
      .attr("height", tabh-8);

    selection
      .append("rect")
      .attr("fill", colour)
      .attr("x", tabx+9)
      .attr("y", taby+6)
      .attr("width", tabb)
      .attr("height", tabh-8);
    // //
    // selection
    //   .append("rect")
    //   .attr("fill", colour)
    //   .attr("x", tabx + 18)
    //   .attr("y", taby+6)
    //   .attr("width", tabb)
    //   .attr("height", tabh-8);
    //
    selection
      .append("rect")
      .attr("fill", colour)
      .attr("x", tabx + 2)
      .attr("y", taby+11)
      .attr("width", tabw-4)
      .attr("height", 2);
    //
    // selection
    //   .append("rect")
    //   .attr("fill", colour)
    //   .attr("x", tabx + 2)
    //   .attr("y", taby+14)
    //   .attr("width", tabw-4)
    //   .attr("height", 2);
    // //
    // selection
    //   .append("rect")
    //   .attr("fill", colour)
    //   .attr("x", tabx + 2)
    //   .attr("y", taby+19)
    //   .attr("width", tabw-4)
    //   .attr("height", 2);

    selection
      .append("text")
      .text("Hide Table")
      .attr("x", tabx + 35)
      .attr("y", taby + 24)
      .attr("font-size", "30px");

  }

  svg.append("g")
     .call(infoButton)
     .attr("class", "info icon")
     .attr("transform", "translate(686,375), scale(0.4)")
     .attr("transform", "translate(686,20), scale(0.4)")
     .on("click", function(d){
       if (ShowToolTip == true){
         // Set tooltipShow to false
         ShowToolTip = false;

         // Change the icon to greyscale
         d3.select(this)
           .select("circle")
           .attr("fill", "grey");

         d3.select(this)
           .select("text")
           .attr("fill", "grey");
         // Change the text to 'Show Pop-up Info'
         d3.select(this)
           .select("#showHideText")
           .text("Show Pop-up Info");
       } else {
         // Set tooltipShow to true
         ShowToolTip = true;

         // Change the icon to colour
         d3.select(this)
           .select("circle")
           .attr("fill", colour);

         d3.select(this)
           .select("text")
           .attr("fill", colour);

         d3.select(this)
           .select("#showHideText")
           .text("Hide Pop-up Info");
       }

     });

  var tableShow = true;
  svg.append("g")
     .call(tableButton)
     .attr("class", "table button")
     .attr("transform", "translate(680,30) scale(0.4)")
     .on("click", function(d){
       if (tableShow == true){
         // Set tableShow to false
         tableShow = false;
         // Hide the table
         d3.select("#" + plotType + "TableContainer").classed("hidden", true);
         // Change the icon to greyscale
         d3.select(this)
           .select("rect")
           .attr("fill", "grey");
        // Change the text to 'Show Table'
        d3.select(this)
          .select("text")
          .text("Show Table")

       }
       else{
         // Change tableShow to true
         tableShow = true;
         // Show the table
         d3.select("#" + plotType + "TableContainer").classed("hidden", false);
         // Change the icon to colour
         d3.select(this)
           .select("rect")
           .attr("fill", colour);
         // Change the text to 'Show Table'
         d3.select(this)
           .select("text")
           .text("Hide Table")
       }
     });

}
