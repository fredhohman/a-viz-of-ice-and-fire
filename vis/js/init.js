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
            d["episode"] = parseInt(d["episode"]);
            d["season"] = parseInt(d["season"]);

            for (var i = 0; i < categories.length; i++){
				d[categories[i]] = string2Dict (d[categories[i]]);
			}
        });

        initBubblePlot (textTokenData);
        updateBubblePlot (sliceData (textTokenData, seasonNumber, episodeNumber));

    })

	d3.tsv(textDTMFile, function(error, data) {
		textDTM = data;
	});
}

init();