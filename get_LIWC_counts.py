"""
Get LIWC counts over a block of text
for a specified category.
"""
import os, re
from collections import Counter

def get_LIWC_counts(tokenized_text, category,
                    LIWC_dir='/hg191/corpora/LIWC/resources/liwc_lexicons/'):
    """
    Convert tokenized text to counts of
    words within the specified category.

    parameters:
    -----------
    tokenized_text = [str]
    category = str
    """
    LIWC_counts = {}
    # load dict
    LIWC_words = [l.strip() for l in open(os.path.join(LIWC_dir, category), 'r')]
    print('got LIWC words %s'%(','.join(LIWC_words)))
    LIWC_matcher = re.compile('|'.join(LIWC_words))
    all_matches = list(filter(lambda x: LIWC_matcher.search(x),
                              tokenized_text))
    LIWC_counts = dict(Counter(all_matches))
    return LIWC_counts

if __name__ == '__main__':
    # TODO: test
    test_text = 'this is me being happy and pleasant'
    tokenized_text = test_text.split(' ')
    category = 'positive_affect'
    LIWC_counts = get_LIWC_counts(tokenized_text, category)
    assert LIWC_counts['happy'] == 1 and LIWC_counts['pleasant'] == 1
