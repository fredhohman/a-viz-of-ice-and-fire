import glob, os, pandas, re
import numpy as np

dirName = "../data/subtitles/subtitlesInTSV/"
pattern = "*_LIWC_chunk_counts.tsv"
outFile = "../data/subtitles/subtitlesInTSV/LIWC_chunk_counts_all_seasons.tsv"

def extract_season_episode(filename):
    combined = re.findall('S[0-9]E[0-9]+', filename)[0]
    season, episode = combined.split('E')
    season = int(season.replace('S', ''))
    episode = int(episode)
    return season, episode

def keyFunc (item):
    filename = os.path.basename (item)
    return reduce (lambda x,y:(x-1)*10 + y, map (int, re.findall ("S(\d)E(\d+)",
                                                           filename.strip("_LIWC_chunk_counts.tsv"))[0]))

frames = list ()
chunks = []
seasons = []
episodes = []

for filename in sorted (glob.glob (os.path.join (dirName, pattern)), key=lambda
                       x:keyFunc(x)):
    df = pandas.read_csv (filename, sep="\t", index_col=False)
    chunks.extend(df['chunk'])
    df.drop('chunk', axis=1, inplace=True)
    season, episode = extract_season_episode(filename)
    seasons.extend([season]*df.shape[0])
    episodes.extend([episode]*df.shape[0])
    #print df
    frames.append(df)

giantFrame = pandas.concat (frames)
giantFrame = giantFrame.applymap (lambda x: sum(eval(x).values()))
giantFrame['chunk'] = chunks
giantFrame['season'] = seasons
giantFrame['episode'] = episodes
#giantFrame = giantFrame.replace (np.nan, 0)
giantFrame.to_csv (outFile, sep="\t", index=False, header=True, na_rep='')
#print giantFrame
#print len (giantFrame.index)
