"""
Convert JSON file of token counts per category
per episode to .tsv with top-k words in each
category per episode.
"""
import json
import pandas as pd
import argparse, os

EPISODES=10
SEASONS=6
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--token_counts',
                        default='../data/text_category_stats/episodeLevel.json')
    parser.add_argument('--categories',
                        default=['anger', 'death', 'family', 'home', 'humans', 
                                 'positive_affect', 'negative_affect', 'religion', 
                                 'sexual', 'swear'],
                        nargs='+')
    parser.add_argument('--top_k', default=5)
    args = parser.parse_args()
    token_counts = json.load(open(args.token_counts,'r'))
    categories = sorted(args.categories)
    top_k = args.top_k
    final_stats = []
    for i, row in enumerate(token_counts):
        updated_row = {}
        updated_row['episode'] = i % EPISODES + 1
        updated_row['season'] = int(i / EPISODES) + 1
        for c in args.categories:
            top_words = sorted(row[c].items(), key=lambda x: x[1],
                               reverse=True)[:top_k]
            # TODO: for now we only include words but we probably want
            # raw count as well...what is ideal data format??
            updated_row[c] = ','.join(["%s:%d"%(w,f) for w,f in top_words])
        final_stats.append(updated_row)
    final_stats = pd.DataFrame(final_stats)
    # make sure columns are ordered
    final_stats = final_stats[['season', 'episode'] + categories]
    out_dir = os.path.dirname(args.token_counts)
    out_file = os.path.join(out_dir, 'top_%d_category_words_per_episode.tsv'%(top_k))
    final_stats.to_csv(out_file, sep='\t', index=False)

if __name__ == '__main__':
    main()
