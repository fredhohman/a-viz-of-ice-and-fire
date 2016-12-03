"""
Combine the separate per-episode LIWC chunk
count files into a horrible mega-file.
"""
import os, re
import pandas as pd
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_dir', default='../data/subtitles/subtitlesInTSV/')
    args = parser.parse_args()
    data_dir = args.data_dir
    token_count_files = [f for f in os.listdir(data_dir)
                         if 'LIWC_chunk_counts.tsv' in f]
    # print('got %d token count files %s'%
    #       (len(token_count_files), str(token_count_files)))
    # sort files by episode order
    token_count_files = sorted(token_count_files,
                               key=lambda x: 
                               (int(re.findall('(?<=S)[1-6]', x)[0])*10 + 
                                int(re.findall('(?<=E)[0-9]+', x)[0]))
                               )
    all_token_counts = []
    for f in token_count_files:
        season = re.findall('(?<=S)[1-6]', f)[0]
        episode = re.findall('(?<=E)[0-9]+', f)[0]
        full_file = os.path.join(data_dir, f)
        token_counts = pd.read_csv(full_file, sep='\t', index_col=None)
        token_counts['season'] = season
        token_counts['episode'] = episode
        all_token_counts.append(token_counts)
    all_token_counts = pd.concat(all_token_counts, axis=0)
    out_dir = data_dir
    out_file = os.path.join(out_dir, 'LIWC_chunk_counts_all_episodes.tsv')
    print('writing all counts to file %s'%(out_file))
    all_token_counts.to_csv(out_file, sep='\t', index=None)

if __name__ == '__main__':
    main()
