
# coding: utf-8

# In[5]:

import clean_extracted_text, get_LIWC_counts
reload (clean_extracted_text)
reload (get_LIWC_counts)
from get_LIWC_counts import get_LIWC_counts
from clean_extracted_text import clean_text
import os, glob
from nltk.tokenize import WordPunctTokenizer
from collections import Counter
import json


# In[2]:

dataDir = "../data/subtitles/subtitlesInTSV/"
LIWC_dir = "/hg191/corpora/LIWC/resources/liwc_lexicons/"
files = sorted (glob.glob (os.path.join (dataDir, "*.tsv")))
categories = os.listdir (LIWC_dir)
tokenizer = WordPunctTokenizer()
LIWC_words = {category: ["^" + l.strip() + "$" for l in open(os.path.join(LIWC_dir, category), 'r')] for category in categories} 
#print LIWC_words["positive_affect"]

jsonList = []
              
for filename in files:
    print filename
    with open (filename) as fin:
        categoryCounts = {category:Counter() for category in categories}  
        for line in fin:
            if "frameNo" in line:
                continue
            dialogue = line.strip().split("\t")[-1]
            dialogue = dialogue.replace ("$", " ")
            tokens = tokenizer.tokenize(clean_text (dialogue.strip()))
            #print tokens
            for category in categories:
                #print category
                #print LIWC_words[category]
                counts = get_LIWC_counts(tokens, LIWC_words=LIWC_words[category])
                if len (counts) > 0:
                    #print counts
                    categoryCounts[category].update (counts)
    temp_dict = {"name": os.path.basename (filename)}
    temp_dict.update (categoryCounts)
    jsonList.append (temp_dict)


# In[3]:

with open ("../data/text_category_stats/episodeLevel.json", "w") as fout:
    json.dump (jsonList, fout)

