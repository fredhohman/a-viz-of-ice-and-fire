

///////////////////////////////////////////////////////////////////////////
// These have to be global variables that preserve the state
// (basically which season and episode the user is currently trying to see)
///////////////////////////////////////////////////////////////////////////

var seasonNumber = 1;
seasonNumberOld = 1;

var eNum = 1;
eNumOld = 1;

var textData;
var numOfChunks = 60;
chunk_clicked_old = 0;
is_something_zoomed = false;

d3.csv("data/episode_metadata.csv", function(error, data) {
    episode_metadata = data;
});

d3.csv("data/season_metadata.csv", function(error, data) {
    season_metadata = data;
});

///////////////////////////////////////////////////////////////////////////
// helper functions that make lists of strings so we can iterate through to update color divs
///////////////////////////////////////////////////////////////////////////

// variable names inside are wrong, just pay attention to function name
function make_season_color_list() {
    var episode_list = [];

    for (var season_num = 1; season_num < 7; season_num++) {
        for (var episode_num = 1; episode_num < 11; episode_num++) {
            var episode = 's' + String(season_num) + '-' + 'c' + String(episode_num);
            episode_list.push(episode);
        }
    }
    return episode_list;
}

// variable names inside are wrong, just pay attention to function name
function make_episode_color_list() {
    var episode_list = [];

    for (var season_num = 1; season_num < 11; season_num++) {
        for (var episode_num = 1; episode_num < 11; episode_num++) {
            var episode = 'e' + String(season_num) + '-' + 'c' + String(episode_num);
            episode_list.push(episode);
        }
    }
    return episode_list;
}

// variable names inside are wrong, just pay attention to function name
function make_chunk_color_list() {
    var episode_list = [];

    for (var season_num = 1; season_num < 61; season_num++) {
        for (var episode_num = 1; episode_num < 11; episode_num++) {
            var episode = 'c' + String(season_num) + '-' + 'c' + String(episode_num);
            episode_list.push(episode);
        }
    }
    return episode_list;
}


// variable names inside are wrong, just pay attention to function name
function make_episode_titles() {
    var episode_list = [];

    for (var season_num = 1; season_num < 7; season_num++) {
        for (var episode_num = 1; episode_num < 11; episode_num++) {
            var episode = 'S' + String(season_num) + 'E' + String(episode_num);
            episode_list.push(episode);
        }
    }
    return episode_list;
}

// variable names inside are wrong, just pay attention to function name
function make_episode_titles_lowercase() {
    var episode_list = [];

    for (var season_num = 1; season_num < 7; season_num++) {
        for (var episode_num = 1; episode_num < 11; episode_num++) {
            var episode = 's' + String(season_num) + 'e' + String(episode_num);
            episode_list.push(episode);
        }
    }
    return episode_list;
}

// global lists definitions
var season_strings = ['Season 1', 'Season 2', 'Season 3', 'Season 4', 'Season 5', 'Season 6'];
var episode_strings = make_episode_titles();
var episode_strings_lowercase = make_episode_titles_lowercase();

///////////////////////////////////////////////////////////////////////////
// update color functions
///////////////////////////////////////////////////////////////////////////

function color_blocks(episode_start, episode_end) {
    d3.json("data/color/series_sorted.json", function(error, data){
        var palettes = data['palettes'];
        var episode_list = make_episode_color_list();

        for (var episode = episode_start; episode < episode_end; episode++) {
            for (var color = 0; color < 10; color++) {

                d3.select("#" + episode_list[episode%10*10+color])
                  .transition()
                  .duration(250)
                  .style("background-color", "rgb(" + String(palettes[episode][color][0]) + "," 
                                                    + String(palettes[episode][color][1]) + "," 
                                                    + String(palettes[episode][color][2]) + ")");
            }
        }
    });
}

function color_chunk_blocks(episode_chunk_path) {
    d3.json("data/color/" + episode_chunk_path + "_chunk_sorted.json", function(error, data){
        var palettes = data['palettes'];
        var chunk_list = make_chunk_color_list();

        for (var chunk = 0; chunk < numOfChunks; chunk++) {
            for (var color = 0; color < 10; color++) {

                d3.select("#" + chunk_list[chunk*10+color])
                  .transition()
                  .duration(250)
                  .style("background-color", "rgb(" + String(palettes[chunk][color][0]) + "," 
                                                    + String(palettes[chunk][color][1]) + "," 
                                                    + String(palettes[chunk][color][2]) + ")");
            }
        }
    });
}

