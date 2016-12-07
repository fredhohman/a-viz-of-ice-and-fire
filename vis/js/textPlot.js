//Declarations
var margin, width, height, pointRadius;    
var svg;

var xScale, yScale, xAxis, yAxis;
// for word list bar chart
var wordlistBarWidth, wordlistBarHeight,
    wordlistBarScaleX, wordlistBarSpace,
    wordlistBarColor;

var wordBarArea, categoryWordBarArea, wordBarOffsetX, 
    wordBarOffsetY, 
    maxBars,
    wordBarMaxWidth;

var textDataFile = "data/LIWC_chunk_counts_all_seasons.tsv",
textMetaDataFile = "data/top_5_category_words_per_episode.tsv",
textDTMFile = "data/all_episode_dtm.tsv",
textTokenDataFile = "data/LIWC_chunk_token_counts_all_episodes.tsv",
textData, textMetaData, categoryNames, categoryVisibilities,
textDTM, textTokenData;

var color = d3.scaleOrdinal().range(["#020202", "#3c3c3c", "#4b4a4a", "#5e5d5d", "#727171", "#7e7e7e", "#8d8d8d", "#a19f9f", "#b6b5b5", "#C7C6C6"]);
var focusColor = "#CCCCCC";
var unfocusColor = "#333333";
var invisibleColor = "#F1F1F2";
var focusBorderColor = "#333333";
var unfocusBorderColor = "#333333";
var defaultCategory = "positive";
var defaultHouse = "stark";
var tooltipTransition, tooltipOffset;

var legendRects, legendLabels;

var seasonNumber = 1,episodeNumber = 1;
var pg, catG;
var catInFocus;
var circles = {};

/*
function sliceData (data, season, episode){
  var slicedData = Array();
  for(var index = 0; index < data.length; index++) {
    if(data[index]['season'] == season &&
       data[index]['episode'] == episode){
      slicedData.push(data[index]);
    }
  }
  return slicedData;
}
*/

function formatData (data, catName){
	return data.map(function (d){
		return {"x":parseInt(d.time),
				"y":parseInt(d[catName]),
                "name" : catName,
                "time" : d.time};
	});
}

