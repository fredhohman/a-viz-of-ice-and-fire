console.log("Javascript loading!");

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
    d3.json("../data/color/series.json", function(error, data){
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
});

// Color in season blocks
$(document).ready(function() {
    $("#series").click(function(event) {
        var series_clicked = event.target.id[1];
        series_clicked = parseInt(series_clicked);
        var episode_start = 0;
        var episode_end = 0;

        episode_start = (series_clicked - 1)*10;
        episode_end = episode_start + 10;

        color_blocks(episode_start, episode_end);

    });
});

console.log("Javascript loaded!");
