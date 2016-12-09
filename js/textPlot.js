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
var houseBarOffsetX, houseBarColor, 
houseBarWidth, houseBarHeight,
houseBarOffsetY, houseBarSpace;

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

function initBubblePlot (data){
    margin = {top: 30, right: 160, bottom: 100, left: 90};
    width = 900 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    // Define the initial scales and axes
    xScale = d3.scaleLinear()
    .range([0, width])
    .nice();

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

    svg.append ("text")
    .attr ("transform", "translate (" + (width/2) + ", -15)")
    .style("text-anchor", "middle")
    .text("Time slices (~one minute each)");
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
    .attr("fill", unfocusColor)
    .on("mouseover", function(d, i) {      
        //tooltip.transition()        
        //        .duration(200)      
        //        .style("opacity", .9);      
        //tooltip.html( d.words + "<br/>"  + d.close)  
        //        .style("left", (d3.event.pageX) + "px")     
        //        .style("top", (d3.event.pageY - 28) + "px");  
        //d3.selectAll(".category-" + d.cat)  
        
         d3.selectAll("circle").attr("z-index", "1");
         d3.select(this).attr ("fill", focusColor).style("z-index", "2")
                        .attr("stroke", focusBorderColor);
         d3.select("#perSliceTitle").style("visibility", "visible");
         d3.select("#categoryWordBarArea").style ("visibility", "visible");
         d3.select("#text-metadata").select("span.category").text(d.cat);
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
    })
    ;

    circles
    .transition()
    .duration(400)
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
    wordBarOffsetX = 100;
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
                        .style("visibility", "hidden");

    // var tmp = perSliceTitle.append ("b").append("span").attr("class", "category");
    // console.log(tmp);

    // perSliceTitle.text ("Words in slice ")
    //             .style("visibility", "hidden");


    d3.select ("#perSliceTitle").html('Words in slice <b><span class="time"></span></b> for <b><span class="category"></span></b> category');

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

function initHousePlots(houseCountData) {
    var margin = {top: 30, right: 160, bottom: 30, left: 90};
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
    //.tickValues(d3.range (1, 11));

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

    svgHouses.append ("text")
    .attr ("transform", "translate (" + (width/2) + ", -15)")
    .style("text-anchor", "middle")
    .text("Episodes");

    // 
    // console.log(houseCountData);
    var houseDataDots = data2DotPlotRepresentationBasic(houseCountData, houses);
    // console.log(houseDataDots.length);
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
        return 2 * Math.log (d.count);
    })
    .attr ("cx", function (d){
        return xScale(d.time);
    })
    .attr("cy", function (d){
        return yScale(d.cat) + 28; // TODO: check why this 20 needs to be done.
    })
    .attr("class", function (d){
        return "category" + "-" + d.cat;
    })
    .attr("fill", unfocusColor)
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
         updateHouseBarPlot(houseTokenData, d.cat, d.time);
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
        // updateHouseBarPlot(houseToken, house, time); 
    });

    // circles.exit().remove();
    var wordlistBarScaleX = d3.scaleLinear()
                            .range([0, 10])
                            .domain([0, 2.5]);
    
    
    houseInFocus = defaultHouse;
    
    div.select("#text-metadata")
            .select ("#text-category")
            .text(houseInFocus);

    // now build bar chart
    // offset x should be at least as wide
    // as the longest word, in order to fit it

    var maxBars = 5;
    houseBarOffsetX = 160;
    houseBarColor = "#CCCCCC";
    houseBarWidth = 150;
    houseBarHeight = 10;
    houseBarOffsetY = 20;
    houseBarSpace = 10;

    // episode-level word summary

    var houseBarArea = d3.select("#house-bar-plot")
               .append("svg")
               .attr("class", "houseBarArea")
               .attr ("width", houseBarOffsetX + houseBarWidth + houseBarOffsetX)
               .attr("transform", "translate(" + margin.left + ", 0)")
               .attr ("height", (houseBarHeight + houseBarSpace) * maxBars + houseBarOffsetY * 2.5);
    // houseBarArea.append ("g")
    //             .attr ("id", "houseBarPlot");
    console.log(houseBarArea);

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

    // svgHouses.select('#perEpisodeTitle').append ("b").append("span").attr("class", "time");
    // time chunk level category summary
    // var houseBarArea = div.select("#text-metadata")
    //            .append("svg")
    //            .attr("class", "categoryWordBarArea")
    //            .attr ("width", wordBarOffsetX + wordlistBarWidth + wordBarOffsetX)
    //            .attr ("height", wordBarOffsetY + (wordlistBarHeight + wordlistBarSpace) * maxBars)
    //            .append ("g")
    //            .attr ("id", "categoryWordBarArea");

    // make axis
    houseBarArea.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + houseBarOffsetX + ",0)")
                .style("stroke-width", 0);
}

