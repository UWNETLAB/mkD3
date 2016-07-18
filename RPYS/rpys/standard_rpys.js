// Setting up the canvas
var w = 800;
var h = 400;
var outerpadding = 60;
var relWidth = 0.8;

var rpysFile = "recs.csv";
var citsFile = "cits.csv";

var citationData;

var svg = d3.select("div#container")
            .append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 800 400")
            .classed("svg-content", true);

var dataset;
d3.csv(rpysFile, function(error, data) {
  if (error){
    console.log(error);
  } else {
    dataset = data;
    standard_bar(dataset);
    // standard_line(dataset);
  }
});

function get_top_cite_help(year){
  var ret = "Finding citation...";
  var top_cites = "";

  if (citationData == undefined){
    // Read in the csv and store citationData
    d3.csv(citsFile, function(error, data){
      if (error){
        console.log(error);
      } else {
        citationData = data;

        // Filter the dataset by year
        var yearData = citationData.filter(function(d){
            return Math.floor(d.year) == year;
        });

        // Find the maximum number of citations in a year
        var max = d3.max(yearData, function(d){return d.num_cites;});

        // Find and return an html string with the top cites
        for (var i = 0; i < yearData.length; i++){
          if (yearData[i].num_cites >= max){
            top_cites += "<br/>" + yearData[i].author;
          }
        }
        // Add the top citation to the tooltip
        d3.select("#citation")
          .html(top_cites);
      }
    })
  }
  else {
    // Filter the dataset by year
    var yearData = citationData.filter(function(d){
        return Math.floor(d.year) == year;
    });

    // Find the maximum number of citations in a year
    var max = d3.max(yearData, function(d){return d.num_cites;});

    // Find and return an html string with the top cites
    // var top_cites = ""
    for (var i = 0; i < yearData.length; i++){
      if (yearData[i].num_cites >= max){
        top_cites += "<br/>" + yearData[i].author;
      }
    }
    d3.select("#citation")
      .html(top_cites);
  }
  return ret;
}

function get_top_cite(year){
  var ret = "Finding Citation...";
  var yearData;
  // Then continue to filter and store.
  d3.csv(citsFile, function(error, data){
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
        // Find the maximum number of citations for year
        var max = d3.max(yearData, function(d){return + d.num_cites;});
        var top_cites = ""
        // Find the cite string for highest number of citations
        for (var i = 0; i < yearData.length; i++){
          // top_cites += "1";
          if ( + yearData[i].num_cites >= max){
            top_cites += "<br/>" + yearData[i].author;
          };
        }
        d3.select("#citation")
          .html(top_cites);
      }
    })
  return ret;
}

function standard_line(data){
  var svg = d3.select("div#container")
              .append("svg")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 800 400")
              .classed("svg-content", true);

  var pointWidth = w / dataset.length * relWidth;
  var plotMargin = w*(2-relWidth)/(2*dataset.length);
      // ^Equivalent to barwidth/2 +(w/dataset.length * (1-relWidth))

  var xScale = d3.scaleLinear()
                 .domain([d3.min(dataset, function(d){return d.year;}),
                          d3.max(dataset, function(d){return d.year;})])
                 .range([outerpadding+plotMargin, w-plotMargin]);

  var yScale = d3.scaleLinear()
                 .domain([d3.min(dataset, function(d){return +d.abs_deviation;}),
                          d3.max(dataset, function(d){return +d.abs_deviation;})])
                 .range([h-outerpadding-plotMargin, outerpadding+plotMargin]);

  var line = d3.line()
               .curve(d3.curveNatural)
               .x(function(d) { return xScale(d.year); })
               .y(function(d) { return yScale(d.abs_deviation); });

  // Create axes
  var xname = "Reference Publication Year";
  var yname = "Difference from 5-year Median";
  make_axes(svg, xScale, yScale, xname, yname);

  // Create title
  svg.append("text")
     .attr("x", w/2)
     .attr("y", outerpadding/2)
     .attr("font-size", 24)
     .attr("text-anchor", "middle")
     .text("Standard RPYS - Deviation from 5yr Median");

  // Create circles
  svg.selectAll("circle")
     .data(dataset)
     .enter()
     .append("circle")
     .attr("class", "point")
     .attr("cx", function(d) {return xScale(d.year);})
     .attr("cy", function(d) {return yScale(d.abs_deviation);})
     .attr("fill", "#EC7063")
     .on("mouseover", function(d){
       d3.select(this)
         .attr("fill", "pink");
       // Make tooltip
       var xPos = event.clientX + 20;
       var yPos = event.clientY - 20;
      //  var xPos = parseFloat(d3.select(this).attr("cx")) + 20;
      //  var yPos = parseFloat(d3.select(this).attr("cy")) - 20;
       make_tooltip(xPos, yPos, d);
     })
     .on("mouseout", function(d){
       // Unhighlight the bar
       d3.select(this)
         .attr("fill", "#EC7063");
       // Remove the tooltip
       d3.select("#tooltip")
         .classed("hidden", true);
     })
     .on("click", function(d){
       make_table(d.year);
     });
  // Create path
  svg.append("path")
      .data([dataset])
      .attr("class", "line")
      .attr("d", line);

}

