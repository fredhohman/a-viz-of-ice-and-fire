"""
Extract LIWC counts from dialogue chunks.
"""
from clean_extracted_text import clean_text
from get_LIWC_counts import get_LIWC_counts
from nltk.tokenize import WordPunctTokenizer
import os, re
import pandas as pd

if __name__ == '__main__':
    subtitle_dir = '../data/subtitles/subtitlesInTSV/'
    all_episodes = [f for f in os.listdir(subtitle_dir) 
                    if re.findall('S[0-9]E[0-9]+', f)]
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
        e_data.sort('chunk', ascending=True)
        chunk_iter = e_data.groupby('chunk')
        chunk_text = [clean_text(' '.join(c[1]['dialogue'].tolist())) for c in chunk_iter]
        chunk_LIWC_counts = {c : [] for c in LIWC_categories}
        for t in chunk_text:
            tokens = TKNZR.tokenize(t)
            for c in LIWC_categories:
                counts = get_LIWC_counts(tokens, LIWC_words=LIWC_category_wordlists[c])
                chunk_LIWC_counts[c].append(counts)
        chunk_LIWC_counts = pd.DataFrame(chunk_LIWC_counts)
        chunk_fname = os.path.join(subtitle_dir, '%s_LIWC_chunk_counts.tsv')
        chunk_LIWC_counts.to_csv(chunk_fname, sep='\t')
        
