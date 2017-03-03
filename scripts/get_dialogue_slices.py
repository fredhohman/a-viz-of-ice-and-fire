"""
Get dialogue slices
"""
import glob
import os, re
import pandas as pd

TRIGGERS=['transcript', 'font', 'synced']
def clean_txt(dialogue):
    dialogue = dialogue.replace('$', ' ')
    dialogue = dialogue.replace('<i>', '')
    dialogue = dialogue.replace('</i>', '')
    dialogue = re.sub('[A-Z][a-z]+:', '', dialogue)
    lowered = dialogue.lower()
    for t in TRIGGERS:
        if t in lowered:
            # print('triggered at %s'%(lowered))
            dialogue = ''
    return dialogue

def main():
    data_dir = '../data/subtitles/subtitlesInTSV/'
    filenames = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if re.findall('S[0-9]E[0-9]+.tsv', f)]
    all_data = []
    for filename in filenames:
        print('processing file %s'%(filename))
        data = pd.read_csv(filename, sep='\t')
        season, episode = re.findall('S([0-9])E([0-9])+', filename)[0]
        season = int(season)
        episode = int(episode)
        relevant_data = data[['dialogue', 'chunk']]
        # clean dialogue
        dialogue = relevant_data['dialogue'].apply(str)
        # print('unclean dialogue %s'%(dialogue))
        all_dialogue = []
        for d in dialogue:
            # print('processing %s'%(d))
            clean_dialogue = clean_txt(d)
            all_dialogue.append(clean_dialogue)
        relevant_data['dialogue'] = all_dialogue
        relevant_data['season'] = season
        relevant_data['episode'] = episode
        relevant_data.rename(columns={u'chunk' : u'slice'}, inplace=True)
        all_data.append(relevant_data)
    all_data = pd.concat(all_data, axis=0)
    all_data.to_csv(os.path.join(data_dir, 'dialogue_all_seasons.tsv'), sep='\t')

if __name__ == '__main__':
    main()
