"""
Extract token counts for each episode and
write to one big ugly document term matrix.
"""
import pandas as pd
import json, os, re
from clean_extracted_text import clean_text
from sklearn.feature_extraction.text import CountVectorizer

if __name__ == '__main__':
    subtitle_dir = '../data/subtitles/subtitlesInTSV/'
    all_episodes = [f for f in os.listdir(subtitle_dir) 
                    if re.findall('S[0-9]E[0-9]+', f)]
    sorted_episodes = sorted(all_episodes)
    episode_data = {e : pd.read_csv(os.path.join(subtitle_dir, e), sep='\t') 
                    for e in sorted_episodes}
    all_counts = {}
    min_df = 1
    stop_words = []
    cv = CountVectorizer(min_df=min_df, encoding='utf-8', stop_words=stop_words)
    for e in sorted_episodes:
        print('processing episode %s'%(e))
        e_data = episode_data[e]
        all_dialogue = []
        for d in e_data['dialogue']:
            clean_dialogue = clean_text(str(d)).replace('$', ' ').strip()
            
            if(clean_dialogue != ''):
                try:
                    cv.fit_transform([clean_dialogue])
                    all_dialogue.append(clean_dialogue)
                except Exception, e:
                    print('clean dialogue %s caused error %s'%(clean_dialogue, e))
        counts = cv.fit_transform(all_dialogue)
        # only care about per-episode counts
        count_sums = list(pd.np.array(counts.sum(axis=0))[0])
        sorted_vocab = sorted(cv.vocabulary_.keys(), key=lambda x: cv.vocabulary_[x])
        # make count dict from sorted vocab and sum counts
        count_dict = dict(zip(sorted_vocab, count_sums))
        all_counts[e] = count_dict
    # now combine all counts
    combined_vocab = list(reduce(lambda x,y: x.union(y),
                                 [set(d.keys()) for d in all_counts.values()]))
    print('combined vocab %s'%(combined_vocab))
    all_counts_dfs = [pd.DataFrame(d, index=[e]).transpose() 
                      for e, d in all_counts.items()]
    combined_counts_df = pd.concat(all_counts_dfs, axis=1)
    combined_counts_df.fillna(0, inplace=True)
    out_dir = subtitle_dir
    combined_counts_df.to_csv(os.path.join(out_dir, 'episode_token_counts.tsv'), sep='\t', encoding='utf-8')