///////////////////////////////////////////////////////////////////////////
// Initialize blocks with season 1 episode 1
///////////////////////////////////////////////////////////////////////////

// initialize colors
$(document).ready(function() {
    d3.json("data/color/seasons_sorted.json", function(error,data){
        var palettes = data['palettes'];
        var season_list = make_season_color_list();

        for (var season = 0; season < 6; season++) {
            for (var color = 0; color < 10; color++) {

                d3.select('#'+season_list[season%6*10+color])
                  .style("background-color", "rgb("+ String(palettes[season][color][0]) + ","
                                                   + String(palettes[season][color][1]) + ","
                                                   + String(palettes[season][color][2]) + ")");
                  // .text(String(palettes[season][color]));
            }
        }

        color_blocks(0,10);
        color_chunk_blocks('s1e1');
        
        // color header selected
        d3.select('#season1' + ' > h3').classed('color-header-selected', true);
        d3.select('#episode1' + ' > h3').classed('color-header-selected', true);
    });


});

///////////////////////////////////////////////////////////////////////////
// Main color updating click function
///////////////////////////////////////////////////////////////////////////

$(document).ready(function() {

    // update colors for episodes
    $("#series").click(function(event) {
        var series_clicked = event.target.id[1];
        series_clicked = parseInt(series_clicked);
	    seasonNumber = series_clicked;

        if (isNaN(seasonNumber) === true) {

        } else {

            // update season in left hand side
            d3.select("#season-title").text(season_strings[seasonNumber-1]);
            d3.select("#first-aired-in").text(season_metadata[seasonNumber-1]["First aired"]);
            d3.select("#last-aired-in").text(season_metadata[seasonNumber-1]["Last aired"]);
            d3.select("#average-viewers").text(season_metadata[seasonNumber-1]["Average viewers (millions)"]);

            var episode_start = 0;
            var episode_end = 0;
            episode_start = (series_clicked - 1)*10;
            episode_end = episode_start + 10;

            color_blocks(episode_start, episode_end);

            // go back to episode 1 on whatever season was clicked
            eNum = 0+10*series_clicked-10;

            d3.selectAll("#episode-title-number").text(episode_strings[eNum]);
            d3.select("#episode-title").text(episode_metadata[eNum]["Title"]);
            d3.select("#directed-by").text(episode_metadata[eNum]["Directed by"]);
            d3.select("#written-by").text(episode_metadata[eNum]["Written by"]);
            d3.select("#air-date").text(episode_metadata[eNum]["Original air date"]);
            d3.select("#runtime").text(episode_metadata[eNum]["Runtime"]);
            d3.select("#viewers").text(episode_metadata[eNum]["U.S. viewers (millions)"]);

            color_chunk_blocks(episode_strings_lowercase[eNum]);
            // and update text
            updateAll(seasonNumber, 1);

            // color header selected
            d3.select('#season' + String(seasonNumberOld) + ' > h3').classed('color-header-selected', false);
            d3.select('#season' + String(seasonNumber) + ' > h3').classed('color-header-selected', true);

            if (eNumOld%10==0) {
                d3.select('#episode' + String(eNumOld%10+10) + ' > h3').classed('color-header-selected', false);
            } else {
                d3.select('#episode' + String(eNumOld%10) + ' > h3').classed('color-header-selected', false);
            }
            d3.select('#episode1' + ' > h3').classed('color-header-selected', true);
            
            seasonNumberOld = seasonNumber;
            eNumOld = 1;
    }

    });

    //  update colors for episode chunks
    $("#episodes").click(function(event) {
        episode_clicked = parseInt(event.target.id[1]);
        if (episode_clicked === 1 && parseInt(event.target.id[2]) === 0) {
            episode_clicked = 10; //hacky but works, correctly sets episode_click to 10 instead of 1
        }

        if (isNaN(episode_clicked) === true) {

        } else {

            eNum = episode_clicked+10*(seasonNumber-1);

            d3.selectAll("#episode-title-number").text(episode_strings[eNum-1]);
            d3.select("#episode-title").text(episode_metadata[eNum-1]["Title"]);
            d3.select("#directed-by").text(episode_metadata[eNum-1]["Directed by"]);
            d3.select("#written-by").text(episode_metadata[eNum-1]["Written by"]);
            d3.select("#air-date").text(episode_metadata[eNum-1]["Original air date"]);
            d3.select("#runtime").text(episode_metadata[eNum-1]["Runtime"]);
            d3.select("#viewers").text(episode_metadata[eNum-1]["U.S. viewers (millions)"]);

            color_chunk_blocks(episode_strings_lowercase[eNum-1]);

            // color header selected
            // console.log(eNum);
            if (eNum%10===0) {
                d3.select('#episode' + String(eNumOld%10) + ' > h3').classed('color-header-selected', false);
                d3.select('#episode' + String(10) + ' > h3').classed('color-header-selected', true);
            } else {
                d3.select('#episode' + String(10) + ' > h3').classed('color-header-selected', false);
                d3.select('#episode' + String(eNumOld%10) + ' > h3').classed('color-header-selected', false);
                d3.select('#episode' + String(eNum%10) + ' > h3').classed('color-header-selected', true);
            }
            eNumOld = eNum;
    }

    });

    // zoom in color chunks
    $("#chunks").click(function(event) {

        chunk_clicked = parseInt(event.target.id[1]);

        if (isNaN(chunk_clicked) === true) {

        } else {

            if (event.target.id[2] != '-') {
                chunk_clicked = parseInt(event.target.id[1])*10+parseInt(event.target.id[2]);
            }
            


            // edge case to click on chunk that was just clicked on
            if (chunk_clicked_old === chunk_clicked && is_something_zoomed === false) {
                // console.log('yay');
                d3.selectAll(".chunk-block").classed("chunk-block-small", true);
                d3.select("#chunk"+String(chunk_clicked)).classed("chunk-block-zoomed", true);
                is_something_zoomed = true;
            }

            else if (chunk_clicked_old == chunk_clicked) {
                d3.selectAll(".chunk-block").classed("chunk-block-small", false);
                d3.select("#chunk"+String(chunk_clicked)).classed("chunk-block-zoomed", false);
                is_something_zoomed = false;
            }
            else {
                d3.selectAll(".chunk-block").classed("chunk-block-small", true);
                d3.select("#chunk"+String(chunk_clicked_old)).classed("chunk-block-zoomed", false);
                d3.select("#chunk"+String(chunk_clicked)).classed("chunk-block-zoomed", true);
                is_something_zoomed = true;
            }
            chunk_clicked_old = chunk_clicked;
        }

        // show screenshot chunk image on cursor
        // if (is_something_zoomed === true) {

        //     $(document).mouseover(function(e){
        //         $("#chunkimage").attr("src","data/chunk-montages/s" + String(seasonNumber) + "e" + String(episodeNumber) + "/chunk"+String(chunk_clicked)+".png");
        //     });
        // } 
        // else {
            // $(document).mousemove(function(e){
                // $("#chunkimage").css({"left":e.pageX + 10, "top":e.pageY + 10});
            // });
            // continue;
        // }

    });

});

