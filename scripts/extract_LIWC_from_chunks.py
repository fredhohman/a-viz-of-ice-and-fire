"""
Extract LIWC counts from chunked dialogue files.
"""
from clean_extracted_text import clean_text
from get_LIWC_counts import get_LIWC_counts
from nltk.tokenize import WordPunctTokenizer
import os, re
import pandas as pd
import argparse

N_CHUNKS=60
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--all_episodes', default=None)
    args = parser.parse_args()
    all_episodes = args.all_episodes
    if(all_episodes is None):
        subtitle_dir = '../data/subtitles/subtitlesInTSV/'
        all_episodes = [f for f in os.listdir(subtitle_dir) 
                        if re.findall('S[0-9]E[0-9]+.tsv', f)]
    else:
        all_episodes = all_episodes.split(',')
        subtitle_dir = os.path.dirname(all_episodes[0])
        all_episodes = list(map(os.path.basename, all_episodes))
    sorted_episodes = sorted(all_episodes)
    episode_data = {e : pd.read_csv(os.path.join(subtitle_dir, e), sep='\t') 
                    for e in sorted_episodes}
    LIWC_categories = ['positive_affect', 'negative_affect', 'anger', 'death', 
                       'family', 'home', 'humans', 'religion', 'swear', 'sexual']
    LIWC_category_wordlists = {c : [re.compile('^' + l.strip()  + '$')
                                    for l in open('/hg191/corpora/LIWC/resources/liwc_lexicons/%s'%(c), 'r')] 
                               for c in LIWC_categories}
    TKNZR = WordPunctTokenizer()
    full_chunk_list = set(range(N_CHUNKS))
    # we count either the total number of tokens
    # or the number of unique tokens
    count_option = 'total'
    # count_option = 'unique'
    for e in sorted_episodes:
        print('processing episode %s'%(e))
        e_data = episode_data[e]
        e_name = e.split('.tsv')[0]
        e_data.sort_values('chunk', ascending=True)
        # TODO: insert dummy values for empty chunks
        empty_chunks = full_chunk_list - set(e_data['chunk'].unique())
        if(len(empty_chunks) > 0):
            print('filling %s with empty chunks %s'%
                  (e_name, empty_chunks))
            empty_chunk_rows = pd.DataFrame(
                [{'chunk' : c, 'dialogue' : ''} 
                 for c in empty_chunks]
                )
            e_data = pd.concat([e_data, empty_chunk_rows], 
                               axis=0)
        chunk_iter = e_data.groupby('chunk')
        chunk_text = [clean_text(' '.join(map(str, c[1]['dialogue'].tolist()))) 
                      for c in chunk_iter]
        chunk_LIWC_counts = {c : [] for c in LIWC_categories}
        for t in chunk_text:
            tokens = TKNZR.tokenize(t)
            for c in LIWC_categories:
                counts = get_LIWC_counts(tokens, LIWC_words=LIWC_category_wordlists[c])
                if(count_option == 'total'):
                    total_counts = sum(counts.values())
                elif(count_option == 'unique'):
                    total_counts = len(counts)
                # TODO: store individual words as well as aggregate counts
                chunk_LIWC_counts[c].append(total_counts)
        chunk_LIWC_counts = pd.DataFrame(chunk_LIWC_counts)
        chunk_LIWC_counts['chunk'] = chunk_LIWC_counts.index
        chunk_fname = os.path.join(subtitle_dir, '%s_LIWC_chunk_counts.tsv'%(e_name))
        chunk_LIWC_counts.to_csv(chunk_fname, sep='\t', index=None)
        
