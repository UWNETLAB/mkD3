// *********************************************************************************************
// Copyright (C) 2016 Jillian Anderson
//
// This file is part of the metaknowledged3 framework developed for Dr John McLevey's Networks
// Lab at the University of Waterloo. For more information, see http://networkslab.org/.
//
// metaknowledged3 is free software: you can redistribute it and/or modify it under the terms
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
    // **********************
    var w = 800;
    var h = 400;
    var outerPadding = 70;
    var relWidth = 0.8;

    // Initialize Variables
    // ********************
    var rpysFile = undefined;
    var citFile = undefined;
    var ShowToolTip = true;

    // Provided Functions
    // ******************
    function standardLine(RPYSFile, CitationFile){
      rpysFile = RPYSFile;
      citFile = CitationFile;
      plotType = "standardLine"

      // Create the div container
      initDiv(plotType);

      // Create the canvas (svg)
      var svg = d3.select("div#standardLine")
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

      // Create the div container
      initDiv(plotType);

      // Create the canvas(svg)
      var svg = d3.select("div#standardBar")
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
      initDiv(plotType);

      // Make canvas
      var svg = d3.select("div#multiRPYS")
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
                     .domain(d3.extent(dataset, function(d){return +d.abs_deviation}))
                    //  .domain([d3.min(dataset, function(d){return +d.abs_deviation;}),
                    //           d3.max(dataset, function(d){return +d.abs_deviation;})])
                     .range([h-outerPadding-plotMargin, outerPadding+plotMargin]);

      // Make title
      var title = "Standard RPYS - Deviation from 5yr Median";
      makeTitle(svg, title);

      // Make axes
      var xname = "Reference Publication Year";
      var yname = "Difference from 5-year Median";
      makeAxes(svg, xScale, yScale, xname, yname);

      // Make icons
      makeIcons(svg, darkcolour, plotType);

      // Initialize the tooltip and table
      initToolTip();
      initStandardTable(plotType);

      // Make line
      var line = d3.line()
                   .curve(d3.curveMonotoneX)
                   .x(function(d) { return xScale(d.year); })
                   .y(function(d) { return yScale(d.abs_deviation); });

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
         .attr("cy", function(d) {return yScale(d.abs_deviation);})
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

      // make icons (toggles)
      makeIcons(svg, darkcolour, plotType);

      // Initialize the tooltip and table
      initToolTip();
      initStandardTable(plotType);

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
    function initDiv(plotType){
      // Initialize the multiRPYS div

      // Create the Div
      var div = document.createElement('div');
      div.id = plotType;
      div.className = "container";

      // Add the Div
      document.body.appendChild(div);
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

    function initTable(plotType, header){
      // Initialize the table
      var divTable = document.createElement('div');
      divTable.id = "TableContainer" + plotType;
      divTable.className = "container hidden";

      var table = document.createElement('table');
      table.id = "TopCitationsTable" + plotType;
      table.border = "0";
      table.cellpadding = "3";

      divTable.appendChild(table);
      var plotDiv = document.getElementById(plotType);
      document.body.insertBefore(divTable, plotDiv.nextSibling);

      var tableName = "#TopCitationsTable" + plotType;
      d3.select(tableName)
                 .html(header);

      header = d3.select(tableName)
                 .html();
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
             d3.select("#TopCitationsTable" + plotType).classed("hidden", true);
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
             d3.select("#TopCitationsTable" + plotType).classed("hidden", false);
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

    // Tooltip Functions
    // *****************
    function makeStandardToolTip(xPos, yPos, d, mode){
      // Update the tooltip position and values
      d3.select("#tooltip")
        .style("left", xPos + "px")
        .style("top", yPos + "px")
        .select("#value")
        .html("<emphasis>"+d.year+"</emphasis><br/>" +
              "Raw Frequency: " + "<strong>" + d.count + "</strong>"+ "<br/>" +
              "Difference from Median: " + "<strong>" + d.abs_deviation + "</strong>" + "<br/>" +
              "Top Citation(s): " + "<strong id='citation'>" + TopCitation(d.year) + "</strong>") ;

      // Show the tooltip
      if (ShowToolTip == true){
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
              "Raw Frequency: " + "<strong>" + d.num_cites + "</strong>"+ "<br/>" +
              "Difference from Median: " + "<strong>" + d.abs_deviation + "</strong>" + "<br/>");
              // "Top Citation(s): " + "<strong id='citation'>" + TopCitation(d.year) + "</strong>") ;

      // Show the tooltip
      if (ShowToolTip == true){
        d3.select("#tooltip").classed("hidden", false);
      }
    }

    // Table Functions
    // ***************
    function makeMultiTable(CPY, RPY, plotType){
      // Copy the header
      var tableName = "#TopCitationsTable" + plotType;
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
                          return b.num_cites - a.num_cites;
                          // return b["num-cites"] - a["num-cites"];
                        })

            // Find the cutoff value for top 15 citations & filter
            var topnum = 15;
            if (yearData.length > topnum){
              topval = yearData[topnum-1].num_cites;
              // topval = yearData[topnum-1]["num-cites"];

              yearData =  yearData.filter(function(d){
                            return +d.num_cites >= topval;
                            // return + d["num-cites"] >= topval;
                          })
            }

            // Create the html for the top values
            rows = "<tbody>"
            // Iterate through each citation in a year
            for (i=0; i < yearData.length; i++){
              rowvals = [Math.floor(yearData[i].RPY), yearData[i].author, yearData[i].journal, yearData[i].num_cites, Math.floor(yearData[i].CPY)];
              // rowvals = [yearData[i].RPY, yearData[i].author, yearData[i].journal, yearData[i]["num_cites"], Math.floor(yearData[i].CPY)];

              rows += "<tr>";
              // Append each piece of information for the citation
              for (var j=0; j < rowvals.length; j++){
                rows += "<td>" + rowvals[j] + "</td>";
              }
                rows += "</tr>";
              }
            rows += "</tbody>"

            d3.select("#TopCitationsTable" + plotType)
              .html(header + rows);

        }
      })
    }

    function makeStandardTable(year, plotType){
      // Create the header
      var tableName = "#TopCitationsTable" + plotType;
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
                        return b.num_cites - a.num_cites;
                        // return b["num-cites"] - a["num-cites"];
                      })

          // Find the cutoff value for top 15 citations & filter
          var topnum = 15;
          if (yearData.length > topnum){
            topval = yearData[topnum-1].num_cites;
            // topval = yearData[topnum-1]["num-cites"];

            yearData =  yearData.filter(function(d){
                          return +d.num_cites >= topval;
                          // return + d["num-cites"] >= topval;
                        })
          }

          // Create the html for the top values
          // Note:
          rows = "<tbody>"
          // Iterate through each citation in a year

          for (i=0; i < yearData.length; i++){
            rowvals = [i+1, yearData[i].author, yearData[i].journal, Math.floor(yearData[i].year), yearData[i].num_cites];
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

          d3.select("#TopCitationsTable" + plotType)
            .html(header + rows);
        })

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
          var max = d3.max(yearData, function(d){return + d.num_cites;});
          var top_cites = ""
          // Find the Author of the most cited work
          for (var i = 0; i < yearData.length; i++){
            if (+ yearData[i].num_cites >= max){
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

    //

    exports.standardBar = standardBar;
    exports.standardLine = standardLine;
    exports.multiRPYS = multiRPYS;
  })))
