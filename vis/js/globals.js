// All the global variables, their declarations and purpose.

/* Name of the files containing data */
var textDataFile = "data/LIWC_chunk_counts_all_seasons.tsv",
textMetaDataFile = "data/top_5_category_words_per_episode.tsv",
textDTMFile = "data/all_episode_dtm.tsv",
textTokenDataFile = "data/LIWC_chunk_token_counts_all_episodes.tsv";

/* The variables in which data for the above files should be 
loaded respectively */
var textData, textMetadata, textDTM, textTokenData;

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
var categories = ["anger", "death", "family", "home", "humans", "negative", "positive", "religion", "sexual", "swear"];

var tooltip;