function findMaxY (data){
	var maxYVals = data.map (function (d){
		var y = Array();
		for (var key in d){
			if (categoryVisibilities[key]){
				y.push(parseInt(d[key]));
			}
		}
		return d3.max (y);
	});

	return d3.max (maxYVals);
}
/*
function updateScatterPlot (data){
    var catName, grp;
    console.log (data.map (function (d){return parseInt(d.time);}));
    console.log (d3.extent(data, function(d) { return parseInt(d.time); }));
    xScale.domain(d3.extent(data, function(d) { return parseInt(d.time); }));

    maxY = findMaxY(data);
    yScale.domain([0,maxY]);

    // Step 1: Redraw both the axes.
    svg.select(".y.axis")
        .transition()
        .call(yAxis);

    svg.select(".x.axis")
        .transition()
        .call(xAxis);

    // Step 2: Enter or update the circles based on new data.
    for (var i=0; i < categoryNames.length; i++){
    	catName = categoryNames[i];
    	if (categoryVisibilities[catName]){
    		// Select the group corresponding to this category.
    		grp = svg.selectAll("#spg-"+ catName);
    		circles[catName] = grp.selectAll("circle")
    		.data (formatData(data, catName));

    		circles[catName]
    		.enter()
    		.append ("circle")
    		.attr ("r", pointRadius)
    		.attr ("cx", function (d){
    			return xScale (d.x);
    		})
    		.attr ("cy", function (d){
    			return yScale(d.y);
    		})
            // show relevant words at given timestep
            .on("mouseover", function(d) {
                if(d.y > 0) {
                    if(d.name == catInFocus) {
                        time = d.time;
                        // filter data
                        var relevantData = textTokenData.filter(function(d) {
                            return d.season == seasonNumber && d.episode == episodeNumber && d.time == time;
                        })[0];

                        // process data
                        var parts = relevantData[catInFocus].split(",");
                        var wordCounter = parts.map (function (entry){
                            return {
                                word: entry.split(":")[0],
                                freq: parseInt(entry.split(":")[1])                 
                            }
                        });

                        // TODO: make text actually appear
                        var xPos = xScale(d.x);
                        var yPos = yScale(d.y);
                        tip.transition()
                            .duration(tooltipTransition)
                            .style("opacity", 0.9);
                        tip.html("test </br>")
                            // .style("left", d3.event.pageX + "px")
                            // .style("top", (d3.event.pageY - 20) + "px")
                            .style("left", parseInt(xPos) + "px")
                            .style("top", parseInt(yPos) + "px");

                        // var tooltip = svg.select("div.tooltip");
                        // var tooltipWordHeight = 10;
                        // var tooltipWordBuffer = 5;
                        
                        // tooltip.transition()
                        //         .duration(tooltipTransition)
                        //         .style("opacity", .9)
                        //         .attr("height", (tooltipWordHeight + tooltipWordBuffer) * wordCounter.length);
                        // tooltip
                        // .html(wordCounter.forEach(function(d) { return d.word + "<br/>"; }))
                        //     .style("left", xPos + "px")
                        //     .style("top", yPos + "px");
                            // .attr("z-index", 1000);
                        // add text
                        // var tooltipText = tooltip.selectAll("text.tooltip")
                        //                     .data(wordCounter);
                        // tooltipText.enter()
                        //             .append("text")
                        //             .attr("class", "tooltip")
                        //             .attr("x", xPos)
                        //             .attr("y", function(d, i) {
                        //                 return yPos + tooltipWordBuffer * 2 + (tooltipWordHeight + tooltipWordBuffer) * i;
                        //             })
                        //             .text(function(d) { return d.word; })
                        //             .style("fill", unfocusColor);

                        // tooltipText.attr("x", xScale(d.x))
                        //             .attr("y", function(d, i) {
                        //                 return yPos + tooltipWordBuffer * 2 + (tooltipWordHeight + tooltipWordBuffer) * i;
                        //             })
                        //             .text(function(d) { return d.word; })
                        //             .style("fill", unfocusColor);
                    }

                }
            })
            .on("mouseout", function(d) {
                tip.transition()
                    .duration(tooltipTransition)
                    .style("opacity", 0);
                // var tooltip = svg.select("div.tooltip");
                // tooltip.transition()
                //         .duration(tooltipTransition)
                //         .style("opacity", 0);
                // var tooltipText = tooltip.selectAll("text.tooltip");
                // // console.log(tooltipText);
                // tooltipText.exit().remove();
                // tooltip.exit.remove();
            });

    		circles[catName]
    		.attr ("cx", function (d){
    			return xScale (d.x);
    		})
    		.attr ("cy", function (d){
    			return yScale(d.y);
    		});

			circles[catName].exit().remove();    		
    	}
    }

    // Step 2: Flip the visibility of the groups.
	catG.style ("visibility", function (d, i) {
	      return categoryVisibilities[d] ? "visible" : "hidden";
	});
}

var tip;
*/
function initBubblePlot (data){
    margin = {top: 20, right: 160, bottom: 100, left: 90};
    width = 900 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    // Define the initial scales and axes
    xScale = d3.scaleLinear()
    .range([0, width]);

    yScale = d3.scaleBand()
    .range([height, 0]);

    xAxis = d3.axisTop()
    .scale(xScale);

    yAxis = d3.axisLeft()
    .scale(yScale);

    // Define the div for the tooltip
    tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


    svg = d3.select("#text")
    .append("svg")
    .attr ("width", width + margin.left + margin.right)
    .attr ("height", height + margin.top + margin.bottom)
    .append ("g")
    .attr ("id", "textPlot")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Step 2: add an invisible rectange. This is not really required, 
    // but is useful for mouse-tracking.
    svg.append("rect")
    .attr("width", width)
    .attr("height", height)                                    
    .attr("x", 0) 
    .attr("y", 0)
    .attr("id", "mouse-tracker")
    .style("fill", "white")
    .style("stroke-width", "0");

    // Step 3: Draw the x and the y axis
        // draw line graph
    svg.append("g")
      .attr("class", "x axis")
      // .attr("transform", "translate(0," + height + ")")
      .attr("transform", "translate(0," + (margin.top - 10) + ")" )
      .style("stroke-width", "0")
      .call(xAxis);
    
    svg.append("g")
      .attr("class", "y axis")
      .style("stroke-width", "0")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Text counts")
      ;

    yScale.domain(categories);

    // Step 1: Redraw both the axes.
    svg.select(".y.axis")
        .transition()
        .call(yAxis);

    pg = svg.append ("g")
         .attr ("id", "spg");
}

