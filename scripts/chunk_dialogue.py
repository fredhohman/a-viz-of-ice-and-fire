# author: istewart6 (some help from ssoni)
"""
Code to break subtitle dialogue
into brief chunks.
"""
import pandas as pd
import datetime as datetime
import re, os

if __name__ == '__main__':
    subtitle_dir = '../data/subtitles/subtitlesInTSV/'
    all_episodes = [f for f in os.listdir(subtitle_dir) 
                    if re.findall('S[0-9]E[0-9]+', f)]
    sorted_episodes = sorted(all_episodes)
    episode_data = {e : pd.read_csv(os.path.join(subtitle_dir, e), sep='\t') 
                    for e in sorted_episodes}
    chunk_length = 2
    for e in sorted_episodes:
        e_data = episode_data[e]
        chunks = e_data.apply(lambda r : int(r['endTime'].split(':')[1]) / chunk_length, axis=1)
        e_data['chunk'] = chunks
        fname = os.path.join(subtitle_dir, '%s.tsv'%(e.split('.tsv')[0]))
        e_data.to_csv(fname, sep='\t', index=False)
