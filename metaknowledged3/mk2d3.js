(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined'){
    factory(exports);
  } else {
    (factory((global.mkd3 = global.mkd3 || {})));
  }} (this, (function(exports){

    var w = 800;
    var h = 400;
    var outerPadding = 60;
    var relWidth = 0.8;
    var rpysFile;
    var citFile;
    var ShowSBToolTip = true;


    function standardBar(RPYSFile, CitationFile){
      rpysFile = RPYSFile;
      citFile = CitationFile;
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

    function standardBarHelper(dataset, svg){
      // Set up important values
      var barWidth = w / dataset.length * relWidth;
      var plotMargin = w * (2-relWidth)/(2*dataset.length)
          // ^ Equivalent to barWidth/2 + (w/dataset.length * (1-relWidth))

      // Create the scale for the x axis
      var xScale = d3.scaleLinear()
                     .domain([d3.min(dataset, function(d){return d.year}),
                              d3.max(dataset, function(d){return d.year})])
                     .range([outerPadding+plotMargin, w-plotMargin]);

      // Create the scale for the y axis
      var yScale = d3.scaleLinear()
                     .domain([0,d3.max(dataset, function(d){return  +d.count;})])
                     .range([h-outerPadding, outerPadding]);

      // make title
      var title = "Standard RPYS - Raw Frequency";
      makeTitle(svg, title);

      // make axes
      var xname = "Reference Publication Year";
      var yname = "Citation References";
      makeStandardAxes(svg, xScale, yScale, xname, yname);

      // make icons (toggles)
      makeIcons(svg);

      // Initialize the tooltip and table
      initToolTip();
      initTable();

      // make bars
      svg.selectAll("rect")
         .data(dataset)
         .enter()
         .append("rect")
         .attr("x", function(d){return xScale(d.year)-0.5*barWidth;})
         .attr("y", function(d){return yScale(d.count);})
         .attr("width", barWidth)
         .attr("height", function(d){return h - outerPadding - yScale(d.count);})
         .attr("fill", "#52BE80")
         .attr("stroke", "white")
         .attr("stroke-width", 1)
         .on("mouseover", function(d){
           //Highlight bar
           d3.select(this)
             .attr("fill", "#A9DFBF");

           // Add the tooltip
           var xPos = event.clientX + 20;
           var yPos = event.clientY - 20;
           makeStandardToolTip(xPos, yPos, d)})
         .on("mouseout", function(d){
           // Unhighlight the bar
           d3.select(this)
             .attr("fill", "#52BE80");
           // Remove the tooltip
           d3.select("#tooltip")
             .classed("hidden", true);
         })
         .on("click", function(d){
           makeStandardTable(d.year);
         });

    }

    function initToolTip(){
      var divToolTip = document.createElement('div');
      var paragraph = document.createElement('p');
      var sp = document.createElement('span');
      sp.id = "value";

      paragraph.appendChild(sp);
      divToolTip.appendChild(paragraph);
      document.body.appendChild(divToolTip);
      divToolTip.id = "tooltipStandardBar";
      divToolTip.className = "hidden";
    }

    function initTable(){
      // Initialize the table
      var divTable = document.createElement('div');
      divTable.id = "TableContainer";
      divTable.className = "container hidden";

      var table = document.createElement('table');
      table.id = "TopCitationsTable"
      table.border = "0";
      table.cellpadding = "3";

      divTable.appendChild(table);
      document.body.appendChild(divTable);

      var header = "<thead><tr><th width=10%><b>Rank</b></th><th width=22%><b>Author</b></th>" +
                   "<th width=35%><b>Journal</b></th><th width=17%><b>Year Published</b></th>" +
                  "<th width=15%><b>Times Cited</b></th></tr></thead>"

      d3.select("#TopCitationsTable")
                 .html(header);
    }

    function makeTitle(svg, title){
      svg.append("text")
         .attr("x", w/2)
         .attr("y", outerPadding/2)
         .attr("font-size", 24)
         .attr("text-anchor", "middle")
         .text(title);
    }

    function makeStandardAxes(svg, xScale, yScale, xname, yname){
      var formatAsChar = d3.format("c");

      var xAxis = d3.axisBottom(xScale)
                    .tickFormat(formatAsChar)
                    .tickArguments([5]);

      var yAxis = d3.axisLeft(yScale)
                    .tickSizeInner(-w)
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
         .attr("y", h)
         .attr("text-anchor", "middle")
         .text(xname);

      svg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", outerPadding/4)
         .attr("text-anchor", "middle")
         .attr("x", 0-h/2)
         .text(yname);
    }

    function makeStandardToolTip(xPos, yPos, d){
      // Update the tooltip position and values
      d3.select("#tooltipStandardBar")
        .style("left", xPos + "px")
        .style("top", yPos + "px")
        .select("#value")
        .html("<emphasis>"+d.year+"</emphasis><br/>" +
              "Raw Frequency: " + "<strong>" + d.count + "</strong>"+ "<br/>" +
              "Difference from Median: " + "<strong>" + d.abs_deviation + "</strong>" + "<br/>" +
              "Top Citation(s): " + "<strong id='citation'>" + TopCitation(d.year) + "</strong>") ;

      // Show the tooltip
      if (ShowSBToolTip == true){
        d3.select("#tooltipStandardBar").classed("hidden", false);
      }
    }

    function makeStandardTable(year){
      // Create the header
      header = d3.select("#TopCitationsTable")
                 .html().split('<tbody>')[0];

      // Create the rows
      rows = ""
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
                      })

          // Find the cutoff value for top 15 citations & filter
          tenval = yearData[14].num_cites;
          yearData =  yearData.filter(function(d){
                        return +d.num_cites >= tenval;
                      })

          // Create the html for the top 10 values
          // Note:
          rows = "<tbody>"
          // Iterate through each citation in a year
          for (i=0; i < yearData.length; i++){
            rowvals = [i+1, yearData[i].author, yearData[i].journal, Math.floor(yearData[i].year), yearData[i].num_cites];
            rows += "<tr>";
            // Append each piece of information for the citation
            for (var j=0; j < rowvals.length; j++){
              rows += "<td>" + rowvals[j] + "</td>";
            }
              rows += "</tr>";
            }
            rows += "</tbody>"
          }

          d3.select("#TopCitationsTable")
            .html(header + rows);
        })

    }

    function makeIcons(svg){
      // Make the info button
      var colour = "#2ECC71";

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
         .on("mouseover", function(d){console.log("here");})
         .on("click", function(d){
           if (ShowSBToolTip == true){
             // Set tooltipShow to false
             ShowSBToolTip = false;

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
             ShowSBToolTip = true;

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
         .attr("transform", "translate(680,385) scale(0.4)")
         .on("click", function(d){
           if (tableShow == true){
             // Set tableShow to false
             tableShow = false;
             // Hide the table
             d3.select("#TopCitationsTable").classed("hidden", true);
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
             d3.select("#TopCitationsTable").classed("hidden", false);
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

    exports.standardBar = standardBar;
  })))


  // function standard_bar(rpysFile, citationFile){
  // // Create the 'canvas'
  //
  // // Read in the data
  //
  //
  // make_bars(rpysFile)
  // make_axes()
  // make_tooltip()
  // make_table()
  // }
  //
  // function standard_line(){
  // // Create the 'canvas'
  //
  // // Read in the data
  //
  // make_line()
  // make_axes()
  // make_tooltip()
  // make_table()
  // }