function updateBubblePlot (data){
    // console.log (data);

    // Step 1 - Make the axis depend on the data.
    xScale.domain(d3.extent(data, function(d) { return parseInt(d.time); }));
    svg.select(".x.axis")
        .transition()
        .call(xAxis);

    // console.log (data2DotPlotRepresentation(data, categories));
    grp = svg.selectAll ("#spg");
    circles = grp.selectAll ("circle")
    .data (data2DotPlotRepresentation(data, categories));

    circles.enter()
    .append ("circle")
    .attr ("r", function (d){
        if (d.count == 0)
            return d.count
        return 4 * Math.log (d.count);
    })
    .attr ("cx", function (d){
        return xScale(d.time);
    })
    .attr("cy", function (d){
        return yScale(d.cat) + 20; // TODO: check why this 20 needs to be done.
    })
    .attr("class", function (d){
        return "category" + "-" + d.cat;
    })
    .on("mouseover", function(d, i) {      
        //tooltip.transition()        
        //        .duration(200)      
        //        .style("opacity", .9);      
        //tooltip.html( d.words + "<br/>"  + d.close)  
        //        .style("left", (d3.event.pageX) + "px")     
        //        .style("top", (d3.event.pageY - 28) + "px");  
        //d3.selectAll(".category-" + d.cat)  
        console.log(d);
         d3.selectAll("circle").attr("z-index", "1");
         d3.select(this).attr ("fill", focusColor).style("z-index", "2")
                        .attr("stroke", focusBorderColor);
         d3.select("#perSliceTitle").style("visibility", "visible");
         d3.select("#categoryWordBarArea").style ("visibility", "visible");
         d3.select("#text-metadata").select("span.category").text(d.cat);
         console.log(d3.select("#perSliceTitle").select("span.category"))
         d3.select("#perSliceTitle").select("span.time").text(d.time);
         updateCategoryBarPlot (textTokenData, seasonNumber, episodeNumber, d.time, d.cat);
    })
     
    .on("mouseout", function(d) {       
            //tooltip.transition()        
            //    .duration(500)      
            //    .style("opacity", 0);

            d3.select("#perSliceTitle").style ("visibility", "hidden");
            d3.select("#categoryWordBarArea").style ("visibility", "hidden");
            d3.select(this).attr ("fill", unfocusColor).attr("stroke", unfocusBorderColor); 
            d3.select(this).style("z-index", "1");  // Does not work; should take a look.
    });

    circles
    .attr ("r", function (d){
        if (d.count == 0)
            return d.count;
        return 4 * Math.log (d.count);
    })
    .attr ("cx", function (d){
        return xScale (d.time);
    })
    .attr ("cy", function (d){
        return yScale(d.cat) + 20;
    });

    var ticks = d3.selectAll (".y.axis")
    .selectAll (".tick").selectAll("text")
    .on("mouseover", function (z){

        d3.selectAll("circle")
        .attr("fill", unfocusColor)
        .attr("stroke", unfocusBorderColor);

        d3.selectAll(".category-" + z)
        .attr ("fill", focusColor)
        .attr("stroke", focusBorderColor);
    })
    .on ("mouseout", function (z){
        d3.selectAll("circle")
        .attr("fill", unfocusColor)
        .attr("stroke", unfocusBorderColor);        
    });

    circles.exit().remove();
}

