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

var darkColour = "#2479C1"
// var lightColour = "#FF9A20";
var lightColour = "#FF8A75"

// var darkColour = "cornflowerblue";
// var lightColour = "#EDBC64"

// var darkColour = "dodgerblue";
// var lightColour = "darkorange";

// var darkColour = "royalblue";
// var lightColour = "#E1B941"

function CitationGraph(edgeFile, nodeFile){

  // This will need to include initDiv, etc.
  // Create SVG element
  var svg = d3.select("div")
              .style("padding-bottom", "80%")
              .append("svg")
              .attr("id", "CitationGraphPlot")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 800 800")
              .classed("svg-content", true);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
                     .alphaDecay(0.1)
                     .force("link", d3.forceLink().id(function(d) {
                       return d.ID;
                     })
                     .distance([10]))
                      .force("charge", d3.forceManyBody().strength([-8]))
                      // .force("charge", d3.forceManyBody().strength([-20]))
                     .force("collide", d3.forceCollide().radius([1]))
                     .force("x", d3.forceX(width / 2))
                     .force("y", d3.forceY(height / 2))
                     .force("center", d3.forceCenter(width/2, height/2));

  // Make the Options Panel (Console)
  initConsole("CitationNetwork");


  d3.csv(nodeFile, nodesRow, function(error, nodes){
  if (error){
  console.log(error);
  } else {
  d3.csv(edgeFile, edgesRow, function(error, edges){
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
                  .attr("id", "links")
                  .selectAll("line")
                  .data(edges)
                  .enter()
                  .append("line")
                  .attr("stroke-width", 2)
                  .style("marker-end",  "url(#end)"); //Added

    // Code directly below adapted from http://bl.ocks.org/d3noob/5141278
    // Create the end markers
    svg.append("svg:defs").selectAll("marker")
       .data(["end"])      // Different link/path types can be defined here
       .enter().append("svg:marker")    // This section adds in the arrows
       .attr("id", String)
       .attr("viewBox", "0 -5 10 10")
       .attr("refX", 15)
       .attr("refY", 0)
       .attr("markerWidth", 4)
       .attr("markerHeight", 3)
       .attr("orient", "auto")
       .append("svg:path")
       .attr("class", "hidden")
       .attr("d", "M0,-5L10,0L0,5")
       .attr("fill", "404040")
       .style("opacity", "0.8")

    // Create the nodes
    var node = svg.append("g")
                  .attr("class", "nodes")
                  .selectAll("circle")
                  .data(nodes)
                  .enter()
                  .append("circle")
                  .classed("hidden", function(d){return d.degree == 0;})
                  .attr("r", function(d){return rScale(d.degree);})
                  .attr("fill", darkColour)
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
                      .attr("fill", darkColour);

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
           if(d.degree == 0){return -1;}
           else{return -width/1.5/Math.sqrt(nodes.length);}
           })

    simulation
         .force("collide")
         .radius(function(d){return rScale(d.degree)})

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

    makeConsole(nodes, edges, rScale)
    // makeNetworkIcons(svg);
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
    weight = + edges[e].weight;
    // Add to the source's degree and out-degree
    source = edges[e].source;
    nodeById.get(source).degree += weight;
    nodeById.get(source).degreeO += weight;

    // Add to the target's degree and in-degree
    target = edges[e].target;
    nodeById.get(target).degree += weight;
    nodeById.get(target).degreeI += weight;
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

function edgesRow(d){
  // console.log(d);
  return {
     source: d.From,
     target: d.To,
     weight: d.weight==undefined?1:d.weight,
     self_ref: d.From == d.To
   };
}

function nodesRow(d){
  return {
    ID: d.ID,
    degree: 0,
    degreeI: 0,
    degreeO: 0,
    index: d.index,
    info: d.info
  }
}

function initConsole(plotType){
    // Initialize the console's container
    var divConsole = document.createElement('div');
    divConsole.id = "ConsoleContainer";
    divConsole.className = "console hidden";

    // Find the Object I want to insert before
    var something = document.getElementById("CitationGraph");
    // Insert before
    document.body.insertBefore(divConsole, something)
    // document.body.appendChild(divConsole);

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

  // Add the Size By Choice
  sizeBy(canvas, nodes, rScale);

  // Add ability to change node sizes
  sizeChange(canvas, rScale)

  // Edge Options
  canvas.append("text")
    .text("Edge Options")
    .attr("x", 600)
    .attr("y", 24)
    .attr("font-size", 24)
    .attr("text-anchor", "middle")

  // Add the Directed Graph toggle
  directed(canvas);

  // Add the edgeAlpha Option
  edgeWeight (canvas, edges);

  // Add the self_referencing Option (loops)
  selfReferenced (canvas, edges);


}

function selfReferenced(canvas){
  // The graph defaults to showing loops
  var loops = true;

  function loopButton(selection){
    // Add the text
    selection
      .append("text")
      .attr("id", "showHideText")
      .text("Loops")
      .attr("x", 10)

      // Add circle
      selection
        .append("circle")
        .attr("r", 6)
        .attr("cx", 0)
        .attr("cy", -6)
        .attr("stroke", "#fff")
        .attr("stroke-width", "1px")
        .attr("fill", darkColour)
  }

  canvas.append("g")
        .call(loopButton)
        .attr("transform", "translate(550, 90)")
        .on("click", function(d){
          if (loops == true){
            // Set loops to false
            loops = false;

            // Hide loops (self referencing edges)
            // Note: Loops only appear in the form of arrow heads
            d3.select("#CitationGraphPlot")
              .select("#links")
              .selectAll("line")
              .classed("hidden", function(e){return e.self_ref;});

            // Adjust the degree

            // Change the icon to grey scale
            d3.select(this)
              .select("circle")
              .attr("fill", "gainsboro")

          }
          else if (loops == false){
            // Set loops to true
            loops = true;

            // Show loops (self referencing edges)
            d3.select("#CitationGraphPlot")
              .select("#links")
              .selectAll("line")
              .classed("hidden", false)

            // Reset the degree

            // Change the icon to colour
            d3.select(this)
              .select("circle")
              .attr("fill", darkColour)
          }


        })

}

function edgeWeight(canvas, edges){
  // The graph defaults to a standard stroke-width
  var eWeight = false;

  function eWeightButton(selection){
    // Add the text
    selection
      .append("text")
      .attr("id", "showHideText")
      .text("Weighted Edges")
      .attr("x", 10)

    // Add circle
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
        .call(eWeightButton)
        .attr("transform", "translate(550, 70)")
        .on("click", function(d){
          if (eWeight == false){
            // Set eWeight to true
            eWeight = true;

            // Create an alpha scale
            var aScale = d3.scalePow()
                           .domain([d3.min(edges, function(d){return d.weight;}),
                                    d3.max(edges, function(d){return d.weight;})])
                           .range([0.2, 1])
                           .exponent([8])

            // Adjust edges' opacity and colour
            d3.select("#CitationGraphPlot")
              .select("#links")
              .selectAll("line")
              // Adjust edges' width
              // .attr("stroke-width", function(d){
              //   if (d.weight == undefined){
              //     return 2;
              //   }
              //   else {
              //     return d.weight*2 + 1;
              //   }
              // })
              // Adjust the opacity
              .style("opacity", function(d){
                if (d.weight == undefined){
                  return 0.6;
                } else {
                  return aScale(d.weight);
                }
              })
              // Change the colour
              // .style("stroke", "black")

            // Turn icon to colour
            d3.select(this)
              .select("circle")
              .attr("fill", darkColour)
          }
          else if (eWeight == true){
            // Set eWeight to false
            eWeight = false;

            // Adjust edge width
            d3.select("#CitationGraphPlot")
              .select("#links")
              .selectAll("line")
              .style("opacity", 0.4)
              .style("stroke", "#404040")

            // Turn icon to greyscale
            d3.select(this)
              .select("circle")
              .attr("fill", "gainsboro")
          }
        })
}

function directed(canvas){
  // The graph starts with no arrows
  var showArrows = false;

  function arrowButton(selection){
    // Add the text
    selection
      .append("text")
      .attr("id", "showHideText")
      .text("Arrows")
      .attr("x", 10)
      .attr("y", 0);

    //   selection
    //     .append("path")
    //     .attr("d", "M-4,-8L8,-12L4,0")
    //     .attr("fill", darkColour)
    //
    //
    // selection
    //   .append("line")
    //   .attr("x1", 0)
    //   .attr("x2", -8)
    //   .attr("y1", -4)
    //   .attr("y2", 4)
    //   .attr("stroke", darkColour)
    //   .attr("stroke-width", 3)

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
     .call(arrowButton)
     .attr("transform", "translate(550,50)")
     .on("click", function(d){
       if (showArrows == false){
         // Set showArrows to true
         showArrows = true;

         // Show arrows
         d3.selectAll("marker")
           .select("path")
           .classed("hidden", false)

         // Change the icon to colour
         d3.select(this)
           .select("circle")
           .attr("fill", darkColour)
       }
       else if (showArrows == true){
         // Set showArrows to false
         showArrows = false;

         // Hide arrows
         d3.selectAll("marker")
           .select("path")
           .classed("hidden", true)

         // Change the icon's colour to grey
         d3.select(this)
           .select("circle")
           .attr("fill", "gainsboro")

       }
     })
}

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
         d3.select("#CitationGraphPlot").selectAll("circle")
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
         d3.select("#CitationGraphPlot").selectAll("circle")
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
          d3.select("#CitationGraphPlot")
            .selectAll("circle")
            .attr("r", function(d){return rScale(d.degree)})

        })
}

function sizeBy(canvas, nodes, rScale){
  var sizeParameter = "degree"

  function sizeButton(selection){
    selection
      .append("text")
      .attr("id", "optionText")
      .text("Size By (degree)")
      .attr("x", 10)
      .attr("y", 0);
  }

  canvas.append("g")
        .call(sizeButton)
        .attr("transform", "translate(150, 70)")
        .on("click", function(d){
          if (sizeParameter == "degree"){
            // Change sizeParameter to "degreeI"
            sizeParameter = "degreeI"

            // Change the radius Scale's domain
            rScale = rScale.domain([0,
                                              d3.max(nodes, function(d){return d.degreeI;})]);

            // Change the nodes' radii to be a function of the nodes' in-degree
            d3.select("#CitationGraphPlot")
              .selectAll("circle")
              .attr("r", function(d){
                // console.log(d.degreeI);
                return rScale(d.degreeI);})

            // Change the text
             d3.select(this)
               .select("text")
               .text("Size By (in-degree)")
          }
          else if (sizeParameter == "degreeI"){
            // Change sizeParameter to "degreeO"
            sizeParameter = "degreeO"

            // Change the radius Scale's domain
            rScale = rScale.domain([0,
                                              d3.max(nodes, function(d){return d.degreeO;})]);

            // Change the nodes' radii to be a function of the nodes' out-degree
            d3.select("#CitationGraphPlot")
              .selectAll("circle")
              .attr("r", function(d){return rScale(d.degreeO);})

            // Change the text
             d3.select(this)
               .select("text")
               .text("Size By (out-degree)")
          }
          else if (sizeParameter == "degreeO"){
            // Change sizeParameter to "degree"
            sizeParameter = "degree"

            // Change the radius Scale's domain
            rScale = rScale.domain([0,
                                              d3.max(nodes, function(d){return d.degree;})]);

            // Change the nodes' radii to be a function of the nodes' degree
            d3.select("#CitationGraphPlot")
              .selectAll("circle")
              .attr("r", function(d){
                return rScale(d.degree)})

            // Change the text
             d3.select(this)
               .select("text")
               .text("Size By (degree)")

          }
        })
}
