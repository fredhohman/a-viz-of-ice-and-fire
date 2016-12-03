"""
Get LIWC counts over a block of text
for a specified category.
"""
import os, re
from collections import Counter

def get_LIWC_counts(tokenized_text, 
                    category='positive_affect',
                    LIWC_dir='/hg191/corpora/LIWC/resources/liwc_lexicons/',
                    LIWC_words=[]):
    """
    Convert tokenized text to counts of
    words within the specified category.

    parameters:
    -----------
    tokenized_text = [str]
    category = str
    LIWC_dir = str
    LIWC_words = [str]
    (Either provide a category and LIWC directory, or a list of preloaded LIWC words)

    returns:
    -------
    LIWC_counts = {str : int}
    """
    # if no LIWC words provided, load from file
    
    if(len(LIWC_words) == 0):
        LIWC_words = [re.compile("^" + l.strip() + "$") for l in open(os.path.join(LIWC_dir, category), 'r')]    
    #print "good" in LIWC_words
    #LIWC_words = map (lambda x:re.compile (x), LIWC_words)
    LIWC_matches = []
    tokenized_text = map (lambda x: x.lower(), tokenized_text)
    for token in tokenized_text:
        for pattern in LIWC_words:
            match = pattern.match(token)
            if(match is not None):
                LIWC_matches.append(token)
                break
            # matches = pattern.findall(token)
            # if len (matches) > 0:
            #     if "*" in pattern and not token.startswith(pattern[1:-2]):
            #         continue
            #     LIWC_matches.append(token)
            #     break

    LIWC_counts = dict(Counter(LIWC_matches))
    return LIWC_counts

if __name__ == '__main__':
    # TODO: test
    #test_text = 'this is me being happy and pleasant'
    #tokenized_text = test_text.split(' ')
    #tokenized_text = ['What', 'do', 'you', 'expect', '?</', 'i', '>', 'he',
    #                  "'", 're', 'savages', '.</', 'i', '>']
    tokenized_text = ['It', "'", 's', 'a', 'good', 'he', 'we', "'", 're',
                      'not', 'children', '.']
    category = 'positive_affect'
    LIWC_counts = get_LIWC_counts(tokenized_text, category)
    print LIWC_counts
    #assert LIWC_counts['happy'] == 1 and LIWC_counts['pleasant'] == 1