/*
function initScatterPlot (data){
	// Initialize margins
	margin = {top: 20, right: 200, bottom: 100, left: 50};
	width = 900 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    pointRadius = 2;
    // Define the initial scales and axes
    xScale = d3.scaleLinear()
    .range([0, width]);

    yScale = d3.scaleLinear()
    .range([height, 0]);

    xAxis = d3.axisBottom()
    .scale(xScale);

	yAxis = d3.axisLeft()
    .scale(yScale);

    // Step 1: create an svg element with required height and width
    // The svg is the container element for the plot. All the 
    // plot elements are grouped together in tag identified by id=textPlot.
	svg = d3.select("#text")
	.append("svg")
	.attr ("width", width + margin.left + margin.right)
	.attr ("height", height + margin.top + margin.bottom)
	.append ("g")
	.attr ("id", "textPlot")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Step 2: add an invisible rectange. This is not really required, 
	// but is useful for mouse-tracking.
	svg.append("rect")
	.attr("width", width)
	.attr("height", height)                                    
	.attr("x", 0) 
	.attr("y", 0)
	.attr("id", "mouse-tracker")
	.style("fill", "white");

	// Step 3: Draw the x and the y axis
	    // draw line graph
    svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height + ")")
	  .call(xAxis);

	
    svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis)
	  .append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("x", -10)
	  .attr("dy", ".71em")
	  .style("text-anchor", "end")
	  .text("Text counts");

	// Read the data and extract the column names
	categoryNames = d3.keys(data[0]).filter(function(key) {  
            return key !== "time" && key !== "season" && key !== "episode";
        });

    categoryVisibilities = categoryNames.reduce (function (obj, d){
    	obj[d] = d==defaultCategory;
    	    return obj;
    	}, {});

    color.domain (categoryNames);

    catInFocus = defaultCategory;

	// Step 4: draw the legend
	var legendSpace = 450 / categoryNames.length;
	var legendGroup = svg.append("g")
	   .attr("class", "legend");
    var tooltipTransition = 500;
    var tooltipOffset = 30;

	legendRects = legendGroup.selectAll ("rect")
	.data (categoryNames)
	.enter()
	.append("rect")
	.attr("width", 10)
    .attr("height", 10)
    .attr("x", width + (margin.right/3) - 15)
    .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })
    .attr("fill", function (d, i){
        if(categoryVisibilities[d]) {
            if(d == catInFocus) {
                return focusColor;
            }
            else { 
                return unfocusColor;
            }
        }
        else {
            return invisibleColor;
        }
    	//return categoryVisibilities[d] ? color(d) : invisibleColor;
    })
    .attr("id", function (d){
    	return "rect-" + d;
    })
    .attr("class", "legend-box")
    .on("click", function (d){
    	categoryVisibilities[d] = !categoryVisibilities[d];
    	d3.selectAll("#rect-" + d).attr("fill", categoryVisibilities[d] ? color(d) : invisibleColor);
    	updateScatterPlot(sliceData (textData, seasonNumber, episodeNumber));
        var newCategory = d;
        // if new category is no longer visible,
        // assign focus to nearest category
        if(!categoryVisibilities[d])
        {
            var visibleCategories = categoryNames.filter(function(d) {return categoryVisibilities[d];});
            if(visibleCategories.length > 0){
                
                var idx = categoryNames.indexOf(d);
                var nearestCategory = visibleCategories[0];
                var nearestDist = categoryNames.length;
                for(var i = 0; i < visibleCategories.length; i++){
                    var category = visibleCategories[i];
                    var dist = Math.abs(idx - categoryNames.indexOf(category));
                    console.log(category);
                    console.log(dist);
                    if(dist < nearestDist){
                        nearestCategory = category;
                        nearestDist = dist;
                        console.log(nearestCategory);
                    }
                }
                console.log(nearestCategory);
                newCategory = nearestCategory;
            }
            
        }
        updateFocus(newCategory);
    })
    .on("mouseover", function (d){
        // console.log(d);
        updateFocus(d);
    });

    legendLabels = legendGroup.selectAll ("text")
    .data (categoryNames)
    .enter()
    .append("text")
    .attr("x", width + (margin.right/3)) 
    .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace);})
    .text(function(d) { return d; });

    pg = svg.append ("g")
         .attr ("id", "spg");

    catG = pg.selectAll ("g")
    .data (categoryNames)
    .enter()
    .append("g")
    .attr("id", function (d){ 
    	return "spg-" + d;
    })
    .attr("class", "spg-cats");

    // make tooltip?
    //tip = d3.select("g#spg")
    tip = svg.append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    // svg.append("rect")
    //     .attr("class", "tooltip")
    //     .style("opacity", 0);
}
*/


