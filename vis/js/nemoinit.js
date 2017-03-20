function init (){
	d3.tsv(textDataFile, function(error, data) { 
    	textData = data;
    	keys = Object.keys(textData[0]);
    	textData.forEach(function (d){
    		for (var i = 0; i < keys.length; i++){
    			d[keys[i]] = parseInt (d[keys[i]]);
    		}
    	});
    	//initBubblePlot ()
    	//initScatterPlot(textData);
    	//updateScatterPlot(sliceData (textData, seasonNumber, episodeNumber));
	});

	d3.tsv(textMetaDataFile, function(error, data){
		textMetaData = data;
		textMetaData.forEach (function (d){
			d["season"] = parseInt (d["season"]);
			d["episode"] = parseInt (d["episode"]);
			for (var i = 0; i < categories.length; i++){
				d[categories[i]] = string2Dict (d[categories[i]]);
			}
		});
		//initBarPlot (textMetaData);
		//updateBarPlot (textMetaData, seasonNumber, episodeNumber);
	});

    d3.tsv(textTokenDataFile, function(error, data) {
        textTokenData = data;
        textTokenData.forEach(function(d) {
            d["time"] = parseInt(d["time"]);
            // d["episode"] = parseInt(d["episode"]);
            // d["season"] = parseInt(d["season"]);
            d["episode"] = 1;
            d["season"] = 1;

            for (var i = 0; i < categories.length; i++){
				d[categories[i]] = string2Dict (d[categories[i]]);
			}
        });

        initBubblePlot (textTokenData);
        updateBubblePlot (sliceData (textTokenData, seasonNumber, episodeNumber));

    });

	d3.tsv(textDTMFile, function(error, data) {
		textDTM = data;
        // convert to counts
        textDTM.forEach(function(d) { 
            var allKeys = d3.keys(d); 
            for(var i = 0; i < allKeys.length; i++) { 
                d[allKeys[i]] = parseInt(d[allKeys[i]]); 
            }
            // console.log(d);
            return d;
        });
        initBarPlot(textDTM);
        updateBarPlot(textDTM, seasonNumber, episodeNumber);
	});


	d3.tsv (textDialogueFile, function (error, data){
		textDialogueData = data;
        textDialogueData.forEach(function(d)
        {
            d['season'] = 1;
            d['episode'] = 1;
        });
	});

    // now house plot

    d3.tsv(houseDataFile, function(error, data) {
        houseData = data;
        houseData.forEach(function(d) { 
            var allKeys = d3.keys(d); 
            for(var i = 0; i < allKeys.length; i++) { 
                d[allKeys[i]] = parseInt(d[allKeys[i]]); 
            }
            return d;
        });
        initHousePlots(houseData);
    })

    d3.tsv(houseTokenDataFile, function(error, data) {
        houseTokenData = data;
        houseTokenData.forEach(function(d) {
            d["time"] = parseInt(d["time"]);
            for (var i = 0; i < houses.length; i++){
                d[houses[i]] = string2Dict (d[houses[i]]);
            }
            return d;
        });
        // updateHouseBarPlot(houseTokenData, defaultHouse, 1)
    })
}

init();