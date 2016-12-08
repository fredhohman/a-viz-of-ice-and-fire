"""
Extract counts of House member mentions
from raw text.
"""
from clean_extracted_text import clean_text
from get_LIWC_counts import get_category_counts
from nltk.tokenize import WordPunctTokenizer
import os, re
import pandas as pd
import argparse
from collections import Counter

N_CHUNKS=60
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--all_episodes', default=None)
    parser.add_argument('--house_dir', default='../data/extra_lexicons')
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
    house_dir = args.house_dir
    houses = list(map(str.capitalize, sorted(os.listdir(house_dir))))
    house_wordlists = {h : [re.compile(l.strip())
                            for l in open(os.path.join(house_dir, h), 'r')] 
                       for h in houses}
#     print('got house wordlists %s'%
#           (str([p.pattern for patterns in house_wordlists.values() for p in patterns])))
    TKNZR = WordPunctTokenizer()
    full_chunk_list = set(range(N_CHUNKS))
    # we count either the total number of tokens
    # or the number of unique tokens
    count_option = 'total'
    # count_option = 'unique'
    all_counts = []
    all_token_counts = []
    for e in sorted_episodes:
        print('processing episode %s'%(e))
        e_data = episode_data[e]
        e_name = e.split('.tsv')[0]
        season = int(re.findall('(?<=S)[0-9]', e_name)[0])
        episode = int(re.findall('(?<=E)[0-9]+', e_name)[0])
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
        #house_counts = {h : [] for h in houses}
        house_token_counts = {h : Counter()
                              for h in houses}
        house_counts = {h : 0 for h in houses}
        for t in chunk_text:
            # tokens = TKNZR.tokenize(t)
            for h in houses:
                counts = get_category_counts(t, house_wordlists[h])
                # upper-case the names!
                counts = {n.capitalize() : c for n, c in counts.items()}
                house_token_counts[h].update(counts)
                if(count_option == 'total'):
                    total_counts = sum(counts.values())
                elif(count_option == 'unique'):
                    total_counts = len(counts)
                # TODO: store individual words as well as aggregate counts
                # house_counts[h].append(total_counts)
                house_counts[h] += total_counts
        house_token_counts = pd.DataFrame(
            {
                h : [','.join(['%s:%d'%(k,v) for k,v in token_counter.items()])]
                for h, token_counter in house_token_counts.items()
                }
            )
        house_token_counts['episode'] = episode
        house_token_counts['season'] = season
        house_token_counts['time'] = (season - 1) * 10 + episode
        all_token_counts.append(house_token_counts)
        house_counts = pd.DataFrame({h : [c] for h,c, in house_counts.items()})
        # house_counts['time'] = house_counts.index
        house_counts['episode'] = episode
        house_counts['season'] = season
        house_counts['time'] = (season - 1) * 10 + episode
        all_counts.append(house_counts)
    all_token_counts = pd.concat(all_token_counts)
    token_fname = os.path.join(subtitle_dir, 'house_token_counts_all_seasons.tsv')
    all_token_counts.to_csv(token_fname, sep='\t', index=None)
    all_counts = pd.concat(all_counts, axis=0)
    count_fname = os.path.join(subtitle_dir, 'house_counts_all_seasons.tsv')
    all_counts.to_csv(count_fname, sep='\t', index=None)
        
