"""
Extract document-term matrix from pre-chunked dialogue
blocks.
"""
from clean_extracted_text import clean_text
from get_LIWC_counts import get_LIWC_counts
from nltk.tokenize import WordPunctTokenizer
import os, re
import pandas as pd
import argparse

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
    LIWC_categories = ['positive_affect', 'negative_affect', 'anger', 'death', 'family', 'home', 'humans', 'religion', 'swear', 'sexual']
    LIWC_category_wordlists = {c : [l.strip() 
                                    for l in open('/hg191/corpora/LIWC/resources/liwc_lexicons/%s'%(c), 'r')] 
                               for c in LIWC_categories}
    TKNZR = WordPunctTokenizer()
    for e in sorted_episodes:
        print('processing episode %s'%(e))
        e_data = episode_data[e]
        e_name = e.split('.tsv')[0]
        e_data.sort_values('chunk', ascending=True)
        chunk_iter = e_data.groupby('chunk')
        chunk_text = [clean_text(' '.join(map(str, c[1]['dialogue'].tolist()))) 
                      for c in chunk_iter]
        chunk_LIWC_counts = {c : [] for c in LIWC_categories}
        for t in chunk_text:
            tokens = TKNZR.tokenize(t)
            for c in LIWC_categories:
                counts = get_LIWC_counts(tokens, LIWC_words=LIWC_category_wordlists[c])
                total_counts = sum(counts.values())
                # TODO: store individual words as well as aggregate counts
                chunk_LIWC_counts[c].append(counts)
        chunk_LIWC_counts = pd.DataFrame(chunk_LIWC_counts)
        chunk_LIWC_counts['chunk'] = chunk_LIWC_counts.index
        chunk_fname = os.path.join(subtitle_dir, '%s_LIWC_chunk_counts.tsv'%(e_name))
        chunk_LIWC_counts.to_csv(chunk_fname, sep='\t', index=None)
        