function initBarPlot (data){
    wordlistBarWidth = 200;
    wordlistBarHeight = 15;
    wordlistBarScaleX = d3.scaleLinear()
                        .range([0, 10])
                        .domain([0, 2.5]);
    wordlistBarSpace = 5;
    wordBarMaxWidth = 150;
    wordlistBarColor = "#CCCCCC";
    catInFocus = defaultCategory;
	// catInFocus = "defaultCategory";
	var div = d3.select("#text-metadata");
	div.select ("#text-category")
	.text(catInFocus);
    // now build bar chart
    // offset x should be at least as wide
    // as the longest word, in order to fit it
    wordBarOffsetX = 85;
    wordBarOffsetY = 15;
    maxBars = 10;

    // episode-level word summary

    wordBarArea = d3.select("#text-metadata")
               .append("svg")
               .attr("class", "wordBarArea")
               .attr ("width", wordBarOffsetX + wordlistBarWidth + wordBarOffsetX)
               .attr ("height", wordBarOffsetY + (wordlistBarHeight + wordlistBarSpace) * maxBars)
               .append ("g")
               .attr ("id", "wordBarArea");

    // TODO: how to add category name??
    // d3.select("#text-metadata")
    //     .append("b")
    //     .append("span")
    //     .attr("class", "category");

    var perSliceTitle = d3.select ("#text-metadata")
                        .append ("h4")
                        .attr ("id", "perSliceTitle")
                        .text ("Words in slice ")
                        .style("visibility", "hidden");

    // var tmp = perSliceTitle.append ("b").append("span").attr("class", "category");
    // console.log(tmp);

    // perSliceTitle.text ("Words in slice ")
    //             .style("visibility", "hidden");

    d3.select('#perSliceTitle').append ("b").append("span").attr("class", "time");
    // time chunk level category summary
    categoryWordBarArea = d3.select("#text-metadata")
               .append("svg")
               .attr("class", "categoryWordBarArea")
               .attr ("width", wordBarOffsetX + wordlistBarWidth + wordBarOffsetX)
               .attr ("height", wordBarOffsetY + (wordlistBarHeight + wordlistBarSpace) * maxBars)
               .append ("g")
               .attr ("id", "categoryWordBarArea");

    // make axis
    wordBarArea.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + wordBarOffsetX + ",0)");

    // make axis
    categoryWordBarArea.append ("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + wordBarOffsetX + ",0)");
}

