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
        showOptionPanel = false

    // Initialize RPYS Variables
    var rpysFile = undefined;
    var citFile = undefined;

    // Initialize Network Variables
    var radius = 20;
    var ignore = {'ID': undefined,
                  'info': undefined,
                  'x': undefined,
                  'y': undefined,
                  'fx': undefined,
                  'fy': undefined,
                  'index': undefined,
                  'vy': undefined,
                  'vx': undefined,
                  'radius': undefined}

    // Provided Functions
    // ******************
    function standardLine(RPYSFile, CitationFile){
      rpysFile = RPYSFile;
      citFile = CitationFile;
      plotType = "standardLine"

      // Initialize Everything
      initHead()
      initIcons()
      initNetworkDivs(plotType)
      // initRPYSDivs(plotType)
      initToolTip(plotType)
      initStandardTable(plotType);


      // Create the canvas (svg)
      var plotName = "#" + plotType + "Plot"
      var svg = d3.select(plotName)
                  .append("svg")
                  .attr("id", "plot")
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .attr("viewBox", "0 0 800 400")
                  .classed("svg-content", true);

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
      initIcons()
      initNetworkDivs(plotType)
      // initRPYSDivs(plotType)
      initToolTip(plotType)
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
      initIcons()
      initNetworkDivs(plotType)
      // initRPYSDivs(plotType)
      initToolTip(plotType)
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

    function networkGraph(edgeFile, nodeFile, optionalAttrs = {}){
       // Define Constants
       var plotType = 'network';

       var directed = optionalAttrs['directed'] != undefined ? optionalAttrs['directed'] : false;
       var weighted = optionalAttrs['weighted'] != undefined ? optionalAttrs['weighted'] : true;
       var sizeBy = optionalAttrs['sizeBy'] != undefined ? optionalAttrs['sizeBy'] : "degree";
       var edgeWidth = optionalAttrs['edgeWidth'] != undefined ? optionalAttrs['edgeWidth']: 2;
       var colourBy = optionalAttrs['colourBy'] != undefined ? optionalAttrs['colourBy']: '#2479C1';
       var hideNodeAttrs = optionalAttrs['hideNodeAttrs'] != undefined ? optionalAttrs['hideNodeAttrs']: [];
       darkColour = colourBy;

       // This initializes the divs everything will be placed in
       initHead()
       initIcons()
       initNetworkDivs(plotType)
       initNetworkTable(plotType)
       initToolTip(plotType)

       // Create the svg
       var plotName = "#" + plotType + "Plot"
       var svg = d3.select(plotName)
                   .style("padding-bottom", "75%")
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
           // Augment nodes
           nodes['sizeBy'] = sizeBy;
           nodes['colourBy'] = colourBy;
           nodes['hiddenAttrs'] = ignore;

           // Augment edges
           edges['directed'] = directed;
           edges['weighted'] = weighted;
           edges['edgeWidth'] = edgeWidth;

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
                            if (d.weight){return aScale(d.weight)}
                            else {return 0.6}})

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
                             .attr("fill", lightColour)

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

      // // Make icons
      // makeIcons(svg, darkcolour, plotType);

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
         .on("click", function(d){
           makeStandardTable(d.year, plotType);

         });


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

      // // make icons (toggles)
      // makeIcons(svg, darkcolour, plotType);

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
           makeStandardTable(d.year, plotType);
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

      // make icons (toggles)
      makeIcons(svg, "#081d58", plotType);

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
           makeMultiTable(d.CPY, d.RPY,  plotType);
         })

    }


    // Initialization Functions
    // ************************
    function initRPYSDivs(plotType){
      // Create the total container
      var container = document.createElement('div');
      container.id = plotType + "Container";
      container.className = "container";

      // Create the plot
      var plot = document.createElement('div')
      plot.id = plotType + "Plot"
      plot.className = "plot";
      container.appendChild(plot);

      // Create the table container
      var table = document.createElement('div')
      table.id = plotType + "TableContainer";
      table.className = "container";
      container.appendChild(table);

      document.body.appendChild(container);
    }

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
     plot.className = "plot RPYS";
     visArea.appendChild(plot);

     container.appendChild(visArea);

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

      var cssLink = document.createElement('link')
      cssLink.rel = "stylesheet"
      cssLink.href = "mkd3/styles.css"
      document.head.appendChild(cssLink)

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
      var header = "<thead><tr>" + "<th width=40%><b>Source Node</b></th>" +
                                   "<th width=40%><b>Target Node</b></th>" +
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

    function initIcons(){
      // Cog Icon
      makeIcon("cog", "Options Panel", showOptionPanel, "network")

      // Table Icon
      makeIcon("table", "Table", showTable, "network")

      // ToolTip Icon
      makeIcon("info-circle", "Pop-up Info", showToolTip, "network")
    }

    // Icon Functions
    // **************s
    function makeIcon(type, labelText, bool, plotType){
     var icon = document.createElement('span');
     icon.id = type + "Icon";
     icon.className = "fa fa-" + type + " fa-lg icon";
     icon.style.color = bool?"steelblue":"darkgrey"
     icon.onclick = function(d){iconClick(type, bool, plotType)};
     // document.body.appendChild(icon)

     var label = document.createElement('label');
     label.className = "iconText";
     label.onclick = function(d){iconClick(type, bool, plotType)};
     label.for = type;
     var text = document.createTextNode(labelText);
     label.appendChild(text);
     // document.body.appendChild(label)

     var div = document.createElement('div')
     div.appendChild(icon)
     div.appendChild(label)
     document.body.appendChild(div)
    }

    function iconClick(type, bool, plotType){
     if (type == "info-circle"){
       // Update the value of showToolTip
       // This will also automatically hide the tooltips
       showToolTip = !showToolTip;
       // Update the icon colour
       d3.selectAll("#info-circleIcon")
         .style("color", function(d){return showToolTip?"steelblue":"darkgrey"})
     }
     else if (type == "cog"){
       // Update the value of showOptionPanel
       showOptionPanel = !showOptionPanel;

       // Update the icon colour
       d3.selectAll("#cogIcon")
         .style("color", function(d){return showOptionPanel?"steelblue":"darkgrey"})

       // Hide the console & adjust the plot
       d3.select("#" + plotType + "Panel")
         .style("width", function(d){return showOptionPanel?"0%":"22%"})
         .style("border-right", "solid 2px gainsboro")
         .transition()
         .duration(500)
         .styleTween("width", function(d){return showOptionPanel?d3.interpolate("0%", "22%"):d3.interpolate("22%", "0%")})
         // .styleTween("padding-bottom", function(d){return showOptionPanel?d3.interpolate("48%", "25%"):d3.interpolate("25%", "48%")})
         .transition()
         .delay(100)
         .style("border-right", function(d){return showOptionPanel?"solid 2px gainsboro":"none"})
       d3.select("#" + plotType + "Plot")
         .transition()
         .duration(500)
         .styleTween("margin-left", function(d){return showOptionPanel?d3.interpolate("12.5%", "0%"):d3.interpolate("0%", "12.5%")})
         // .styleTween("width", function(d){return showOptionPanel?d3.interpolate("97%","75%"):d3.interpolate("75%","97%")})
         // .styleTween("padding-bottom", function(d){return showOptionPanel?d3.interpolate("100%","77%"):d3.interpolate("77%","100%")})
     }
     else if (type == "table"){
       // Update the value of showTable
       showTable = !showTable;
       // Update the icon colour
       d3.selectAll("#tableIcon")
         .style("color", function(d){return showTable?"steelblue":"darkgrey"})
       // Show/Hide the table
       d3.selectAll("#" + plotType + "TableContainer")
         .classed("hidden", !showTable)
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
           if (showToolTip == true){
             // Set tooltipShow to false
             showToolTip = false;

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
             showToolTip = true;

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
             d3.select("#" + plotType + "Table").classed("hidden", true);
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
             d3.select("#" + plotType + "Table").classed("hidden", false);
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

            // Sort the years data by number of citations
            yearData =  yearData.sort(function(a, b){
                          return b["num-cites"] - a["num-cites"];
                          // return b["num-cites"] - a["num-cites"];
                        })

            // Find the cutoff value for top 15 citations & filter
            var topnum = 15;
            if (yearData.length > topnum){
              topval = yearData[topnum-1]["num-cites"];
              // topval = yearData[topnum-1]["num-cites"];

              yearData =  yearData.filter(function(d){
                            return +d["num-cites"] >= topval;
                            // return + d["num-cites"] >= topval;
                          })
            }

            // Create the html for the top values
            rows = "<tbody>"
            // Iterate through each citation in a year
            for (i=0; i < yearData.length; i++){
              rowvals = [Math.floor(yearData[i].RPY), yearData[i].author, yearData[i].journal, yearData[i]["num-cites"], Math.floor(yearData[i].CPY)];
              // rowvals = [yearData[i].RPY, yearData[i].author, yearData[i].journal, yearData[i]["num_cites"], Math.floor(yearData[i].CPY)];

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
          var topnum = 15;
          if (yearData.length > topnum){
            topval = yearData[topnum-1]["num-cites"];
            // topval = yearData[topnum-1]["num-cites"];

            yearData =  yearData.filter(function(d){
                          return +d["num-cites"] >= topval;
                          // return + d["num-cites"] >= topval;
                        })
          }

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

    function makePanel(nodes, edges, plotType){
      var nodeKeys = []
      for (var key in nodes[0]){
        nodeKeys = nodeKeys.concat(key);
      }

      var edgeKeys = []
      for (var key in edges[0]){
        edgeKeys = edgeKeys.concat(key);
      }

      var panel = document.getElementById(plotType + "Panel")

      var p = document.createElement('p')
      p.className = "panelTitle"
      var nodeTitle = document.createTextNode('Node Options')
      p.appendChild(nodeTitle)
      panel.appendChild(p)

      makeCheckBox(plotType, panel, "cbIsolates", "Isolates", true, showHideIsolates)
      makeSelect('sizeBy', "Node Size", panel, nodeKeys, nodes.sizeBy);
      makeSelect('colourBy', "Colour By", panel, nodeKeys, nodes.colourBy);

      var p = document.createElement('p')
      p.className = "panelTitle"
      var edgeTitle = document.createTextNode('Edge Options')
      p.appendChild(edgeTitle)
      panel.appendChild(p)

      makeCheckBox(plotType, panel, "cbDirected", "Directed", edges.directed, showHideArrows)
      makeCheckBox(plotType, panel, "cbWeighted", "Weighted", edges.weighted)
      makeSelect('edgeWidth', "Edge Width", panel, edgeKeys, edges.edgeWidth)
    }

    function makeSelect(type, labelText, panel, lst, selected){
      var label = document.createElement('label')
      label.className = "panelOption";
      label.for = type;
      var text = document.createTextNode(labelText);
      label.appendChild(text);
      panel.appendChild(label)

      var select = document.createElement('SELECT');
      select.className = 'select';
      select.id = type;
      for (var i in lst){
        var option = document.createElement("option")
        option.text = lst[i];
        if (selected == lst[i]){option.selected = true}
        select.add(option);
      }
      panel.appendChild(select)
      panel.appendChild(document.createElement('br'))

    }

    function makeCheckBox(plotType, panel, type, labelText, cbDefault, clickFunction=function(d){}){
      var label = document.createElement('label');
      label.className = "panelOption";
      label.onclick = function(d){
        checkbox.checked = !checkbox.checked
        clickFunction(checkbox.checked, plotType)};
      label.for = type;
      var text = document.createTextNode(labelText);
      label.appendChild(text);
      panel.appendChild(label);

      var checkbox = document.createElement('INPUT');
      checkbox.setAttribute("type", "checkbox");
      checkbox.className = "checkBox";
      checkbox.id = type;
      checkbox.defaultChecked = cbDefault;
      checkbox.onclick = function(d){clickFunction(checkbox.checked, plotType)}
      panel.appendChild(checkbox)
      panel.appendChild(document.createElement('br'))

    }

    // Node Functions
    // **************
    function nodeAttr(d, key, scale){
      // console.log(d[key], key, scale)
      if (d[key] == undefined){return key}
      else {return scale(d[key])}
    }

    function showHideIsolates(showIsolates, plotType){
      d3.select("#" + plotType + "Plot").selectAll("circle")
         .classed("hidden", !showIsolates && function(d){return d.degree == 0});
    }

    function showHideArrows(directed, plotType){
      d3.select("#" + plotType + "Plot")
        .selectAll("path")
        .style("marker-end", directed?'url("#end")':'none')

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


    exports.networkGraph = networkGraph;
    exports.standardBar = standardBar;
    exports.standardLine = standardLine;
    exports.multiRPYS = multiRPYS;
  })))
