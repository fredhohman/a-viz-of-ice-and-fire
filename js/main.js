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
                  .style("background-color", "rgb(" + String(palettes[episode][color][0]) + "," 
                                                    + String(palettes[episode][color][1]) + "," 
                                                    + String(palettes[episode][color][2]) + ")");
            }
        }
    })
}

// Initialize blocks with season 1
// $(document).ready(function() {
//     color_blocks(0,10)
// });

$(document).ready(function() {
    $("#series").click(function(event) {
        var series_clicked = event.target.id[1];
        var episode_start = 0;
        var episode_end = 0;

        if (series_clicked == "1") {
            episode_start = 0;
            episode_end = episode_start + 10;
        };
        if (series_clicked == "2") {
            episode_start = 10;
            episode_end = episode_start + 10;
        }
        if (series_clicked == "3") {
            episode_start = 20;
            episode_end = episode_start + 10;
        };
        if (series_clicked == "4") {
            episode_start = 30;
            episode_end = episode_start + 10;
        };
        if (series_clicked == "5") {
            episode_start = 40;
            episode_end = episode_start + 10;
        };
        if (series_clicked == "6") {
            episode_start = 50;
            episode_end = episode_start + 10;
        };
        
        color_blocks(episode_start, episode_end);

    });
});

console.log("Javascript loaded!");