function standard_bar(data){
  // var svg = d3.select("body")
  //             .append("svg")
  //             .attr("width", w)
  //             .attr("height", h);

  var barwidth = w / dataset.length * relWidth;
  var plotMargin = w*(2-relWidth)/(2*dataset.length);
      // ^Equivalent to barwidth/2 +(w/dataset.length * (1-relWidth))

  var xScale = d3.scaleLinear()
                 .domain([d3.min(dataset, function(d){return d.year}),
                          d3.max(dataset, function(d){return d.year})])
                 .range([outerpadding+plotMargin, w-plotMargin]);

  var yScale = d3.scaleLinear()
                 .domain([0,d3.max(dataset, function(d){return  +d.count;})])
                 .range([h-outerpadding, outerpadding]);


  // Create axes
  var xname = "Reference Publication Year";
  var yname = "Citation References";
  make_axes(svg, xScale, yScale, xname, yname);

  // Create title
  svg.append("text")
     .attr("x", w/2)
     .attr("y", outerpadding/2)
     .attr("font-size", 24)
     .attr("text-anchor", "middle")
     .text("Standard RPYS - Raw Frequency");

  // Create bars
  svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("x", function(d){return xScale(d.year)-0.5*barwidth;})
     .attr("y", function(d){return yScale(d.count);})
     .attr("width", barwidth)
     .attr("height", function(d){return h - outerpadding - yScale(d.count);})
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
      //  var xPos = parseFloat(d3.select(this).attr("x")) + barwidth*2;
      //  var yPos = parseFloat(d3.select(this).attr("y")) - 20;

       make_tooltip(xPos, yPos, d)})
     .on("mouseout", function(d){
       // Unhighlight the bar
       d3.select(this)
         .attr("fill", "#52BE80");
       // Remove the tooltip
       d3.select("#tooltip")
         .classed("hidden", true);

     })
     .on("click", function(d){
       make_table(d.year);
     });

     make_icons(svg);

     }

function make_axes(svg, xScale, yScale, xname, yname){

  var formatAsChar = d3.format("c");

  var xAxis = d3.axisBottom(xScale)
                .tickFormat(formatAsChar)
                .tickArguments([5])

  var yAxis = d3.axisLeft(yScale)
                .tickSizeInner(-w)
                .ticks(5);

  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + (h - outerpadding) + ")")
     .call(xAxis)

  svg.append("g")
     .attr("class", "y axis")
     .attr("transform", "translate(" + outerpadding + ",0)")
     .call(yAxis);

  svg.append("text")
     .attr("x", w/2)
     .attr("y", h)
     .attr("text-anchor", "middle")
     .text(xname);

  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", outerpadding/4)
     .attr("text-anchor", "middle")
     .attr("x", 0-h/2)
     .text(yname);

}

function make_icons(svg){
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

    // selection
    //   .append("rect")
    //   .attr("fill", colour)
    //   .attr("x", tabx+9)
    //   .attr("y", taby+6)
    //   .attr("width", tabb)
    //   .attr("height", tabh-8);
    // //
    // selection
    //   .append("rect")
    //   .attr("fill", colour)
    //   .attr("x", tabx + 18)
    //   .attr("y", taby+6)
    //   .attr("width", tabb)
    //   .attr("height", tabh-8);
    //
    // selection
    //   .append("rect")
    //   .attr("fill", colour)
    //   .attr("x", tabx + 2)
    //   .attr("y", taby+9)
    //   .attr("width", tabw-4)
    //   .attr("height", 2);
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

  var tooltipShow = true;
  svg.append("g")
     .call(infoButton)
     .attr("class", "info icon")
     .attr("transform", "translate(686,375), scale(0.4)")
     .on("mouseover", function(d){console.log("here");})
     .on("click", function(d){
       if (tooltipShow == true){
         // Set tooltipShow to false
         tooltipShow = false;
         // Hide Tooltips

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

function make_tooltip(xPos, yPos, d){
  //  Get this bar's x & y values, then augment for tooltip
  // Update the tooltip position and values
  d3.select("#tooltip")
    .style("left", xPos + "px")
    .style("top", yPos + "px")
    .select("#value")
    .html("<emphasis>"+d.year+"</emphasis><br/>" +
          "Raw Frequency: " + "<strong>" + d.count + "</strong>"+ "<br/>" +
          "Difference from Median: " + "<strong>" + d.abs_deviation + "</strong>" + "<br/>" +
          // "Top Citation: <div id=citation>" + get_top_cite(d.year) + "</div>");
          "Top Citation(s): " + "<strong id='citation'>" + get_top_cite(d.year) + "</strong>") ;

  // Show the tooltip
  d3.select("#tooltip").classed("hidden", false);

}

function make_table(year){
  // Create the header
  headNames = ["Rank", "Author", "Journal", "Publication Year", "Number of Citations"];
  header = "<tr>";
  for (var i = 0; i < headNames.length; i++){
    header += "<th><b>" + headNames[i] + "</b></th>";
  };
  header += "</tr>";

  // Create the rows
  rows = ""
  d3.csv(citsFile, function(error, data){
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

      // Find the cutoff value for top ten citations & filter
      // Note, if the tenth top citation is tied)
      tenval = yearData[10].num_cites;
      yearData =  yearData.filter(function(d){
                    return +d.num_cites >= tenval;
                  })

      // Create the html for the top 10 values
      // Note:
      rows = ""
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
    }
    d3.select("#TopCitationsTable")
      .html(header + rows);

  })



}