function initHouseBubblePlot(houseCountData) {
    var margin = {top: 20, right: 160, bottom: 100, left: 150};
    var width = 900 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Define the initial scales and axes
    var xScale = d3.scaleLinear()
    .range([0, width])
    .domain(d3.extent(houseCountData.map(function(d) { return d.time; })));
    // console.log(d3.extent(function(d) { return d.time; }));

    var yScale = d3.scaleBand()
    .range([height, 0]);

    var xAxis = d3.axisTop()
    .scale(xScale);

    var yAxis = d3.axisLeft()
    .scale(yScale);

    var div = d3.select("div#cs3");

    svgHouses = d3.select(".col-md-8#houses")
    .select("svg#house-bubble-plot")
    // .append("svg")
    .attr ("width", width + margin.left + margin.right)
    .attr ("height", height + margin.top + margin.bottom)
    .append ("g")
    .attr ("id", "textPlot")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Step 2: add an invisible rectange. This is not really required, 
    // but is useful for mouse-tracking.
    svgHouses.append("rect")
    .attr("width", width)
    .attr("height", height)                                    
    .attr("x", 0) 
    .attr("y", 0)
    .attr("id", "mouse-tracker")
    .style("fill", "white")
    .style("stroke-width", "0");

    // Step 3: Draw the x and the y axis
        // draw line graph
    svgHouses.append("g")
      .attr("class", "x axis")
      // .attr("transform", "translate(0," + height + ")")
      .attr("transform", "translate(0," + (margin.top - 10) + ")" )
      .style("stroke-width", "0")
      .call(xAxis);
    
    svgHouses.append("g")
      .attr("class", "y axis")
      .style("stroke-width", "0")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Text counts")
      ;

    // var allHouses = d3.keys(houseCountData[0]).filter(function(d) {
    //     return d != "season" && d != "episode" && d != "time";
    // });
    // console.log(allHouses);

    yScale.domain(houses);

    // Step 1: Redraw both the axes.
    svgHouses.select(".y.axis")
        .transition()
        .call(yAxis);

    svgHouses.append ("g")
            .attr ("id", "spg");

    // console.log(houseCountData);
    var houseDataDots = data2DotPlotRepresentationBasic(houseCountData, houses);
    console.log(houseDataDots.length);
    // houseDataDots = houseDataDots.filter(function(d) { 
    //     return typeof(d.time) == "number";
    // });
    // console.log(houseDataDots.length);
    grp = svgHouses.selectAll ("#spg");
    circles = grp.selectAll ("circle")
    .data (houseDataDots);

    circles.enter()
    .append ("circle")
    .attr ("r", function (d){
        if (d.count == 0)
            return d.count;
        return 4 * Math.log (d.count);
    })
    .attr ("cx", function (d){
        return xScale(d.time);
    })
    .attr("cy", function (d){
        return yScale(d.cat) + 20; // TODO: check why this 20 needs to be done.
    })
    .attr("class", function (d){
        return "category" + "-" + d.cat;
    })
    .on("mouseover", function(d, i) {      
        //tooltip.transition()        
        //        .duration(200)      
        //        .style("opacity", .9);      
        //tooltip.html( d.words + "<br/>"  + d.close)  
        //        .style("left", (d3.event.pageX) + "px")     
        //        .style("top", (d3.event.pageY - 28) + "px");  
        //d3.selectAll(".category-" + d.cat)  
         grp.selectAll("circle").attr("z-index", "1");
         d3.select(this).attr ("fill", focusColor).style("z-index", "2")
                        .attr("stroke", focusBorderColor);
         // d3.select("#perSliceTitle").style("visibility", "visible");
         // d3.select("#categoryWordBarArea").style ("visibility", "visible");
         // d3.select("#text-metadata").select("span.category").text(d.cat);
         // console.log(d3.select("#perSliceTitle").select("span.category"))
         // d3.select("#perSliceTitle").select("span.time").text(d.time);
         // updateCategoryBarPlot (textTokenData, seasonNumber, episodeNumber, d.time, d.cat);
    })
     
    .on("mouseout", function(d) {       
            //tooltip.transition()        
            //    .duration(500)      
            //    .style("opacity", 0);

            d3.select("#perSliceTitle").style ("visibility", "hidden");
            d3.select("#categoryWordBarArea").style ("visibility", "hidden");
            d3.select(this).attr ("fill", unfocusColor).attr("stroke", unfocusBorderColor); 
            d3.select(this).style("z-index", "1");  // Does not work; should take a look.
    });

    circles
    .attr ("r", function (d){
        if (d.count == 0)
            return d.count;
        return 4 * Math.log (d.count);
    })
    .attr ("cx", function (d){
        return xScale (d.time);
    })
    .attr ("cy", function (d){
        return yScale(d.cat) + 20;
    });

    var ticks = d3.selectAll (".y.axis")
    .selectAll (".tick").selectAll("text")
    .on("mouseover", function (z){

        d3.selectAll("circle")
        .attr("fill", unfocusColor)
        .attr("stroke", unfocusBorderColor);

        d3.selectAll(".category-" + z)
        .attr ("fill", focusColor)
        .attr("stroke", focusBorderColor);
    })
    .on ("mouseout", function (z){
        d3.selectAll("circle")
        .attr("fill", unfocusColor)
        .attr("stroke", unfocusBorderColor);        
    });

    // circles.exit().remove();
    var wordlistBarWidth = 100;
    var wordlistBarHeight = 15;
    var wordlistBarScaleX = d3.scaleLinear()
                            .range([0, 10])
                            .domain([0, 2.5]);
    var wordlistBarSpace = 5;
    var wordBarMaxWidth = 150;
    wordlistBarColor = "#CCCCCC";
    houseInFocus = defaultHouse;
    
    div.select("#text-metadata")
            .select ("#text-category")
            .text(houseInFocus);
    // now build bar chart
    // offset x should be at least as wide
    // as the longest word, in order to fit it
    var wordBarOffsetX = 0;
    var wordBarOffsetY = 15;
    var maxBars = 5;

    // episode-level word summary

    wordBarArea = svgHouses.select("#text-metadata")
               .append("svg")
               .attr("class", "wordBarArea")
               .attr ("width", wordBarOffsetX + wordlistBarWidth + wordBarOffsetX)
               .attr ("height", wordBarOffsetY + (wordlistBarHeight + wordlistBarSpace) * maxBars)
               .append ("g")
               .attr ("id", "wordBarArea");

    // TODO: how to add category name??
    // d3.select("#text-metadata")
    //     .append("b")
    //     .append("span")
    //     .attr("class", "category");

    // var perSliceTitle = d3.select ("#text-metadata")
    //                     .append ("h4")
    //                     .attr ("id", "perSliceTitle")
    //                     .text ("Words in slice ")
    //                     .style("visibility", "hidden");

    // var tmp = perSliceTitle.append ("b").append("span").attr("class", "category");
    // console.log(tmp);

    // perSliceTitle.text ("Words in slice ")
    //             .style("visibility", "hidden");

    d3.select('#perSliceTitle').append ("b").append("span").attr("class", "time");
    // time chunk level category summary
    var houseWordBarArea = div.select("#text-metadata")
               .append("svg")
               .attr("class", "categoryWordBarArea")
               .attr ("width", wordBarOffsetX + wordlistBarWidth + wordBarOffsetX)
               .attr ("height", wordBarOffsetY + (wordlistBarHeight + wordlistBarSpace) * maxBars)
               .append ("g")
               .attr ("id", "categoryWordBarArea");

    // make axis
    houseWordBarArea.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + wordBarOffsetX + ",0)");

    // make axis
    houseWordBarArea.append ("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + wordBarOffsetX + ",0)");
}

