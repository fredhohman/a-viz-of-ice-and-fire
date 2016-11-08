import glob, os, pandas, re
import numpy as np

dirName = "../data/subtitles/subtitlesInTSV/"
pattern = "*_LIWC_chunk_counts.tsv"
outFile = "../data/subtitles/subtitlesInTSV/LIWC_chunk_counts_all_seasons.tsv"

def keyFunc (item):
    filename = os.path.basename (item)
    return reduce (lambda x,y:(x-1)*10 + y, map (int, re.findall ("S(\d)E(\d+)",
                                                           filename.strip("_LIWC_chunk_counts.tsv"))[0]))

frames = list ()
for filename in sorted (glob.glob (os.path.join (dirName, pattern)), key=lambda
                       x:keyFunc(x)):
    df = pandas.read_csv (filename, sep="\t", index_col=False)
    df.drop(df.columns[[0]], axis=1, inplace=True)
    #print df
    frames.append (df)

giantFrame = pandas.concat (frames)
giantFrame = giantFrame.applymap (lambda x: sum(eval(x).values()))
#giantFrame = giantFrame.replace (np.nan, 0)
giantFrame.to_csv (outFile, sep="\t", index=False, header=True, na_rep='')
#print giantFrame
#print len (giantFrame.index)
