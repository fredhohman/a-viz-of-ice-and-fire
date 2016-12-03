/* converts a string separated by delimiters into a dict */
function string2Dict (string, itemDelim=",", keyValDelim=":"){
	if (string.trim().length == 0)
		return [];
	var items = string.split(itemDelim);
	var counter = items.map (function (entry){
		entry = entry.trim();
		return {
			word: entry.split(keyValDelim)[0],
			freq: parseInt(entry.split(keyValDelim)[1])					
		}
	});
	return counter;
}

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

function data2DotPlotRepresentation (data, categories){
	var newRepresentation = [];
	for (var i = 0; i < data.length; i++) {
		for (var j=0; j < categories.length; j++){
			newRepresentation.push (
			{
				"cat": categories[j],
				"time": data[i]["time"],
				"count": data[i][categories[j]].length,
				"words": data[i][categories[j]].map(function (z){
					return z.word;
				}).join (",")
			});
		}
	}

	return newRepresentation;
}