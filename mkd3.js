// *********************************************************************************************
// Copyright (C) 2016 Jillian Anderson
//
// This file is part of the mkD3 (metaknowledged3) framework developed for Dr John McLevey's Networks
// Lab at the University of Waterloo. For more information, see http://networkslab.org/.
//
// mkD3 is free software: you can redistribute it and/or modify it under the terms
// of a GNU General Public License as published by the Free Software Foundation. metaknowledged3
// is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with metaknowledged3.
// If not, see <http://www.gnu.org/licenses/>.
// *********************************************************************************************

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined'){
    factory(exports);
  } else {
    (factory((global.mkd3 = global.mkd3 || {})));
  }} (this, (function(exports){

    // Define Constants
    // ****************
    var w = 800;
    var h = 400;
    var height = w,
        width = w;
    // Define RPYS Constants
    var outerPadding = 70;
    var relWidth = 0.8;

    // Define Network Constants
    var darkColour = "#2479C1"
    var lightColour = "#FF8A75"
    var lightColour = 'cornflowerblue'


    // Initialize Variables
    // ********************
    var showToolTip = true,
        showTable   = true,
        showOptionPanel = true,
        showGraphPanel = true
    // Initialize RPYS Variables
    var rpysFile = undefined;
    var citFile = undefined;

    // Initialize Network Variables
    var radius = 20;
    var nodeIgnore = {'ID': undefined,
                  'info': undefined,
                  'x': undefined,
                  'y': undefined,
                  'fx': undefined,
                  'fy': undefined,
                  'index': undefined,
                  'vy': undefined,
                  'vx': undefined,
                  'radius': undefined}
    var edgesIgnore = {'opacity': undefined,
                       'index': undefined}
    var threshold = 1,
        showIsolatesGlobal = true
    var nodesGlobal = undefined;
    var edgesGlobal = undefined;

    // Provided Functions
    // ******************
    function standardLine(RPYSFile, CitationFile){
      rpysFile = RPYSFile;
      citFile = CitationFile;
      plotType = "standardLine"

      // Initialize Everything
      initHead()
      initDivs(plotType)
      initIcons(plotType)
      initToolTip(plotType)
      initContextMenu(plotType)
      initStandardTable(plotType);


      // Create the canvas (svg)
      var plotName = "#" + plotType + "Plot"
      var svg = d3.select(plotName)
                  .append("svg")
                  .attr("id", "plot")
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .attr("viewBox", "0 0 800 400")
                  .classed("svg-content", true)

      // svg.append("text")
      //    .attr("font-family", 'FontAwesome')
      //    .attr('font-size', '2em')
      //    .attr('y', 50)
      //    .attr('x', 760)
      //    .text(function(d) { return '\uf080' })
      //    .attr('class', "miniIcon")

      // Read in the dataset
      var dataset;
      d3.csv(RPYSFile, function(error, data){
        if (error){
          console.log(error);
        } else {
          dataset = data;
          standardLineHelper(data, svg);
        }
      })
    }

    function standardBar(RPYSFile, CitationFile){
      rpysFile = RPYSFile;
      citFile = CitationFile;
      plotType = "standardBar"

      // Initialize Everything
      initHead()
      initDivs(plotType)
      initIcons(plotType)
      initToolTip(plotType)
      initContextMenu(plotType)
      initStandardTable(plotType);

      // Create the canvas(svg)
      var plotName = "#" + plotType + "Plot"
      var svg = d3.select(plotName)
                  .append("svg")
                  .attr("id", "plot")
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .attr("viewBox", "0 0 800 400")
                  .classed("svg-content", true);

      // Read in the data
      var dataset;
      d3.csv(RPYSFile, function(error, data) {
        if (error){
          console.log(error);
        } else {
          dataset = data;
          standardBarHelper(data, svg);
        }
      });
    }

    function multiRPYS(MultiRPYSFile, MultiCitationFile){
      plotType = 'multiRPYS'
      rpysFile = MultiRPYSFile;
      citFile = MultiCitationFile;

      // Create the div container
      // Initialize Everything
      initHead()
      initDivs(plotType)
      initIcons(plotType)
      initToolTip(plotType)
      initContextMenu(plotType)
      initStandardTable(plotType);


      // Make canvas
      var plotName = "#" + plotType + "Plot"
      var svg = d3.select(plotName)
                  .append("svg")
                  .attr("id", "plot")
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .attr("viewBox", "0 0 800 400")
                  .classed("svg-content", true);

      // Read in the dataset
      var dataset;
      d3.csv(rpysFile, function(error, data){
        if (error){
          console.log(error);
        } else {
          dataset = data;
          multiRPYSHelper(dataset, svg);
        }
      });
    }

    function networkGraph(edgeFile, nodeFile, citationFile, optionalAttrs = {}){
       // Define Constants
       var plotType = 'network';

       var isolates = optionalAttrs['isolates'] != undefined ? optionalAttrs['isolates']: true;
       var sizeBy = optionalAttrs['sizeBy'] != undefined ? optionalAttrs['sizeBy'] : "degree";
       var colourBy = optionalAttrs['colourBy'] != undefined ? optionalAttrs['colourBy']: '#2479C1';

       var directed = optionalAttrs['directed'] != undefined ? optionalAttrs['directed'] : false;
       var weighted = optionalAttrs['weighted'] != undefined ? optionalAttrs['weighted'] : true;
       var edgeWidth = optionalAttrs['edgeWidth'] != undefined ? optionalAttrs['edgeWidth']: 2;
       var edgeThresh = optionalAttrs['edgeThresh'] != undefined? optionalAttrs['edgeThresh']: 1;

       var hideNodeAttrs = optionalAttrs['hideNodeAttrs'] != undefined ? optionalAttrs['hideNodeAttrs']: [];
       darkColour = colourBy;

       // This initializes the divs everything will be placed in
       initHead()
       initDivs(plotType)
       initNetworkTable(plotType)
       initContextMenu(plotType)
       initToolTip(plotType)
      //  initIcons(plotType)

       // Create the svg
       var plotName = "#" + plotType + "Plot"
       var svg =  d3.select(plotName)
                    .append("svg")
                    .attr("id", plotType + "SVG")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 800 800")
                    .classed("svg-content", true)
                    .on("dblclick", function(d){
                      d3.selectAll("circle")
                        .attr("fx", function(node){
                          node.fx=null
                          node.fy=null
                          return null})
                        .attr("fx", null)
                    })

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


       // Data Functions
       // **************
       function edgesRow(d){
         d.source= d.From;
         d.target= d.To;
         // if(d.weight == undefined ) d.weight=1;
         if(weighted == false || d.weight == undefined ) d.weight=1;
         else d.weight = +d.weight
         d.selfRef = (d.From==d.To)
         return d
       }


       function nodesRow(d){
         d.degree= 0;
         d.maxWeight = 0;
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
         nodesGlobal = nodes;
         d3.csv(edgeFile, edgesRow, function(error, edges){
           // If there is an error, print it to the console
           if(error){console.log(error)}
           edgesGlobal = edges;
           d3.csv(citationFile, function(error, citations){
             if(error){console.log(error)}
             // Augment nodes
             nodes['isolates'] = isolates;
             nodes['sizeBy'] = sizeBy;
             nodes['colourBy'] = colourBy;
             nodes['hiddenAttrs'] = nodeIgnore;

             // Augment edges
             edges['directed'] = directed;
             edges['weighted'] = weighted;
             edges['edgeWidth'] = edgeWidth;
             edges['edgeThresh'] = edgeThresh;
             edges['hiddenAttrs'] = edgesIgnore;

             var nodeById = map$1(nodes, function(d){return d.ID.toUpperCase();})

             citations = citations.map(function(c){
               var nodeIDList = c["cite-string"].split(",", 3)
               var nodeID = nodeIDList.join(",").toUpperCase()
               node = nodeById.get(nodeID)
               if(node != undefined){
                 c["community"] = node["community"];
               } else {
                 c["community"] = undefined;
               }
               return c;
             })

            // citations = citations.map(function(c){
            //   nodes.forEach(function(n){
            //     if(c["cite-string"].toUpperCase().includes(n.ID.toUpperCase())){
            //       c["community"] = n["community"]
            //       return c
            //     }
            //   })
            //   return c
            // })

             // Define Required Functions
             var nodeById = map$1(nodes, function(d){return d.ID;})

             // Perform Required Node calculations
             nodeCalculations(nodes, edges, directed);

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

             // Create a scale for the edges' opacity (alpha)
             var aScale = d3.scalePow()
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
                           .style("marker-end",  directed?"url(#end)":"none")
                           .style("opacity", function(d){
                              if (d.weight){
                                d.opacity = aScale(d.weight)
                                return d.opacity}
                              else {return 0.3}})

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

             // Create the nodes
             var node = svg.append("g")
                           .attr("class", "nodes")
                           .selectAll("circle")
                           .data(nodes)
                           .enter()
                           .append("circle")
                           .attr("fill", "steelblue")
                           .attr("fill", function(d){return nodeAttr(d, colourBy, cScale)})
                           .attr("r", function(d){
                             d.radius = nodeAttr(d, sizeBy, rScale);
                             return d.radius;})
                           .on("mouseover", function(d){
                              d3.select(this)
                                .attr("r", function(d){
                                  return d.radius + d.radius/4
                                })
                                .style("stroke", d3.rgb(255,255,255,0.5))
                                .style("stroke-width", function(d){return d.radius/2});

                              // Fix the node's position
                              d.fx = d.x;
                              d.fy = d.y;

                              // Make tooltip
                              var xPos = event.pageX + 20;
                              var yPos = event.pageY - 20;
                              makeNetworkToolTip(xPos, yPos, d, hideNodeAttrs);

                              // Show the tooltip
                              if (showToolTip == false){
                                d3.select("#tooltip").classed("hidden", true);
                              }

                              // Make Small multiples
                              makeSmallMultiples(plotType, d, citations, nodes.length, edges.length)

                              // Repel nodes
                              // repelNodes(simulation, d);

                              // Make Table
                              makeNetworkTable(plotType, d.ID, edges)

                           })
                           .on("click", function(d){
                           })
                           .on("mouseout", function(d){
                             d3.select(this)
                               .attr("r", function(d){return d.radius})
                               .style("stroke", d3.rgb(255,255,255))
                               .style("stroke-width", 1)

                             // Unfix the node's position
                            //  d.fx = null;
                            //  d.fy = null;

                             // Remove the tooltip
                             d3.select("#tooltip")
                               .classed("hidden", true);

                             simulation.force("collide", d3.forceCollide().radius([1]));
                             simulation.alphaTarget(0).restart();
                           })
                           .on("dblclick", function(d){
                             // Unfix the node's position
                             d.fx = null;
                             d.fy = null;
                           })
                           .on("contextmenu", function(d){
                             event.preventDefault();

                             var xPos = event.pageX + "px";
                             var yPos = event.pageY + "px";

                            //  document.getElementById("contextMenu").show(100);
                             d3.select("#contextMenu")
                               .classed("hidden", false)
                               .style("top", yPos)
                               .style("left", xPos)
                               .attr("query", d.ID)

                               // Remove the tooltip
                               d3.select("#tooltip")
                                 .classed("hidden", true);
                           })
                           .call(d3.drag()
                             .on("start", dragStarted)
                             .on("drag", dragged)
                             .on("end", dragEnded));

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

                     // Sort the nodes by their degree
                     sortedNodes.sort(function(a, b){return a.degree - b.degree;})

                     //Find the 75th quartile value
                     var nodeQuantile75 = d3.quantile(sortedNodes, 0.75, function(d){return d.degree})

                     // Find the degrees of the connected nodes
                     sdeg = d.source.degree;
                     tdeg = d.target.degree;
                     if (sdeg > nodeQuantile75  && tdeg > nodeQuantile75  && sdeg + tdeg > edgeQuantile25){
                       return lScale((sdeg+tdeg)/d.weight/d.weight);
                     }

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

             makePanel(nodes, edges, plotType)
             initIcons(plotType)
           })
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
        //  d.fx = null;
        //  d.fy = null;
         d.fx = d3.event.x;
         d.fy = d3.event.y;

       }

    }


    // Main Helper Functions
    // *********************
    function standardLineHelper(dataset, svg){
      // Set up important values
      var darkcolour = "#AA3543";
      var lightcolour = "#e7b1b8";
      var plotType = "standardLine";
      var pointWidth = w / dataset.length * relWidth
      var plotMargin = w * (2-relWidth)/(2*dataset.length);
          // ^Equivalent to barwidth/2 +(w/dataset.length * (1-relWidth))

      // Create the scale for the x axis
      var xScale = d3.scaleLinear()
                     .domain(d3.extent(dataset, function(d){return d.year}))
                    //  .domain([d3.min(dataset, function(d){return d.year;}),
                    //           d3.max(dataset, function(d){return d.year;})])
                    .range([outerPadding+plotMargin, w-plotMargin]);

      // Create the scale for the y axis
      var yScale = d3.scaleLinear()
                     .domain(d3.extent(dataset, function(d){return +d["abs-deviation"]}))
                    //  .domain([d3.min(dataset, function(d){return +d["abs-deviation"];}),
                    //           d3.max(dataset, function(d){return +d["abs-deviation"];})])
                     .range([h-outerPadding-plotMargin, outerPadding+plotMargin]);

      // Make title
      var title = "Standard RPYS - Deviation from 5yr Median";
      makeTitle(svg, title);

      // Make axes
      var xname = "Reference Publication Year";
      var yname = "Difference from 5-year Median";
      makeAxes(svg, xScale, yScale, xname, yname);

      // Make line
      var line = d3.line()
                   .curve(d3.curveMonotoneX)
                   .x(function(d) { return xScale(d.year); })
                   .y(function(d) { return yScale(d["abs-deviation"]); });

      svg.append("path")
          .data([dataset])
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", darkcolour);

      // Make points
      svg.selectAll("circle")
         .data(dataset)
         .enter()
         .append("circle")
         .attr("class", "point")
         .attr("cx", function(d) {return xScale(d.year);})
         .attr("cy", function(d) {return yScale(d["abs-deviation"]);})
         .attr("fill", darkcolour)
         .on("mouseover", function(d){
           // Highlight the point
           d3.select(this)
             .attr("fill", lightcolour);
           // Make tooltip
           var xPos = event.clientX + 20;
           var yPos = event.clientY - 20;
           makeStandardToolTip(xPos, yPos, d);
           makeStandardTable(d.year, plotType);
         })
         .on("mouseout", function(d){
           // Unhighlight the point
           d3.select(this)
             .attr("fill", darkcolour);
           // Remove the tooltip
           d3.select("#tooltip")
             .classed("hidden", true);
         })

    }

    function standardBarHelper(dataset, svg){
      // Set up important values
      var darkcolour = "#2479C1"
      var lightcolour = "#bedbf3"
      var plotType = "standardBar"
      var barWidth = w / dataset.length * relWidth;
      var plotMargin = w * (2-relWidth)/(2*dataset.length)
          // ^ Equivalent to barWidth/2 + (w/dataset.length * (1-relWidth))

      // Create the scale for the x axis
      var xScale = d3.scaleLinear()
                     .domain(d3.extent(dataset, function(d){return d.year}))
                    //  .domain([d3.min(dataset, function(d){return d.year}),
                    //           d3.max(dataset, function(d){return d.year})])
                     .range([outerPadding+plotMargin, w-plotMargin]);

      // Create the scale for the y axis
      var yScale = d3.scaleLinear()
                     .domain([0,d3.max(dataset, function(d){return  +d.count;})])
                     .range([h-outerPadding, outerPadding]);

      // Make title
      var title = "Standard RPYS - Raw Frequency";
      makeTitle(svg, title);

      // make axes
      var xname = "Reference Publication Year";
      var yname = "Citation References";
      makeAxes(svg, xScale, yScale, xname, yname);

      // make bars
      svg.selectAll("rect")
         .data(dataset)
         .enter()
         .append("rect")
         .attr("x", function(d){return xScale(d.year)-0.5*barWidth;})
         .attr("y", function(d){return yScale(d.count);})
         .attr("width", barWidth)
         .attr("height", function(d){return h - outerPadding - yScale(d.count);})
         .attr("fill", darkcolour)
         .attr("stroke", "white")
         .attr("stroke-width", 1)
         .on("mouseover", function(d){
           //Highlight bar
           d3.select(this)
             .attr("fill", lightcolour);

           // Add the tooltip
           var xPos = event.clientX + 20;
           var yPos = event.clientY - 20;
           makeStandardToolTip(xPos, yPos, d)
           makeStandardTable(d.year, plotType);         // New Line
          })
         .on("mouseout", function(d){
           // Unhighlight the bar
           d3.select(this)
             .attr("fill", darkcolour);
           // Remove the tooltip
           d3.select("#tooltip")
             .classed("hidden", true);
         })
         .on("click", function(d){
          //  makeStandardTable(d.year, plotType);
        });
    }

    function multiRPYSHelper(dataset, svg){
      // Setup important values
      var plotType = "multiRPYS"

      var RPYmin = d3.min(dataset, function(d){return +d.RPY;})
      var RPYmax = d3.max(dataset, function(d){return +d.RPY;})
      var CPYmin = d3.min(dataset, function(d){return +d.CPY;})
      var CPYmax = d3.max(dataset, function(d){return +d.CPY;})
      var boxWidth = (w-outerPadding) / (RPYmax-RPYmin+1);
      var boxHeight = (h-(outerPadding*2)) / (CPYmax-CPYmin+1);
      var plotMargin = boxWidth * 1.5;

      // Create the scale for the x axis
      var xScale = d3.scaleLinear()
                     .domain([RPYmin, RPYmax])
                     .range([outerPadding+plotMargin*2, w-plotMargin*2]);

      // Create the scale for the y axis
      var yScale = d3.scaleLinear()
                     .domain([CPYmin, CPYmax+1])
                     .range([outerPadding, h-outerPadding]);

      // Create the colour scale
      var maxRank = d3.max(dataset, function(d){return  + d.rank});
      var cScale = d3.scaleLinear()
                     .domain([0, maxRank*0.9, maxRank]) // 0.5 sets the pivot point. Closer to 1 Higlights large deviations
                     .range(['#ffffd9', '#41b6c4','#081d58']) // Yellow, Green, Blue
                    //  .range(['#e9f3fb', '#2479c1','#081b2b']) // Blue
                    //  .range(['#f9eced', '#c23d4d','#270c0f']) // Red
                    //  .range(['#ffecb3', '#e85255', '#6A1B9A']) // Yellow, Red, Purple


      // Make title
      title = "Multi RPYS - Rank Transformed";
      makeTitle(svg, title);

      // Initialize the tooltip and table
      initToolTip();
      initMultiTable(plotType);

      // Make axes
      var xname = "Referenced Documents";
      var yname = "Citing Documents";
      makeAxes(svg, xScale, yScale, xname, yname, tickSize=-5);
      d3.select("g")
        .select("path")
        .style("display", "flex");

      // Make legend
      makeLegend(svg, dataset, cScale, plotMargin);

      // Make boxes
      var boxDataset = dataset.filter(function(d){
          return d.CPY >= d.RPY;
      })

      svg.selectAll("rect.heatmap")
        .data(boxDataset)
        .enter()
        .append("rect")
        .attr("x", function(d, i){return xScale(+ d.RPY);})
        .attr("y", function(d){return yScale(+ d.CPY)-boxHeight;})
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("fill", function(d){return cScale(d.rank);})
        .on("mouseover", function(d){
          // Highlight the box
          d3.select(this)
            .attr("fill", 'lightsalmon');

          // Make tooltip
          var xPos = event.clientX + 20;
          var yPos = event.clientY - 20;
          makeMultiToolTip(xPos, yPos, d);

          // Make Table
          makeMultiTable(d.CPY, d.RPY,  plotType)

         })
         .on("mouseout", function(d){
           // Unhighlight the box
           d3.select(this)
             .attr("fill", function(d){return cScale(d.rank);});

           // Remove the tooltip
           d3.select("#tooltip")
             .classed("hidden", true);
         })
         .on("click", function(d){
          //  makeMultiTable(d.CPY, d.RPY,  plotType);
         })

    }


    // Initialization Functions
    // ************************
    function initDivs(plotType){
      // Create the total container
      var container = document.createElement('div');
      container.id = plotType + "Container";
      container.className = "container";

      // Create the title - Vertical
      var title = document.createElement('div');
      title.id = "title"

      var imgLink = document.createElement('a')
      imgLink.href = "http://networkslab.org/metaknowledge/"
      var img = document.createElement("img");
      img.id = "mkLogo"
      img.src = "http://networkslab.org/metaknowledge/images/site-logo.png"
      imgLink.appendChild(img)
      title.appendChild(imgLink)

      var mk = document.createElement('div')
      mk.appendChild(document.createTextNode("metaknowledge"))
      mk.id = 'mkTitle'
      var mkLink = document.createElement('a')
      mkLink.href = "http://networkslab.org/metaknowledge/"
      mkLink.appendChild(mk)
      title.appendChild(mkLink)

      var netlab = document.createElement('div')
      netlab.appendChild(document.createTextNode("NetLab, University of Waterloo"))
      netlab.id = "netLab"
      title.appendChild(netlab)

      // var auth = document.createElement('div')
      // auth.appendChild(document.createTextNode('Reid McIlroy-Young, John McLevey, & Jillian Anderson'))
      // auth.id = "titleAuthors"
      // title.appendChild(auth)


      // title.appendChild(document.createTextNode("http://networkslab.org/metaknowledge/"))
      container.appendChild(title)

      // Create the Visualization Area
      var visArea = document.createElement('div');
      visArea.id = plotType + "VisArea";
      visArea.className = "visArea";

      // Create the cog icon
      var panelIcon = document.createElement('div')
      panelIcon.id = plotType + "PanelIcon"
      panelIcon.className = "fa fa-lg fa-cog panelIcon icon"
      panelIcon.onclick = function(d){iconClick("cog", showOptionPanel, plotType)}
      visArea.appendChild(panelIcon)

      // Create the Options Panel
      var panel = document.createElement('div');
      panel.id = plotType + "Panel";
      panel.className = "panel";
      visArea.appendChild(panel);

      // Create the plot
      var plot = document.createElement('div')
      plot.id = plotType + "Plot";
      if (plotType == "network"){
        plot.className = "plot network";
      } else{
        plot.className = "plot RPYS";
      }
      visArea.appendChild(plot);

      if (plotType == "network"){
        // Create the graph panel icon
        var miniGIcon = document.createElement('div')
        miniGIcon.id = plotType + "MiniGraphIcon"
        miniGIcon.className = "fa fa-lg fa-bar-chart panelIcon icon"
        miniGIcon.onclick = function(d){iconClick("bar-chart", showGraphPanel , plotType)}
        visArea.appendChild(miniGIcon)

        // Create the other mini graphs
        var miniG = document.createElement('div')
        miniG.id = plotType + "MiniGraph"
        miniG.className = "miniGraph"
        visArea.appendChild(miniG)
      }

      container.appendChild(visArea);

      // Create the small multiples' div
      var smallMult = document.createElement('div')
      smallMult.id = plotType + "smallMultiples"
      smallMult.className = "smallMultiples"
      container.appendChild(smallMult)


      // Create the table
      var table = document.createElement('div')
      table.id = plotType + "TableContainer";
      table.className = "container";

      container.appendChild(table);

      document.body.appendChild(container);
    }

    function initHead(){
      var meta = document.createElement('meta')
      meta.charset="utf-8"
      document.head.appendChild(meta)

      document.title = "mkd3"

      var d3Script = document.createElement('script')
      d3Script.src="https://d3js.org/d3.v4.js"
      document.head.appendChild(d3Script)

      var faLink = document.createElement('link')
      faLink.rel = "stylesheet"
      faLink.href = "http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css"
      document.head.appendChild(faLink)
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

    function initContextMenu(plotType){
      var menu = document.createElement('ul');
      menu.className = 'customContextMenu hidden';
      menu.id = "contextMenu";

      var item1 = document.createElement('li');
      item1['data-action'] = 'google';
      item1.appendChild(document.createTextNode("Search on Google Scholar"))
      item1.addEventListener('click', contextMenuClick);


      var item2 = document.createElement('li');
      item2['data-action'] = 'pubMed';
      item2.appendChild(document.createTextNode("Search on PubMed"))
      item2.addEventListener('click', contextMenuClick);


      menu.appendChild(item1)
      menu.appendChild(item2)
      document.body.appendChild(menu)

      // Removes contextMenu when click occurs
      d3.select("body")
        .on("click", function(d){
          d3.select("#contextMenu")
            .classed("hidden", true)
        })

    }

    function initStandardTable(plotType){
      var header = "<thead><tr><th width=10%><b>Rank</b></th><th width=22%><b>Author</b></th>" +
                   "<th width=35%><b>Source Title</b></th><th width=17%><b>Year Published</b></th>" +
                  "<th width=15%><b>Times Cited</b></th></tr></thead>"

      initTable(plotType, header);

    }

    function initMultiTable(plotType){
      var header = "<thead><tr><th width=12%><b>RPY</b></th><th width=23%><b>Author</b></th>" +
                   "<th width=35%><b>Source Title</b></th>" +
                  "<th width=20%><b>Times Cited</b></th><th width=12%><b>CPY</b></th></tr></thead>"

      initTable(plotType, header);

    }

    function initNetworkTable(plotType){
      var header = "<thead><tr>" + "<th width=40%><b>Node A</b></th>" +
                                   "<th width=40%><b>Node B</b></th>" +
                                   "<th width=20%><b>Edge Weight</b></th>" +
                   "</tr></thead>"

      initTable(plotType, header);

    }

    // RPYS
    function initRPYSTable(plotType, header){
      // Find the table container
      var divTable = document.getElementById(plotType + "TableContainer");

      // Create the title
      var title = document.createElement('p');
      title.id = plotType + "TableTitle";
      title.className = "title"
      divTable.appendChild(title);

      // Create table
      var table = document.createElement('table');
      table.id = plotType + "Table";
      table.border = "0";
      table.cellpadding = "3";
      divTable.appendChild(table);


      var plotDiv = document.getElementById(plotType);
      document.body.insertBefore(divTable, plotDiv.nextSibling);

      var tableName = "#" + plotType + "Table";
      d3.select(tableName)
                 .html(header);

      header = d3.select(tableName)
                 .html();
    }
    //Network
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

    function initIcons(plotType){
      // // Cog Icon
      // makeIcon("cog", "Options Panel", showOptionPanel, plotType)

      // Table Icon
      makeIcon("table", "Table", showTable, plotType)

      // ToolTip Icon
      makeIcon("info-circle", "Pop-up Info", showToolTip, plotType)

      // Save Icon
      makeIcon("floppy-o", "Save Graph", function(){console.log("Here")}, plotType)
    }

    // Context Menu Functions
    // **********************
    function contextMenuClick(){
      d3.select("#contextMenu")
        .classed("hidden", true)

      query = this.parentElement.getAttribute("query").replace(" ", "+");

      switch(this['data-action']){
        case "google":
          var preGoogle = 'https://scholar.google.ca/scholar?q='
          contextMenuSearch(preGoogle+query)
          break;
        case "pubMed":
          var prePubMed = 'https://www.ncbi.nlm.nih.gov/pubmed/?term='
          contextMenuSearch(prePubMed+query)
          break;
        default:
          alert("Please select an database to search")
          break;
      }
    }

    function contextMenuSearch(link){
      var win = window.open(link);
      if (win) {
        win.focus()
      } else {
        alert("Please Allow popups for this website")
      }

    }

    // Icon Functions
    // **************
    function makeIcon(type, labelText, bool, plotType){
      var icon = document.createElement('span');
      icon.id = type + "Icon";
      icon.className = "fa fa-" + type + " fa-lg icon";
      icon.style.color = bool?"#4D4D4D":"darkgrey"
      icon.onclick = function(d){
        iconClick(type, bool, plotType)};

      var label = document.createElement('label');
      label.className = "iconText";
      label.onclick = function(d){iconClick(type, bool, plotType)};
      label.for = type;
      var text = document.createTextNode(labelText);
      label.appendChild(text);

      var div = document.createElement('div')
      div.className = "icons"
      div.appendChild(icon)
      div.appendChild(label)

      var parent = document.getElementById(plotType + "Panel")
      parent.appendChild(div)
      // parent.appendChild(div)
      // document.body.appendChild(div)
    }

    function iconClick(type, bool, plotType){
      if (type == "info-circle"){
        // Update the value of showToolTip
        // This will also automatically hide the tooltips
        showToolTip = !showToolTip;
        // Update the icon colour
        d3.selectAll("#info-circleIcon")
          .style("color", function(d){return showToolTip?"#4D4D4D":"darkgrey"})
     }
      else if (type == "cog"){
        // Update the value of showOptionPanel
        showOptionPanel = !showOptionPanel;

        // Hide the console & adjust the plot
        var curMargin = parseFloat(d3.select("#" + plotType + "Plot").style("margin-left"))
        var tenpc = parseFloat(d3.select("#networkVisArea").style("width")) * 0.1

        d3.select("#" + plotType + "Panel")
          .style("width", function(d){return showOptionPanel?"0%":"20%"})
          .style("border-right", "solid 2px gainsboro")
          .transition()
          .duration(500)
          .styleTween("width", function(d){return showOptionPanel?d3.interpolate("0%", "20%"):d3.interpolate("20%", "0%")})
          .transition ()
          .delay(100)
          .style("border-right", function(d){return showOptionPanel?"solid 2px gainsboro":"none"})

        d3.select("#" + plotType + "Plot")
          .transition()
          .duration(500)
          .styleTween("margin-left", function(d){
            if (showOptionPanel){
              return d3.interpolate(curMargin, parseFloat(curMargin) - tenpc + "px")
            } else {
              return d3.interpolate(curMargin + "%", parseFloat(curMargin) + tenpc + "px")
            }
          })
          .styleTween("margin-right", function(d){
            if (showOptionPanel){
              return d3.interpolate(curMargin, parseFloat(curMargin) - tenpc + "px")
            } else {
              return d3.interpolate(curMargin + "%", parseFloat(curMargin) + tenpc + "px")
            }
          })
      }
      else if (type == "table"){
        // Update the value of showTable
        showTable = !showTable;
        // Update the icon colour
        d3.selectAll("#tableIcon")
          .style("color", function(d){return showTable?"#4D4D4D":"darkgrey"})
        // Show/Hide the table
        d3.selectAll("#" + plotType + "TableContainer")
          .classed("hidden", !showTable)
      }
      else if (type == "floppy-o"){
        exportPNG()
        // exportHTML()
      }
      else if (type == "bar-chart"){
        showGraphPanel = !showGraphPanel

        // Hide the console & adjust the plot
        var tenpc = parseFloat(d3.select("#networkVisArea").style("width")) * 0.1
        var curMargin = parseFloat(d3.select("#" + plotType + "Plot").style("margin-left"))

        d3.select("#" + plotType + "MiniGraph")
          .style("width", function(d){return showGraphPanel?"0%":"20%"})
          .style("border-left", "solid 2px gainsboro")
          .transition()
          .duration(500)
          .styleTween("width", function(d){return showGraphPanel?d3.interpolate("0%", "20%"):d3.interpolate("20%", "0%")})
          .transition()
          .delay(100)
          .style("border-left", function(d){return showGraphPanel?"solid 2px gainsboro":"none"})

        d3.select("#" + plotType + "Plot")
          .transition()
          .duration(500)
          .styleTween("margin-left", function(d){
            if (showGraphPanel){
              return d3.interpolate(curMargin, parseFloat(curMargin) - tenpc + "px")
            } else {
              return d3.interpolate(curMargin + "%", parseFloat(curMargin) + tenpc + "px")
            }
          })
          .styleTween("margin-right", function(d){
            if (showGraphPanel){
              return d3.interpolate(curMargin, parseFloat(curMargin) - tenpc + "px")
            } else {
              return d3.interpolate(curMargin + "%", parseFloat(curMargin) + tenpc + "px")
            }
          })
      }
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

    function nodeCalculations(nodes, edges, directed){
      // Find the degree, in-degree, and out-degree of each node and assign it
      degreeCalc(edges, nodes, directed)
    }

    function degreeCalc(edges, nodes, directed){
      var nodeById = map$1(nodes, function(d){return d.ID;})

      // Assign Degree to nodes
      for (var e = 0; e < edges.length; e++){
        weight = + edges[e].weight;
        // Add to the source's degree
        source = edges[e].source;
        // console.log(nodeById.get(source))
        nodeById.get(source).degree += weight;

        // Add to the target's degree
        target = edges[e].target;
        nodeById.get(target).degree += weight;

        // Check nodes' max weight
        if (weight > nodeById.get(source).maxWeight){nodeById.get(source).maxWeight = weight};
        if (weight > nodeById.get(target).maxWeight){nodeById.get(target).maxWeight = weight}

        // If the graph is directed, add to the in- and out-degrees
        if(directed){
          nodeById.get(target).degreeIn += weight;
          nodeById.get(source).degreeOut += weight;
        }
      }
    }

    function StrokeWidth(edgeWidth){
      if (typeof(edgeWidth) == 'number'){return edgeWidth}
      else {return function(d){return d[edgeWidth]}}
    }

    function TopCitation(year){
      // Initially return a progress message
      var ret = "Finding Citation...";
      var yearData;

      // Find and display the top citations
      d3.csv(citFile, function(error, data){
        // If there is an error, print it
        if (error){
          console.log(error);
        // Otherwise, continue
        } else {
          // Filter the dataset according to year
          var yearData = data.filter(function(d){
            var ret = Math.floor(d.year) == year;
            return ret;
          });

          // Find the maximum number of citations for the year
          var max = d3.max(yearData, function(d){return + d["num-cites"];});
          var top_cites = ""
          // Find the Author of the most cited work
          for (var i = 0; i < yearData.length; i++){
            if (+ yearData[i]["num-cites"] >= max){
              top_cites += "<br/>" + yearData[i].author;
            };
          }

          // Add the top citations
          d3.select("#citation")
            .html(top_cites);
        }
      })

      return ret;
    }


    // Graph Elements
    // **********************
    function makeTitle(svg, title){
      svg.append("text")
         .attr("x", w/2)
         .attr("y", outerPadding/2)
         .attr("font-size", 24)
         .attr("text-anchor", "middle")
         .text(title);
    }

    function makeAxes(svg, xScale, yScale, xname, yname, tickSize = -w){

      var formatAsChar = d3.format("c");

      var xAxis = d3.axisBottom(xScale)
                    .tickFormat(formatAsChar)
                    .tickArguments([5]);

      var yAxis = d3.axisLeft(yScale)
                    .tickSizeInner(tickSize)
                    .tickFormat(formatAsChar)
                    .ticks(5);

      svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + (h - outerPadding) + ")")
         .call(xAxis)

      svg.append("g")
         .attr("class", "y axis")
         .attr("transform", "translate(" + outerPadding + ",0)")
         .call(yAxis);

      svg.append("text")
         .attr("x", w/2)
         .attr("y", h-5)
         .attr("text-anchor", "middle")
         .text(xname);

      svg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", outerPadding/4)
         .attr("text-anchor", "middle")
         .attr("x", 0-h/2)
         .text(yname);
    }

    function makeLegend(svg, dataset, colourScale, plotMargin){
      var width = 200;
      var height = 20;
      var start = colourScale.range()[0];
      var pivot = colourScale.range()[1];
      var end = colourScale.range()[2];

      var gradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")
          .attr("x2", "100%")
          .attr("spreadMethod", "pad");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", start)
        .attr("stop-opacity", 1);

      gradient.append("stop")
        .attr("offset", "90%")
        .attr("stop-color", pivot)
        .attr("stop-opacity", 1);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", end)
        .attr("stop-opacity", 1);

      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", (w - width-2))
        // .attr("x", (outerPadding + 20))
        .attr("y", (h-height-2))
        // .attr("y", height)
        .attr("stroke-width", "2px")
        .attr("stroke-linecap", "butt")
        .attr("stroke", "gainsboro")
        .style("fill", "url(#gradient)");

      svg.append("text")
         .text("Low Rank")
         .attr("x", (w - width-2))
         .attr("y", (h-height-6))
         .attr("font-size", 10)
         .attr("text-anchor", "start")

      svg.append("text")
         .text("High Rank")
         .attr("x", (w - width-2 + width))

         .attr("y", (h-height-6))
         .attr("font-size", 10)
         .attr("text-anchor", "end")

    }

    // MiniGraph Creation
    // ******************
    function makeMiniGraph(svg, node, data, type, xrange=0, yrange=0){
      if (type != "community"){console.log(data)}
      // Clear canvas
      svg.selectAll("*").remove()

      // // Filter the citations
      // var data = citations.filter(function(d){
      //   return d[type].toUpperCase().includes(node.ID.toUpperCase());
      // })
      //
      // // Sort the citations
      // var data = data.sort(function(a,b){return a.CPY - b.CPY;})

      if (typeof(xrange) == "object"){
        xScale = d3.scaleLinear()
                   .domain([xrange[0], xrange[1]])
                   .range([50,250])
      } else {
        xScale = d3.scaleLinear()
                   .domain(d3.extent(data, function(d){return d.CPY}))
                   .range([50, 250])
      }

      // Create the YScale
      if (typeof(yrange) == "object"){
        yScale = d3.scaleLinear()
                   .domain([yrange[0], yrange[1]])
                   .range([180,30])
      } else {
        yScale = d3.scaleLinear()
                   .domain([0, d3.max(data, function(d){return +d["num-cites"]})])
                   .range([180,30])
      }

      // Find the total years
      var totalYears = d3.max(data, function(d){return d.CPY}) -
                       d3.min(data, function(d){return d.CPY}) + 1
      if(typeof(xrange)=="object"){
        var totalYears = xrange[1] - xrange[0] + 1
      }

      // Set some import dimensions
      var barWidth = 100*(1+2*totalYears)/totalYears/totalYears

      // Make Axes
      var formatAsChar = d3.format("c");

      var xAxis = d3.axisBottom(xScale)
                    .tickFormat(formatAsChar)
                    .tickArguments([5])

      var yAxis = d3.axisLeft(yScale)
                    // .tickSizeInner(-200-barWidth)
                    .tickFormat(formatAsChar)
                    .tickArguments([4])
                    // .tickValues([0,10,20,30])

      svg.append("g")
         .attr("class", "y axis smallMult")
         .attr("transform", "translate(48,0)")
         .call(yAxis);

      svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(" + barWidth/2 + ",180)")
         .call(xAxis)

      svg.selectAll("rect")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", function(d){return xScale(d.CPY)})
         .attr("y", function(d){return yScale(d["num-cites"])})
         .attr("width", barWidth)
         .attr("height", function(d){
           return 180 - yScale(d["num-cites"])})
        //  .attr("fill", "#77787B")
        //  .attr("fill", "#5D6D7E")
         .attr("fill", "#212F3D")
         .attr("fill", "#4D4D4D")
         .attr("stroke", "white")
         .attr("stroke-width", 0.5)

      // Make the title
      svg.append("text")
         .attr("x", 150)
         .attr("y", 20)
         .attr("font-size", 11)
         .attr("text-anchor", "middle")
         .text(node);

    }


    // Small Multiples
    // ***************
    function makeSmallMultiples(plotType, node, citations, numNodes, numEdges){
      var communityExist = (node["community"] != undefined)
      if (document.getElementById("networkMiniGraph").childNodes.length == 0){
        // // Basic Stats Title
        // var StatTitleDiv = d3.select("#" + plotType + "MiniGraph")
        //                      .append("div")
        //                      .attr("id", "smStatTitle")
        //                      .append("p")
        //                      .attr("class", "smallMult title")
        //                      .append("text")
        //                      .text("Graph Statistics")
        //
        // // Basic Stats Div
        // var density = numEdges/((numNodes*(numNodes-1)/2))
        // var StatDiv = d3.select("#" + plotType + "MiniGraph")
        //                  .append("div")
        //                  .attr("id", "smBasicStats")
        //                  .attr("class", "statistics")
        //                  .append("p")
        //                  .attr("class", "smallMult statistics")
        //                  .append("text")
        //                  .html("Nodes: <b>" + numNodes + "</b><br/>")
        //                  .append("text")
        //                  .html("Edges: <b>" + numEdges + "</b><br/>")
        //                  .append("text")
        //                  .html("Density: <b>" + density.toFixed(3) + "</b><br/>")

        // Citation History Title Div
        var TitleDiv = d3.select("#" + plotType + "MiniGraph")
                         .append("div")
                         .attr("id", "smallMultiplesTitle")
                         .append("p")
                         .attr("class", "smallMult title")
                         .append("text")
                         .html("Citations within </br> Record Collection")
        // Node Title Div
        var NodeTitleDiv = d3.select("#" + plotType + "MiniGraph")
                             .append("div")
                             .attr("id", "smNodeTitle")
                             .append("p")
                             .attr("class", "smallMult subTitle")
                             .append("text")
                             .text("Article")
        // Node SVG Div
        var NodeSVGDiv = d3.select("#" + plotType + "MiniGraph")
                         .append("div")
                         .attr("id", "smNodeSVGDiv")

        if (communityExist){
          // Community Title Div
          var CommTitleDiv = d3.select("#" + plotType + "MiniGraph")
                               .append("div")
                               .attr("id", "smCommTitle")
                               .append("p")
                               .attr("class", "smallMult subTitle")
                               .append("text")
                               .text("Community")
          // Community SVG Div
          var CommSVGDiv = d3.select("#" + plotType + "MiniGraph")
                           .append("div")
                           .attr("id", "smCommSVGDiv")
        }


        // // Author Title Div
        // var AuthTitleDiv = d3.select("#" + plotType + "MiniGraph")
        //                      .append("div")
        //                      .attr("id", "smAuthTitle")
        //                      .append("p")
        //                      .attr("class", "smallMult subTitle")
        //                      .append("text")
        //                      .text("Author")
        //
        // // Author SVG Div
        // var AuthSVGDiv = d3.select("#" + plotType + "MiniGraph")
        //                  .append("div")
        //                  .attr("id", "smAuthSVGDiv")
      }


      // Create the Article Citation History Graph
      // ****************************************
      d3.select("#smNodeSVGDiv")
        .select("svg")
        .remove()
      var svgNode = d3.select("#smNodeSVGDiv")
                      .append("svg")
                      .attr("preserveAspectRatio", "xMinYMin meet")
                      .attr("viewBox", "0 0 300 225 ")
                      .attr("id", "smNodeSVG")
                      .classed("smallMultiples", true)
                      .classed("node", true)
                      .on("dblclick", function(d){
                        this.remove()
                      })

      // Determine the extent of values
      var ymax = d3.max(citations, function(d){return +d["num-cites"]})
      var xrange = d3.extent(citations, function(d){return +d["CPY"]})

      // Find the category of node
      var category = classifyNode(node.ID)

      // Filter the citations
      var data = citations.filter(function(d){
        if (category == "cite-string"){
          return d[category].toUpperCase().includes(node.ID.toUpperCase());
        } else {
          return d[category].toUpperCase() == node.ID.toUpperCase()
        }
      })

      // Aggregate the data
      var catCitsByYear = {};
      data.forEach(function(a){
        if (a['CPY'] in catCitsByYear){
          catCitsByYear[a['CPY']]['num-cites'] += Number(a["num-cites"])
        } else {
          var obj = {"CPY": Number(a['CPY']), "num-cites": Number(a["num-cites"])}
          catCitsByYear[a['CPY']] = obj;
        }
      })

      // Convert to an array of objects
      var catArray = Object.values(catCitsByYear)
      console.log(catArray)
      // Sort the citations
      // var data = data.sort(function(a,b){return a.CPY - b.CPY;})

      makeMiniGraph(svgNode, node.ID, catArray, category)


      // Create the Community Citation History Graph
      // *******************************************
      if (communityExist){
        // Remove Old Graph
        d3.select("#smCommSVGDiv")
          .select("svg")
          .remove()
        var svgComm = d3.select("#smCommSVGDiv")
                        .append("svg")
                        .attr("preserveAspectRatio", "xMinYMin meet")
                        .attr("viewBox", "0 0 300 225 ")
                        .attr("id", "smCommSVG")
                        .classed("smallMultiples", true)
                        .classed("community", true)
                        .on("dblclick", function(d){
                          this.remove()
                        })
        // Filter the citations
        var data = citations.filter(function(d){
          return d["community"] == node["community"];
        })

        // Aggregate the data
        var commCitsByYear = {};
        data.forEach(function(a){
          if (a['CPY'] in commCitsByYear){
            commCitsByYear[a['CPY']]['num-cites'] += Number(a["num-cites"])
          } else {
            var obj = {"CPY": Number(a['CPY']), "num-cites": Number(a["num-cites"])}
            commCitsByYear[a['CPY']] = obj;
          }
        })

        // Convert to an array of objects
        var Commarray = Object.values(commCitsByYear)

        // // var ymax = d3.max(citations, function(d){return +d["num-cites"]})
        var xrange = d3.extent(citations, function(d){return +d["CPY"]})

        makeMiniGraph(svgComm, "Article Community ID = " + node["community"], Commarray, "community")
      }

      // Create the Author Citation History Graph
      // ****************************************
      // Remove Old Graph
      // d3.select("#smAuthSVGDiv")
      //   .select("svg")
      //   .remove()
      // var svgAuthor = d3.select("#smAuthSVGDiv")
      //                   .append("svg")
      //                   .attr("preserveAspectRatio", "xMinYMin meet")
      //                   .attr("viewBox", "0 0 300 225 ")
      //                   .attr("id", "smAuthSVG")
      //                   .classed("smallMultiples", true)
      //                   .classed("author", true)
      //                   .on("dblclick", function(d){
      //                   this.remove()
      //                   })
      //
      // // Filter the citations
      // var data = citations.filter(function(d){
      //   return d["author"].toUpperCase().includes(node.ID.split(",")[0].toUpperCase());
      // })
      //
      // // Aggregate the data
      // var authorCitsByYear = {};
      // data.forEach(function(a){
      //   if (a['CPY'] in authorCitsByYear){
      //     authorCitsByYear[a['CPY']]['num-cites'] += Number(a["num-cites"])
      //     // authorCitsByYear[a['CPY']] += Number(a["num-cites"])
      //   } else {
      //     var obj = {"CPY": Number(a['CPY']), "num-cites": Number(a["num-cites"])}
      //     authorCitsByYear[a['CPY']] = obj;
      //     // authorCitsByYear[a['CPY']] = Number(a["num-cites"])
      //   }
      // })
      //
      // // Convert to an array of objects
      // var array = Object.values(authorCitsByYear)
      //
      // // // var ymax = d3.max(citations, function(d){return +d["num-cites"]})
      // var xrange = d3.extent(citations, function(d){return +d["CPY"]})
      //
      // makeMiniGraph(svgAuthor, node.ID.split(",")[0], array, "author", xrange,[0,400])



    }

    // Table Functions
    // ***************
    function makeNetworkTable(plotType, nodeID, edges){
      d3.select("#" + plotType + "TableTitle")
        .html(nodeID)

      var tableName = "#" + plotType + "Table";
      // Copy the header from the html
      header = d3.select(tableName)
                 .html().split('<tbody>')[0];

      // Filter the edges
      var data = edges.filter(function(d){
        return d.weight > threshold && d.source.ID == nodeID || d.target.ID == nodeID;
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

    function makeMultiTable(CPY, RPY, plotType){
      // Copy the header
      var tableName = "#" + plotType + "Table";
      header = d3.select(tableName)
                 .html().split('<tbody>')[0];

      // Create the rows
      rows = "";
      d3.csv(citFile, function(error, data){
        // If there is an error, print it
        if (error){console.log(error);}
        // Otherwise, continue
        else {
            // Filter the data to include the right CPY & RPY
            var yearData = data.filter(function(d){
              return (Math.floor(d.CPY) == CPY && Math.floor(d.RPY) == RPY);
            })
            console.log(yearData)
            // Sort the years data by number of citations
            yearData =  yearData.sort(function(a, b){
                          return b["num-cites"] - a["num-cites"];
                          // return b["num-cites"] - a["num-cites"];
                        })

            // Find the cutoff value for top 15 citations & filter
            // var topnum = 15;
            // if (yearData.length > topnum){
            //   topval = yearData[topnum-1]["num-cites"];
            //   // topval = yearData[topnum-1]["num-cites"];
            //
            //   yearData =  yearData.filter(function(d){
            //                 return +d["num-cites"] >= topval;
            //                 // return + d["num-cites"] >= topval;
            //               })
            // }

            // Create the html for the top values
            rows = "<tbody>"
            // Iterate through each citation in a year
            for (i=0; i < yearData.length; i++){
              rowvals = [Math.floor(yearData[i].RPY), yearData[i].author, yearData[i].journal, yearData[i]["num-cites"], Math.floor(yearData[i].CPY)];
              // rowvals = [yearData[i].RPY, yearData[i].author, yearData[i].journal, yearData[i]["num-cites"], Math.floor(yearData[i].CPY)];

              rows += "<tr>";
              // Append each piece of information for the citation
              for (var j=0; j < rowvals.length; j++){
                rows += "<td>" + rowvals[j] + "</td>";
              }
                rows += "</tr>";
              }
            rows += "</tbody>"

            d3.select("#" + plotType + "Table")
              .html(header + rows);

            d3.selectAll("tr")
              .on("contextmenu", function(d){
                var row = this.innerHTML.split("</td>")
                query = row[1].replace("<td>", "") + " " + row[2].replace("<td>", "") + " " + row[0].replace("<td>", "")
                query = query.replace(/ /g, "+")

                event.preventDefault();

                var xPos = event.pageX + "px";
                var yPos = event.pageY + "px";

                d3.select("#contextMenu")
                  .classed("hidden", false)
                  .style("top", yPos)
                  .style("left", xPos)
                  .attr("query", query)

                  // Remove the tooltip
                  d3.select("#tooltip")
                    .classed("hidden", true);
              });
        }
      })
    }

    function makeStandardTable(year, plotType){
      // Change the Table Title
      // d3.select("#" + plotType + "TableTitle")
      //   .html("HI")

      var tableName = "#" + plotType + "Table";
      // Copy the header from the html
      header = d3.select(tableName)
                 .html().split('<tbody>')[0];

      // Create the rows
      rows = "";
      d3.csv(citFile, function(error, data){
        // If there is an error, print it
        if (error){
          console.log(error);
        // Otherwise, continue
        } else {
          // Filter the data to only include one year
          var yearData = data.filter(function(d){
              return Math.floor(d.year) == year;
          });
          // Sort the year's Articles by the number of citations
          yearData =  yearData.sort(function(a, b){
                        return b["num-cites"] - a["num-cites"];
                        // return b["num-cites"] - a["num-cites"];
                      })

          // Find the cutoff value for top 15 citations & filter
          // var topnum = 15;
          // if (yearData.length > topnum){
          //   topval = yearData[topnum-1]["num-cites"];
          //   // topval = yearData[topnum-1]["num-cites"];
          //
          //   yearData =  yearData.filter(function(d){
          //                 return +d["num-cites"] >= topval;
          //                 // return + d["num-cites"] >= topval;
          //               })
          // }

          // Create the html for the top values
          // Note:
          rows = "<tbody>"
          // Iterate through each citation in a year

          for (i=0; i < yearData.length; i++){
            rowvals = [i+1, yearData[i].author, yearData[i].journal, Math.floor(yearData[i].year), yearData[i]["num-cites"]];
            // rowvals = [i+1, yearData[i].author, yearData[i].journal, Math.floor(yearData[i].year), yearData[i]["num-cites"]];
            rows += "<tr>";
            // Append each piece of information for the citation
            for (var j=0; j < rowvals.length; j++){
              rows += "<td>" + rowvals[j] + "</td>";
            }
              rows += "</tr>";
            }
            rows += "</tbody>"
          }

          d3.select("#" + plotType + "Table")
            .html(header + rows);

          d3.selectAll("tr")
          .on("contextmenu", function(d){
            var row = this.innerHTML.split("</td>")
            query = row[1].replace("<td>", "") + " " + row[2].replace("<td>", "") + " " + row[3].replace("<td>", "")
            query = query.replace(/ /g, "+")

            event.preventDefault();

            var xPos = event.pageX + "px";
            var yPos = event.pageY + "px";

            d3.select("#contextMenu")
              .classed("hidden", false)
              .style("top", yPos)
              .style("left", xPos)
              .attr("query", query)

              // Remove the tooltip
              d3.select("#tooltip")
                .classed("hidden", true);
          });
        })

    }


    // Tooltip Functions
    // *****************
    function makeNetworkToolTip(xPos, yPos, d, hideNodeAttrs){
      // Automatically generate the tooltip information
      var html = "<strong>" + d.ID + "</strong></br>"
      // Create a list of attributes to exclude from the tooltip
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
      // Add hideNodeAttrs to the exclusion list
      for (var attr in hideNodeAttrs){exclude[hideNodeAttrs[attr]]=undefined}

      // Add every non-excluded item to the tooltip
      for (var key in d){
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

    function makeStandardToolTip(xPos, yPos, d, mode){
      // Update the tooltip position and values
      d3.select("#tooltip")
        .style("left", xPos + "px")
        .style("top", yPos + "px")
        .select("#value")
        .html("<emphasis>"+d.year+"</emphasis><br/>" +
              "Raw Frequency: " + "<strong>" + d.count + "</strong>"+ "<br/>" +
              "Difference from Median: " + "<strong>" + d["abs-deviation"] + "</strong>" + "<br/>" +
              "Top Citation(s): " + "<strong id='citation'>" + TopCitation(d.year) + "</strong>") ;

      // Show the tooltip
      if (showToolTip == true){
        d3.select("#tooltip").classed("hidden", false);
      }
    }

    function makeMultiToolTip(xPos, yPos, d){
      // Update the tooltip position and values
      d3.select("#tooltip")
        .style("left", xPos + "px")
        .style("top", yPos + "px")
        .select("#value")
        .html("CPY: <strong>"+ d.CPY+ "</strong><br/>" +
              "RPY: <strong>" + d.RPY + "</strong><br/>" +
              "Raw Frequency: " + "<strong>" + d["num-cites"] + "</strong>"+ "<br/>" +
              "Difference from Median: " + "<strong>" + d["abs-deviation"] + "</strong>" + "<br/>");
              // "Top Citation(s): " + "<strong id='citation'>" + TopCitation(d.year) + "</strong>") ;

      // Show the tooltip
      if (showToolTip == true){
        d3.select("#tooltip").classed("hidden", false);
      }
    }


    // Panel Functions
    // *****************
    function makePanel(nodes, edges, plotType){
      var nodeKeys = ['None']
      for (var key in nodes[0]){
        if (!(key in nodes["hiddenAttrs"])){
          nodeKeys = nodeKeys.concat(key);
        }
      }

      var edgeKeys = ['None']
      for (var key in edges[0]){
        var bool = (!(key in edges["hiddenAttrs"]) && typeof(edges[0][key]) == 'number')
        if (bool) {
          edgeKeys = edgeKeys.concat(key);
        }
      }

      var panel = document.getElementById(plotType + "Panel")

      var p = document.createElement('p')
      p.className = "panelTitle"
      var nodeTitle = document.createTextNode('Node Options')
      p.appendChild(nodeTitle)
      panel.appendChild(p)

      makeCheckBox(plotType, panel, "cbIsolates", "Isolates", true, changeIsolates)
      makeSelect(plotType, 'sizeBy', "Node Size", panel, nodeKeys, nodes.sizeBy, changeSize);
      makeSelect(plotType, 'colourBy', "Colour By", panel, nodeKeys, nodes.colourBy, changeColour);

      var p = document.createElement('p')
      p.className = "panelTitle"
      var edgeTitle = document.createTextNode('Edge Options')
      p.appendChild(edgeTitle)
      panel.appendChild(p)

      makeCheckBox(plotType, panel, "cbDirected", "Directed", edges.directed, changeDirected)
      makeCheckBox(plotType, panel, "cbWeighted", "Weighted", edges.weighted, changeWeighted)
      makeSelect(plotType, 'edgeWidth', "Edge Width", panel, edgeKeys, edges.edgeWidth, changeEdgeWidth)
      makeRange(plotType, panel, 'threshold', "Edge Threshold", d3.max(edges, function(d){return +d.weight} ))

    }

    function makeRange(plotType, panel, id, labelText, max){
      var label = document.createElement('label')
      label.className = "panelOption";
      label.for = id;
      var text = document.createTextNode(labelText)
      label.appendChild(text)
      label.appendChild(document.createElement('br'))
      panel.appendChild(label)

      var range = document.createElement('INPUT')
      range.setAttribute('type', 'range')
      range.className = "range"
      range.id = id
      range.defaultValue = 1
      range.min = 1
      range.max = max
      range.oninput = function(d){
        changeThreshold(this.value, plotType)
        var val = document.getElementById(id + "Value");
        val.innerHTML = this.value
      }
      panel.appendChild(range)
      // panel.appendChild(document.createElement('br'))
      var value = document.createElement('span')
      value.id = id + "Value"
      value.className = "range"
      var text = document.createTextNode(range.value)
      value.appendChild(text)
      panel.appendChild(value)
    }

    function makeSelect(plotType, id, labelText, panel, lst, selected, changeFunction = function(d){}){
      var label = document.createElement('label')
      label.className = "panelOption";
      label.for = id;
      var text = document.createTextNode(labelText);
      label.appendChild(text);

      panel.appendChild(label)

      var select = document.createElement('SELECT');
      select.className = 'select';
      select.id = id;
      select.onchange = function(d){changeFunction(select.value, plotType)}
      for (var i in lst){
        var option = document.createElement("option")
        option.text = lst[i];
        if (selected == lst[i]){option.selected = true}
        select.add(option);
      }
      panel.appendChild(select)
      panel.appendChild(document.createElement('br'))

    }

    function makeCheckBox(plotType, panel, id, labelText, cbDefault, clickFunction=function(d){}){
      var label = document.createElement('label');
      label.className = "panelOption";
      label.onclick = function(d){
        checkbox.checked = !checkbox.checked
        clickFunction(checkbox.checked, plotType)};
      label.for = id;
      var text = document.createTextNode(labelText);
      label.appendChild(text);
      panel.appendChild(label);

      var checkbox = document.createElement('INPUT');
      checkbox.setAttribute("type", "checkbox");
      checkbox.className = "checkBox";
      checkbox.id = id;
      checkbox.defaultChecked = cbDefault;
      checkbox.onclick = function(d){clickFunction(checkbox.checked, plotType)}
      panel.appendChild(checkbox)
      panel.appendChild(document.createElement('br'))

    }


    // Node Functions
    // **************
    function nodeAttr(d, key, scale){
      if (d[key] == undefined){return key}
      else {return scale(d[key])}
    }

    function changeIsolates(showIsolates, plotType){
      d3.select("#" + plotType + "Plot").selectAll("circle")
        //  .classed("hidden", !showIsolates && function(d){console.log(d)
        //    return +d.degree <= threshold});
         .classed("hidden", !showIsolates && function(d){
           return +d.maxWeight < threshold});
      showIsolatesGlobal = showIsolates
      nodesGlobal['isolates'] = showIsolates
    }

    function changeColour(colourBy, plotType){
      var cScale = d3.scaleOrdinal(['#5da5da','#faa43a','#60bd68','#f17cb0',
                                    '#4d4d4d','#b2912f','#decf3f','#f15854', '#ABABAB']);

      d3.select("#" + plotType + "Plot")
        .selectAll("circle")
        .attr("fill", function(d){
          if (colourBy == 'None'){return 'steelblue'}
          else {return nodeAttr(d, colourBy, cScale)}})

        nodesGlobal['colourBy'] = colourBy
    }

    function changeSize(sizeBy, plotType){
      var rScale = d3.scaleLinear()
                     .domain([0, d3.max(nodesGlobal, function(d){return d[sizeBy]})])
                     .range([3,20])

      d3.select("#" + plotType + "Plot")
          .selectAll("circle")
          .attr("r", function(d){
            if (sizeBy == 'None'){return 3}
            else {
              d.radius = nodeAttr(d, sizeBy, rScale);
              return d.radius;}})

      nodesGlobal['sizeBy'] = sizeBy;
    }

    function classifyNode(nodeID){
      function containsNumbers(str){
        var regex = /\d/g;
        return regex.test(str);
      }
      function isAllCaps(str){
        return str == str.toUpperCase()
      }

      if (containsNumbers(nodeID)){
        var num = parseFloat(nodeID)
        if (num.toString() == nodeID){return "year"}
        else {return "cite-string"}
      }
      else if (isAllCaps(nodeID)){return "journal"}
      else {return "author"}
    }

    // Edge Functions
    // **************
    function changeDirected(directed, plotType){
      d3.select("#" + plotType + "Plot")
        .selectAll("path")
        .style("marker-end", directed?'url("#end")':'none')

      edgesGlobal['directed'] = directed
    }

    function changeWeighted(weighted, plotType){
      d3.select("#" + plotType + "Plot")
        .selectAll("path")
        .style("opacity", weighted?function(d){return d.opacity}:0.3)

      edgesGlobal['weighted'] = weighted;
    }

    function changeEdgeWidth(edgeWidth, plotType){
      var ewScale = d3.scaleLinear()
                      .domain([0, d3.max(edgesGlobal, function(d){return +d[edgeWidth]})])
                      .range([1,10])

      d3.select("#" + plotType + "Plot")
        .selectAll("path")
        .style("stroke-width", function(d){
          if (edgeWidth == 'None'){return 2}
          else {var ret = nodeAttr(d, edgeWidth, ewScale)
                return nodeAttr(d, edgeWidth, ewScale)}})

      edgesGlobal['edgeWidth'] = edgeWidth;

    }

    function changeThreshold(num, plotType){
      threshold = num
      d3.select("#" + plotType + "Plot")
        .selectAll('path')
        .classed("hidden", function(d){
          return (+d.weight < +num)
        })

      edgesGlobal['edgeThresh'] = num;

      changeIsolates(showIsolatesGlobal, plotType)

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

    // Export Functions
    // ****************
    function exportPNG(){
      // http://stackoverflow.com/questions/11567668/svg-to-canvas-with-d3-js

      // get styles from all required stylesheets
      // http://www.coffeegnome.net/converting-svg-to-png-with-canvg/
      var style = "\n";
      var requiredSheets = ['styles.css']; // list of required CSS
      for (var i=0; i<document.styleSheets.length; i++) {
          var sheet = document.styleSheets[i];
          if (sheet.href) {
              var sheetName = sheet.href.split('/').pop();
              if (requiredSheets.indexOf(sheetName) != -1) {
                  var rules = sheet.rules;
                  if (rules) {
                      for (var j=0; j<rules.length; j++) {
                          style += (rules[j].cssText + '\n');
                      }
                  }
              }
          }
      }

      var svg = d3.select("svg"),
          img = new Image(),
          serializer = new XMLSerializer(),
          width = svg.node().getBBox().width,
          height = svg.node().getBBox().height;

      // prepend style to svg
      svg.insert('defs',":first-child")
      d3.select("svg defs")
          .append('style')
          .attr('type','text/css')
          .html(style);

      // generate IMG in new tab
      var svgStr = serializer.serializeToString(svg.node());

      img.src = 'data:image/svg+xml;base64,'+window.btoa(unescape(encodeURIComponent(svgStr)));
      img.src = 'data:image/svg+xml;base64, ' + window.btoa(svgStr)

      var w = width * 10,
          h = height * 10,
          canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.style["fontFamily"] = "sans-serif"
      canvas.style["color"] = "white"
      canvas.getContext("2d").drawImage(img,0,0,w,h)

      var imge = canvas.toDataURL("image/png", 1)
      window.open(imge)

    }

    function exportHTML(){
      // window.open(document.write(page))
      // window.open().document.write(page)
      header = '<!DOCTYPE html><head><script src="https://d3js.org/d3.v4.js"></script><script type="text/javascript" src="source/mkd3Simplified.js"></script><link rel="stylesheet" type="text/css" href="source/styles.css"></head>'

      myHTMLDoc = header + "<body><script type = 'text/javascript'>" + makeExportFun() + "</script></body></html>"
      var uri = "data:application/octet-stream;base64," + btoa(myHTMLDoc);
      document.location = uri;

      // window.open().document.write();
      // console.log(makeExportFun())

    }

    function makeExportFun(){
      var fun = "mkd3.networkGraph('coCite_edgeList.csv', 'coCite_nodeAttributes.csv',"

      var optionalAttrsExport = "{";
      var nodeAttrList = ['isolates', 'sizeBy', 'colourBy'];
      for (var i=0; i<nodeAttrList.length; i++){
        attr = String(nodeAttrList[i]);
        str = attr + ":" + "'" + String(nodesGlobal[attr]) + "'" + ","
        optionalAttrsExport += str
      }

      var edgeAttrList = ['directed', 'weighted', 'edgeWidth', 'edgeThresh'];
      for (var i=0; i<edgeAttrList.length; i++){
        attr = String(edgeAttrList[i]);
        if (typeof(edgesGlobal[attr]) == "string"){
          str = attr + ":" + "'" + String(edgesGlobal[attr]) + "'" + ","
        } else {
          str = attr + ":" + String(edgesGlobal[attr]) + ","
        }
        optionalAttrsExport += str
      }
      optionalAttrsExport = optionalAttrsExport.replace(/.$/,"}")

      fun += optionalAttrsExport + ")"

      return fun
    }


    exports.networkGraph = networkGraph;
    exports.standardBar = standardBar;
    exports.standardLine = standardLine;
    exports.multiRPYS = multiRPYS;
  })))
