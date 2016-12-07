"""
Get per-episode counts of all 
unigrams and bigrams.
"""
from clean_extracted_text import clean_text
from sklearn.feature_extraction.text import CountVectorizer
from stopwords import get_stopwords
import pandas as pd
import argparse, os, re

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_dir',
                        default='../data/subtitles/subtitlesInTSV/')
    args = parser.parse_args()
    data_dir = args.data_dir
    dialogue_files = [f for f in os.listdir(data_dir)
                      if re.findall('S[1-9]E[0-9]+.tsv', f)]
    dialogue_files = [os.path.join(data_dir, f) 
                      for f in dialogue_files]
    stops = get_stopwords('en') + ['will', 'don', 've', ]
    all_docs = {}
    for f in dialogue_files:
        ep_name = re.findall('S[1-9]E[0-9]+', f)[0]
        data = pd.read_csv(f, sep='\t')
        docs = []
        for chunk, data_group in data.groupby('chunk'):
            clean_dialogue = []
            for d in data_group['dialogue']:
                # print('raw dialogue %s'%(d))
                cleaned = clean_text(str(d))
                try:
                    cleaned = cleaned.decode('utf-8')
                    clean_dialogue.append(cleaned)
                except Exception, e:
                    print('could not clean text %s because error %s'%
                          (cleaned, e))
            all_dialogue = ' '.join(clean_dialogue)
            docs.append(all_dialogue)
        episode_text = ' '.join(docs)
        # print('got full text %s'%
        #       (episode_text))
        all_docs[ep_name] = episode_text
    sorted_ep_names, sorted_docs = zip(*sorted(all_docs.items(), 
                                               key=lambda i: i[0]))
    print('sorted ep names %s'%
          (str(sorted_ep_names)))
    min_df = 0.05
    ngram_range = (1,2)
    # need tokenizer? probs not
    # TODO: normal tokenizer
    cv = CountVectorizer(min_df=min_df, max_df=0.9, 
                         ngram_range=ngram_range,
                         encoding='utf-8', stop_words=stops)
    counts = cv.fit_transform(sorted_docs)
    counts = counts.todense()
    print('got final counts with shape %s'%
          (str(counts.shape)))
    # convert to save-able format
    sorted_vocab = sorted(cv.vocabulary_, 
                          key=lambda k: cv.vocabulary_[k])
    counts = pd.DataFrame(counts, columns=sorted_vocab)
    counts['season'] = [re.findall("(?<=S)[1-6]", e)[0]
                        for e in sorted_ep_names]
    counts['episode'] = [re.findall("(?<=E)[0-9]+", e)[0]
                        for e in sorted_ep_names]
    out_dir = data_dir
    out_file = os.path.join(out_dir, 'all_episode_dtm.tsv')
    counts.to_csv(out_file, sep='\t', index=False)

if __name__ == '__main__':
    main()
