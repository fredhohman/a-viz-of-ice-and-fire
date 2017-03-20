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
    parser.add_argument('--dialogue_file', default='../data/subtitles/subtitlesInTSV/finding_nemo_clean.tsv')
    parser.add_argument('--data_dir', default='../data/subtitles/subtitlesInTSV/')
    args = parser.parse_args()
    dialogue_file = args.dialogue_file
    data_dir = args.data_dir
    sub_name = os.path.basename(dialogue_file).replace('.tsv', '')
    print(sub_name)
    custom_words = ['will', 'don', 've', 're', 'oh', 'hey', 'ha', 'aah', 'll', 'can', 'dont', 'just']
    stops = get_stopwords('en') + custom_words
    data = pd.read_csv(dialogue_file, sep='\t')
    all_docs = {}
    for slice_, data_group in data.groupby('slice'):
        clean_dialogue = []
        for d in data_group['dialogue']:
            # print('raw dialogue %s'%(d))
            # cleaned = clean_text(str(d))
            try:
                cleaned = d.decode('utf-8')
                clean_dialogue.append(cleaned)
            except Exception, e:
                print('could not clean text %s because error %s'%
                      (d, e))
        all_dialogue = ' '.join(clean_dialogue)
        all_docs[slice_] = all_dialogue
    all_text = [' '.join(all_docs.values())]
    min_df = 1 # 0.05
    ngram_range = (1,1)
    # need tokenizer? probs not
    # TODO: normal tokenizer
    cv = CountVectorizer(min_df=min_df, 
                         # max_df=0.9,
                         ngram_range=ngram_range,
                         encoding='utf-8', stop_words=stops)
    counts = cv.fit_transform(all_text)
    counts = counts.todense()
    print('got final counts with shape %s'%
          (str(counts.shape)))
    # convert to save-able format
    sorted_vocab = sorted(cv.vocabulary_, 
                          key=lambda k: cv.vocabulary_[k])
    counts = pd.DataFrame(counts, columns=sorted_vocab)
    out_dir = data_dir
    out_file = os.path.join(out_dir, '%s_dtm.tsv'%(sub_name))
    counts.to_csv(out_file, sep='\t', index=False)

if __name__ == '__main__':
    main()