function updateHouseBarChart(data, house, time) {
    
}

function initAll(textDTM, textTokenData) {
    initBubblePlot(textTokenData);
    initBarPlot(textDTM);
}

function updateAll (season, episode) {
    //updateScatterPlot (sliceData (textData, seasonNumber, episodeNumber));
    updateBarPlot (textDTM, seasonNumber, episodeNumber);
    updateBubblePlot (sliceData (textTokenData, seasonNumber, episodeNumber));
}

function updateCategoryBarPlot (data, season, episode, time, cat){
    //console.log (data);
    //console.log (season);
    //console.log (episode);
    //console.log (time);
    var timeSlice = data.filter(function(elem) {  
            return elem.season == season && elem.episode == episode && elem.time == time;
        })[0][cat];
    
    var sortable = [];
    //console.log (timeSlice);

    for (var i = 0; i < timeSlice.length; i++)
        sortable.push([timeSlice[i].word, timeSlice[i].freq]);
     //console.log(sortable);
    // apparently we're getting some functions instead of strings
    sortable = sortable.filter(function(d) {
        return typeof(d[0]) == "string" && typeof(d[1]) == "number";
    });

    sortable = sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    //console.log(sortable);

    var wordCounter = []; 
    for(var i = 0; i < Math.min(sortable.length, maxBars); i++) {
        // var word = allWords[i];
        wordCounter[wordCounter.length] = {
            word: sortable[i][0],
            freq: sortable[i][1],
        };
    }

    //console.log (wordCounter);

    var wordlistBarScaleX = d3.scaleLinear()
                                .domain([0, d3.max(wordCounter, function(d) { return d.freq; })])
                                .range([0, wordBarMaxWidth]);

    //var offSetY = 
    var wordlistBarScaleY = d3.scaleLinear()
                            .domain([0, wordCounter.length])
                            .range([wordBarOffsetY, 
                                    wordBarOffsetY + (wordlistBarHeight + wordlistBarSpace) * wordCounter.length]);
    
    // first build axis
    var wordBarAxis = d3.axisLeft()
                        .scale(wordlistBarScaleY)
                        .tickSize(5)
                        .tickFormat(function(d, i) { return wordCounter[i].word; })
                        .tickValues(d3.range(wordCounter.length));
    
    var wordBar_xis = categoryWordBarArea.selectAll("g.axis")
                        .call(wordBarAxis);


    var wordBars = categoryWordBarArea.selectAll("rect")
                    .data(wordCounter);

    wordBars.enter()
        .append("rect")
        .attr("x", wordBarOffsetX)
        .attr("y", function(d, i) { return wordlistBarScaleY(i) - wordBarOffsetY / 2;})
        .style("fill", wordlistBarColor)
        .attr("height", wordlistBarHeight)
        .attr("width", function(d) { return wordlistBarScaleX(d.freq);} );

    wordBars.attr("width", function(d) { return wordlistBarScaleX(d.freq);} );

    // add text for frequencies!
    var wordBarText = categoryWordBarArea.selectAll("text.wordFreq")
                        .data(wordCounter);
    wordBarText.enter()
        .append("text")
        .attr("class", "wordFreq")
        .attr("x", function(d) {return wordBarOffsetX + 5 + wordlistBarScaleX(d.freq); })
        .attr("y", function(d, i) { return wordlistBarScaleY(i) + wordlistBarHeight / 4;})
        .text(function(d) { return d.freq + ""; })
        .style("fill", "#000000");
        // .style("font-size", "12px");

    wordBarText
    .attr("x", function(d) {return wordBarOffsetX + 5 + wordlistBarScaleX(d.freq); })
    .text(function(d) {
        return d.freq + "";
    });

    wordBar_xis.exit().remove();
    wordBars.exit().remove();
    wordBarText.exit().remove();
}