function updateHouseBarPlot(data, house, time) {
    // TODO:
    var timeSlice = data.filter(function(elem) {  
        return elem.time == time;
    })[0][house];
    
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

    var houseBarScaleX = d3.scaleLinear()
                                .domain([0, d3.max(wordCounter, function(d) { return d.freq; })])
                                .range([0, houseBarWidth]);

    var houseBarScaleY = d3.scaleLinear()
                            .domain([0, wordCounter.length])
                            .range([houseBarOffsetY, 
                                    houseBarOffsetY + (houseBarHeight + houseBarSpace) * wordCounter.length]);
    
    // first build axis
    var houseBarAxis = d3.axisLeft()
                        .scale(houseBarScaleY)
                        .tickSize(5)
                        .tickFormat(function(d, i) { return wordCounter[i].word; })
                        .tickValues(d3.range(wordCounter.length));
    
    var houseBarArea = d3.select("#house-bar-plot").select("svg.houseBarArea");

    var houseBar_xis = houseBarArea.selectAll("g.axis")
                        .call(houseBarAxis);

    var houseBars = houseBarArea.selectAll("rect")
                    .data(wordCounter);

    houseBars.enter()
        .append("rect")
        .attr("x", houseBarOffsetX)
        .attr("y", function(d, i) { return houseBarScaleY(i) -5 ;})
        .style("fill", houseBarColor)
        .attr("height", houseBarHeight)
        .attr("width", function(d) { return houseBarScaleX(d.freq);} );

    houseBars.attr("width", function(d) { return houseBarScaleX(d.freq);} );

    // add text for frequencies!
    var houseBarText = houseBarArea.selectAll("text.wordFreq")
                        .data(wordCounter);
    houseBarText.enter()
        .append("text")
        .attr("class", "wordFreq")
        .attr("x", function(d) {return houseBarOffsetX + 5 + houseBarScaleX(d.freq); })
        .attr("y", function(d, i) { return houseBarScaleY(i) + 6;})
        .text(function(d) { return d.freq + ""; })
        .style("fill", "#000000");
        // .style("font-size", "12px");

    houseBarText
    .attr("x", function(d) {return houseBarOffsetX + 5 + houseBarScaleX(d.freq); })
    .text(function(d) {
        return d.freq + "";
    });

    houseBar_xis.exit().remove();
    houseBars.exit().remove();
    houseBarText.exit().remove();

    // replace house name, episode number
    // console.log(house);
    // var capHouse = house.charAt(0).toUpperCase() + house.slice(1);
    d3.select('span#house-name').text(house);
    var seasonNumber = parseInt((time - 1) / 10) + 1;
    var episodeNumber = (time - 1) % 10 + 1;
    var seasonEpisode = "S" + seasonNumber + "E" + episodeNumber;
    d3.select('span#house-episode').text(seasonEpisode);
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
                        .call(wordBarAxis)
                        .style("stroke-width", "0");


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
    
    // first build axis
    var wordBarAxis = d3.axisLeft()
                        .scale(wordlistBarScaleY)
                        .tickSize(5)
                        .tickFormat(function(d, i) { return wordCounter[i].word; })
                        .tickValues(d3.range(wordCounter.length));
    
    var wordBar_xis = wordBarArea.selectAll("g.axis")
                        .call(wordBarAxis)
                        .style("stroke-width", "0");

    var wordBars = wordBarArea.selectAll("rect")
                    .data(wordCounter);

    wordBars.enter()
        .append("rect")
        .attr("x", wordBarOffsetX)
        .attr("y", function(d, i) { return wordlistBarScaleY(i) - wordBarOffsetY / 2;})
        .style("fill", wordlistBarColor)
        .attr("height", wordlistBarHeight)
        .attr("width", function(d) { return wordlistBarScaleX(d.freq);} );

    wordBars
    .transition()
    .duration(400)
    .attr("width", function(d) { 
        return wordlistBarScaleX(d.freq);} );

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
    .transition()
    .duration(400)
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