$(".episode-block").click(function (event) {
    episodeNumber = parseInt (event.target.id[1]);
    
    // update scatterplot and accompanying bar plot
    if (isNaN(episodeNumber) === true) {

    } else if (event.target.id[2] != '-') {
        episodeNumber = 10;
        updateAll(seasonNumber, episodeNumber);

    } else {
       updateAll(seasonNumber, episodeNumber);
    }
   // console.log (seasonNumber);
   // console.log (episodeNumber);
});


// vertical highlight
$("#chunks").mouseover(function(event) {
    chunk_hovered = parseInt(event.target.id[1]);

    if (event.target.id[2] != '-') {
        chunk_hovered = parseInt(event.target.id[1])*10+parseInt(event.target.id[2]);
    }

    if (!isNaN(chunk_hovered)) {
        $("#chunkimage").attr("src","data/chunk-montages/s" + String(seasonNumber) + "e" + String(episodeNumber) + "/chunk"+String(chunk_hovered)+".png");
            highlightSlice(chunk_hovered-1);
        }
});

//  vertical unhighlight
$("#chunks").mouseout(function(event) {
    chunk_hovered = parseInt(event.target.id[1]);

    if (event.target.id[2] != '-') {
        chunk_hovered = parseInt(event.target.id[1])*10+parseInt(event.target.id[2]);
    }

    unhighlightSlice(chunk_hovered-1);
});