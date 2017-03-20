"""
Extract LIWC counts from sliced dialogue file.
"""
from clean_extracted_text import clean_text
from get_LIWC_counts import get_LIWC_counts
from nltk.tokenize import WordPunctTokenizer
import os, re
import pandas as pd
import argparse
from stopwords import get_stopwords

N_SLICES=60
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--sub_file', default='../data/subtitles/subtitlesInTSV/finding_nemo_clean.tsv')
    parser.add_argument('--LIWC_dir', default='/hg191/corpora/LIWC/resources/liwc_lexicons/')
    args = parser.parse_args()
    sub_file = args.sub_file
    LIWC_dir = args.LIWC_dir
    LIWC_categories = ['positive_affect', 'negative_affect', 'anger', 'death', 
                       'family', 'home', 'humans', 'social',
                       'percept', 'insight']
    stopwords = get_stopwords('en')
    LIWC_category_wordlists = {c : [re.compile('^' + l.strip()  + '$')
                                    for l in open(os.path.join(LIWC_dir, '%s'%(c)), 'r')
                                    if l.strip() not in stopwords] 
                               for c in LIWC_categories}
    # replace positive/negative affect
    LIWC_categories += ['positive', 'negative']
    LIWC_categories.remove('positive_affect')
    LIWC_categories.remove('negative_affect')
    LIWC_category_wordlists['positive'] = LIWC_category_wordlists.pop('positive_affect')
    LIWC_category_wordlists['negative'] = LIWC_category_wordlists.pop('negative_affect')
    
    TKNZR = WordPunctTokenizer()
    full_slice_list = set(range(N_SLICES))
    # we count either the total number of tokens
    # or the number of unique tokens
    # count_option = 'total'
    count_option = 'unique'
    data = pd.read_csv(sub_file, sep='\t', index_col=False)
    data.sort_values('slice', ascending=True)
    fname = os.path.basename(sub_file).replace('.tsv', '')
    out_dir = os.path.dirname(sub_file)
    empty_slices = full_slice_list - set(data['slice'].unique())
    if(len(empty_slices) > 0):
        print('filling %s with empty slices %s'%
              (e_name, empty_slices))
        empty_slice_rows = pd.DataFrame(
            [{'slice' : c, 'dialogue' : ''} 
             for c in empty_slices]
        )
        data = pd.concat([data, empty_slice_rows], 
                         axis=0)
    slice_iter = data.groupby('slice')
    slice_text = [clean_text(' '.join(map(str, c[1]['dialogue'].tolist()))) 
                  for c in slice_iter]
    slice_LIWC_counts = {c : [] for c in LIWC_categories}
    # also store words cuz yolo
    slice_LIWC_words = {c : [] for c in LIWC_categories}
    slice_LIWC_count_dicts = {c : [] for c in LIWC_categories}
    for t in slice_text:
        tokens = TKNZR.tokenize(t)
        for c in LIWC_categories:
            counts = get_LIWC_counts(tokens, LIWC_words=LIWC_category_wordlists[c])
            if(count_option == 'total'):
                total_counts = sum(counts.values())
            elif(count_option == 'unique'):
                total_counts = len(counts)
            # TODO: store individual words as well as aggregate counts
            slice_LIWC_counts[c].append(total_counts)
            slice_words = sorted(counts.keys())
            slice_LIWC_words[c].append(' '.join(slice_words))
            slice_LIWC_count_dicts[c].append(counts)
    slice_LIWC_counts = pd.DataFrame(slice_LIWC_counts)
    slice_LIWC_counts['time'] = slice_LIWC_counts.index
    counts_fname = os.path.join(out_dir, '%s_LIWC_slice_counts.tsv'%(fname))
    slice_LIWC_counts.to_csv(counts_fname, sep='\t', index=None)
    slice_LIWC_words = pd.DataFrame(slice_LIWC_words)
    slice_LIWC_words['time'] = slice_LIWC_words.index
    word_fname = os.path.join(out_dir, '%s_LIWC_slice_words.tsv'%(fname))
    slice_LIWC_words.to_csv(word_fname, sep='\t', index=None)
    slice_LIWC_count_dicts = pd.DataFrame(slice_LIWC_count_dicts)
    slice_LIWC_count_dicts['time'] = slice_LIWC_count_dicts.index
    counts_fname = os.path.join(out_dir, '%s_LIWC_slice_token_counts.tsv'%(fname))
    # convert dictionaries to string values
    def dict_to_str(d):
        if(len(d) == 0):
            return ''
        else:
            return ','.join(['%s:%d'%(k,v) for k,v in d.iteritems()])
    slice_LIWC_count_dicts[LIWC_categories] = slice_LIWC_count_dicts[LIWC_categories].applymap(dict_to_str)
    slice_LIWC_count_dicts.to_csv(counts_fname, sep='\t', index=None)
