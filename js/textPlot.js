//Declarations
var margin, width, height, pointRadius;    
var svg;

var xScale, yScale, xAxis, yAxis;  

var textDataFile = "data/LIWC_chunk_counts_all_seasons.tsv",
textMetaDataFile = "data/top_5_category_words_per_episode.tsv",
textData, textMetaData, categoryNames, categoryVisibilities;

var color = d3.scaleOrdinal().range(["#020202", "#3c3c3c", "#4b4a4a", "#5e5d5d", "#727171", "#7e7e7e", "#8d8d8d", "#a19f9f", "#b6b5b5", "#C7C6C6"]);
var unfocusColor = "#BBBBB9";
var focusColor = "#020202";

var legendRects, legendLabels;

var seasonNumber = 1,episodeNumber = 1;
var pg, catG;
var catInFocus;
var circles = {};

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

function formatData (data, catName){
	return data.map(function (d){
		return {"x":parseInt(d.time),
				"y":parseInt(d[catName])};
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
    	obj[d] = d=="positive_affect";
    	    return obj;
    	}, {});

    color.domain (categoryNames);

	// Step 4: draw the legend
	var legendSpace = 450 / categoryNames.length;
	var legendGroup = svg.append("g")
	   .attr("class", "legend");

	legendRects = legendGroup.selectAll ("rect")
	.data (categoryNames)
	.enter()
	.append("rect")
	.attr("width", 10)
    .attr("height", 10)                                    
    .attr("x", width + (margin.right/3) - 15) 
    .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })
    .attr("fill", function (d, i){
    	return categoryVisibilities[d] ? color(d) : "#F1F1F2";
    })
    .attr("id", function (d){
    	return "rect-" + d;
    })
    .attr("class", "legend-box")
    .on("click", function (d){
    	categoryVisibilities[d] = !categoryVisibilities[d];
    	d3.selectAll("#rect-" + d).attr("fill", categoryVisibilities[d] ? color(d) : "#F1F1F2");
    	updateScatterPlot(sliceData (textData, seasonNumber, episodeNumber));
    })
    .on("mouseover", function (d){
        // update formerly focused category
        if(categoryVisibilities[catInFocus]) {
            circles[catInFocus].
            transition().
            attr("fill", unfocusColor);
        }
    	catInFocus = d;
    	updateBarPlot(textMetaData, seasonNumber, episodeNumber);
        // update plot colors if visible
        if(categoryVisibilities[catInFocus]) {
            circles[catInFocus].
            transition().
            attr("fill", focusColor);   
        }
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
}

function initBarPlot (data){
	catInFocus = "positive_affect";
	var div = d3.select("#text-metadata");
	div.select ("#text-category")
	.text(catInFocus);
}

function updateBarPlot (data, season, episode){
	//var catInFocus = "positive_affect";
	var parts, wordCounter;
	var div = d3.select ("#text-metadata");
	div.select("#text-category").text(catInFocus);

	for (var i = data.length - 1; i >= 0; i--) {
		if (parseInt(data[i]["season"]) == season && 
			parseInt(data[i]["episode"]) == episode) {
			parts = data[i][catInFocus].split(",")
			wordCounter = parts.map (function (entry){
				return {
					word: entry.split(":")[0],
					freq: parseInt(entry.split(":")[1])					
				}
			});
			break;
		}
	}

	var wordlist = d3.select ("#text-wordlist")
					.selectAll("li")
	               .data (wordCounter);

	wordlist.enter()
	.append("li")
	.text(function (d){
		return d.word;
	});

	wordlist.text(function (d){
		return d.word;
	});

	wordlist.exit().remove();
}

function init (){
	d3.tsv(textDataFile, function(error, data) { 
    	textData = data;
    	initScatterPlot(textData);
    	updateScatterPlot(sliceData (textData, seasonNumber, episodeNumber));
	});

	d3.tsv(textMetaDataFile, function(error, data){
		textMetaData = data;
		initBarPlot (textMetaData);
		updateBarPlot (textMetaData, seasonNumber, episodeNumber);
	})
}

init();