function updateBarPlot (data, season, episode){
    // console.log(season);
    // console.log(episode);
	var parts, wordCounter;
	var div = d3.select ("#text-metadata");
	// div.select("#text-category").text(catInFocus);

    // slice DTM data!
    var slicedData = sliceData(data, season, episode)[0];

    // console.log(slicedData);
    // now sort!
    var allWords = d3.keys(slicedData).filter(function(d) {
        return d != "season" && d != "episode";
    });
    // allWords.sort(function(a, b) {
    //     return slicedData[b] - slicedData[a];
    // })
    // console.log(allWords);

    var sortable = [];
    for (var w in allWords)
        sortable.push([allWords[w], slicedData[allWords[w]]])
    // console.log(sortable);
    // apparently we're getting some functions instead of strings
    sortable = sortable.filter(function(d) {
        return typeof(d[0]) == "string" && typeof(d[1]) == "number";
    });

    sortable = sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    // console.log(sortable);

    var wordCounter = []; 
    for(var i = 0; i < maxBars; i++) {
        // var word = allWords[i];
        wordCounter[wordCounter.length] = {
            word: sortable[i][0],
            freq: sortable[i][1],
        };
    }

    var wordlistBarScaleX = d3.scaleLinear()
                                .domain([0, d3.max(wordCounter, function(d) { return d.freq; })])
                                .range([0, wordBarMaxWidth]);

    var wordlistBarScaleY = d3.scaleLinear()
                            .domain([0, wordCounter.length])
                            .range([wordBarOffsetY, 
                                    wordBarOffsetY + (wordlistBarHeight + wordlistBarSpace) * wordCounter.length]);
    // now attempt to add some bars to measure frequency
    // var wordlistBoundingRect = d3.select("#text-wordlist")
    //                             ._groups[0][0]
    //                             .getBoundingClientRect();
    // console.log(wordlistBoundingRect);
    
    // var wordlistX = wordlistBoundingRect["left"],
    //     wordlistY = 0;
    //     wordlistY = wordlistBoundingRect["bottom"];
    // make some bars!!
    
    // first build axis
    var wordBarAxis = d3.axisLeft()
                        .scale(wordlistBarScaleY)
                        .tickSize(5)
                        .tickFormat(function(d, i) { return wordCounter[i].word; })
                        .tickValues(d3.range(wordCounter.length));
    
    var wordBar_xis = wordBarArea.selectAll("g.axis")
                        .call(wordBarAxis)
                        ;
    var wordBars = wordBarArea.selectAll("rect")
                    .data(wordCounter);

    wordBars.enter()
        .append("rect")
        .attr("x", wordBarOffsetX)
        .attr("y", function(d, i) { return wordlistBarScaleY(i) - wordBarOffsetY / 2;})
        .style("fill", wordlistBarColor)
        .attr("height", wordlistBarHeight)
        .attr("width", function(d) { return wordlistBarScaleX(d.freq);} );

    wordBars.attr("width", function(d) { return wordlistBarScaleX(d.freq);} );

    // add text for frequencies!
    var wordBarText = wordBarArea.selectAll("text.wordFreq")
                        .data(wordCounter);
    wordBarText.enter()
        .append("text")
        .attr("class", "wordFreq")
        .attr("x", function(d) {return wordBarOffsetX + 5 + wordlistBarScaleX(d.freq); })
        .attr("y", function(d, i) { return wordlistBarScaleY(i) + wordlistBarHeight / 4;})
        .text(function(d) { return d.freq + ""; })
        .style("fill", "#000000");
        // .style("font-size", "12px");

    wordBarText
    .attr("x", function(d) {return wordBarOffsetX + 5 + wordlistBarScaleX(d.freq); })
    .text(function(d) {
        return d.freq + "";
    });
    // console.log(wordBarText);
    // TODO: make the bars and text
    // update properly instead of overwriting!
    wordBar_xis.exit().remove();
    wordBars.exit().remove();
    wordBarText.exit().remove();
}

/*function updateFocus(newFocusCat) {
    catInFocus = newFocusCat;
    // update legend rectangles
    legendRects
    .transition()
    .attr("fill", function(d) {
        if(categoryVisibilities[d]) {
            if(d == catInFocus) {
                return focusColor;
            }
            else {
                return unfocusColor;
            }
        }
        else {
            return invisibleColor;
        }
    });
    // update circles
    var visibleCategories = categoryNames.filter(function(d) {return categoryVisibilities[d];});
    // TODO: make circles unfocus when focus
    // shifts to invisible category!
    visibleCategories.forEach(function(d) {
        if(d == catInFocus){
            console.log(d);
            circles[d]
            .transition()
            .attr("fill", focusColor);
        }
        else {
            console.log(d);
            circles[d]
            .transition()
            .attr("fill", unfocusColor);    
        }
    });

    // circles["positive"]
    // .transition()
    // .attr("fill", unfocusColor);
    // if(categoryVisibilities[catInFocus]){
    //     console.log(catInFocus);
    //     circles[catInFocus]
    //     .transition()
    //     .attr("fill", focusColor);
    // }
    // update bar chart
    updateBarPlot(textMetaData, seasonNumber, episodeNumber);
}*/

