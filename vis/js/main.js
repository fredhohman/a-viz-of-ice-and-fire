console.log("Javascript loading!");

// These have to be global variables that preserve the state
// (basically which season and episode the user is currently trying to see)

var seasonNumber;
var episodeNumber;
var textData;

// this needs to change variable names
function make_episode_color_list() {
    var episode_list = [];

    for (var season_num = 1; season_num < 11; season_num++) {
        for (var episode_num = 1; episode_num < 11; episode_num++) {
            var episode = 'e' + String(season_num) + '-' + 'c' + String(episode_num)
            episode_list.push(episode);
        }
    }
    return episode_list;
}

function color_blocks(episode_start, episode_end) {
    d3.json("../data/series.json", function(error, data){
        console.log("Loaded series.json.");
        palettes = data['palettes'];
        // console.log(palettes);
        var episode_list = make_episode_color_list();
        // console.log(episode_list);

        for (var episode = episode_start; episode < episode_end; episode++) {
            for (var color = 0; color < 10; color++) {

                // console.log(episode); 
                // console.log(color);
                // console.log(palettes[episode]);
                // console.log(palettes[episode][color]);

                // console.log(episode_list[color]);
                d3.select("#" + episode_list[episode%10*10+color])
                  .transition()
                  .duration(250)
                  .style("background-color", "rgb(" + String(palettes[episode][color][0]) + "," 
                                                    + String(palettes[episode][color][1]) + "," 
                                                    + String(palettes[episode][color][2]) + ")");
            }
        }
    })
}

// Initialize blocks with season 1
$(document).ready(function() {
    color_blocks(0,10)

    var color = d3.scaleOrdinal().range(["#020202", "#3c3c3c", "#4b4a4a", "#5e5d5d", "#727171", "#7e7e7e", "#8d8d8d", "#a19f9f", "#b6b5b5", "#C7C6C6"]);//["#48A36D",  "#56AE7C",  "#64B98C", "#72C39B", "#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6", "#7EC4CF", "#7FBBCF", "#7FB1CF", "#80A8CE", "#809ECE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", "#CE80B0", "#D3779F", "#D76D8F", "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", "#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DFB95C", "#DDC05E", "#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  
    d3.tsv("../data/LIWC_chunk_counts_all_seasons.tsv", function(error, data) { 
	// MODIFIED: removing both date and time from color domain
	color.domain(d3.keys(data[0]).filter(function(key) { // Set the domain of the color ordinal scale to be all the csv headers except "date", matching a color to an issu
	    return key !== "time"; // key !== "date" &
	}));
	textData = data;
    });
});

// Color in season blocks
$(document).ready(function() {
    $("#series").click(function(event) {
        var series_clicked = event.target.id[1];
        series_clicked = parseInt(series_clicked);
	seasonNumber = series_clicked;
        var episode_start = 0;
        var episode_end = 0;

        episode_start = (series_clicked - 1)*10;
        episode_end = episode_start + 10;

        color_blocks(episode_start, episode_end);

    });
});

function sliceData (seasonNumber, episodeNumber, textData){
    return textData;
}

$(".episode-block").click(function (event) {
   episodeNumber = event.target.id[1];
   console.log (seasonNumber);
   console.log (episodeNumber);

   // slice the data and call the update method from here
   var slicedData = sliceData (seasonNumber, episodeNumber, textData);
   updateTimePlot (slicedData);
});

console.log("Javascript loaded!");
