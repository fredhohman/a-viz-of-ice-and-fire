// All the global variables, their declarations and purpose.

/* Name of the files containing data */
var textDataFile = "data/finding_nemo_clean_LIWC_slice_counts.tsv",
textMetaDataFile = "data/top_5_category_words_per_episode.tsv",
textDTMFile = "data/finding_nemo_clean_dtm.tsv",
textTokenDataFile = "data/LIWC_chunk_token_counts_all_episodes.tsv",
houseDataFile = "data/house_counts_all_seasons.tsv",
houseTokenDataFile = "data/house_token_counts_all_seasons.tsv";

/* The variables in which data for the above files should be 
loaded respectively */
var textData, textMetadata, textDTM, textTokenData, houseData, houseTokenData;

/* Definition of a trim function for strings -- removes whitespace */
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/* Define all the categories */
var categories = ["social", "positive", "percept", "negative", "insight", "humans", "home", "family", "death", "anger"];

/*Define all the houses*/
//var houses = ["baratheon", "greyjoy", "lannister", "martell", "stark", "targaryen", "tyrell"];
var houses = ["Tyrell", "Targaryen", "Stark", "Martell", "Lannister", "Greyjoy", "Baratheon"]

var tooltip;
