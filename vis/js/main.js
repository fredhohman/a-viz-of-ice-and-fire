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

// testing
// d3.select("#s1-c1").style("background-color", "red");
// d3.select("#e3-c9").style("background-color", "rgb(0,0,0)");



d3.json("../data/color/series.json", function(error, data){
    console.log("Loaded series.json.");
    palettes = data['palettes'];
    console.log(palettes);
    var episode_list = make_episode_color_list();
    console.log(episode_list);

    for (var episode = 10; episode < 20; episode++) {
        for (var color = 0; color < 10; color++) {

            // console.log(episode); 
            // console.log(color);
            // console.log(palettes[episode]);
            // console.log(palettes[episode][color]);
            console.log(episode_list[color]);
            d3.select("#" + episode_list[episode%10*10+color]).style("background-color", "rgb(" + String(palettes[episode][color][0]) + "," + String(palettes[episode][color][1]) + "," + String(palettes[episode][color][2]) + ")");
        }
    }
})

console.log("Javascript loaded!");
