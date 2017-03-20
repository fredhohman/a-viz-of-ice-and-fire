# author: istewart6 (some help from ssoni)
"""
Code to break subtitle dialogue
into 60 equal-length clean slices per episode.
"""
from __future__ import division
import pandas as pd
from datetime import datetime
import re, os
import argparse
from clean_extracted_text import clean_text

def convert_time(time_):
    new_time = datetime.strptime(time_, '%H:%M:%S,%f')
    new_time = new_time.hour * 60 + new_time.minute + new_time.second / 60
    return new_time

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sub_file', default='../data/subtitles/subtitlesInTSV/finding_nemo.tsv')
    args = parser.parse_args()
    sub_file = args.sub_file
    sub_name = os.path.basename(sub_file).replace('.tsv', '_clean')
    out_dir = os.path.dirname(sub_file)
    # slice_length = 2
    n_slices = 60
    sub_data = pd.read_csv(sub_file, sep='\t', index_col=0)
    # sub_data = pd.read_csv(sub_file, sep='\t')
    end = sub_data['endTime'].max()
    end = convert_time(end)
    print('got end %s'%(end))
    slice_length = end / n_slices
    # print('about to convert end time data %s'%(e_data['endTime']))
    slices = sub_data.apply(lambda r : int(convert_time(r['startTime']) / slice_length), 
                            axis=1)
    sub_data['slice'] = slices
    # clean shit
    sub_data['dialogue'] = sub_data['dialogue'].apply(clean_text)
    # TODO: also get rid of duplicate lines
    clean_rows = []
    row_count = sub_data.shape[0]
    for i, r in 0sub_data.iterrows():
        if(i > 0 and i < row_count-1):
            current_dialogue = r['dialogue'].lower().strip()
            last_dialogue = sub_data.ix[i-1, 'dialogue'].lower().strip()
            if(current_dialogue != last_dialogue):
                r = pd.DataFrame(r).transpose()
                clean_rows.append(r)
    print('got %d/%d clean rows'%(len(clean_rows), sub_data.shape[0]))
    sub_data = pd.concat(clean_rows, axis=0)
    out_name = os.path.join(out_dir, '%s.tsv'%(sub_name))
    sub_data.to_csv(out_name, sep='\t', index=False)

if __name__ == '__main__':
    main()
