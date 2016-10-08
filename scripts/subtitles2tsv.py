import glob, os

dirName = "../data/subtitles/clean_scripts"
outDir = "../data/subtitles/subtitlesInTSV"

def RepresentsInt(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def listFiles (dirName):
    pattern = os.path.join (dirName, "*.srt")
    files = glob.glob(pattern)
    return files

def readFile (filename):
    with open (filename) as fin:
        lines = [line.strip() for line in fin]
    return lines

def getStructuredRecord (lines):
    frameNo = -1
    startTime = "NA"
    endTime = "NA"
    dialogue = ""
    recordParsingStarted = False
    for line in lines:
        if line == "" and recordParsingStarted == False:
            continue
        elif line == "":
            recordParsingStarted = False
            yield (frameNo, startTime, endTime, dialogue)
            frameNo = -1
            starTime = "NA"
            endTime = "NA"
            dialogue = ""
        elif len (line) > 0:
            recordParsingStarted = True
            if RepresentsInt (line):
                frameNo = int(line)
            elif "-->" in line:
                parts = line.split ("-->")
                startTime = parts[0].strip()
                endTime = parts[1].strip()
            else:
                dialogue = dialogue + "$" + line
    yield (frameNo, startTime, endTime, dialogue)

def getSeasonAndEpisodeNumber (filename):
    basename = os.path.basename (filename)
    abbrev = basename.split("-")[1].strip()
    seasonNo = int(abbrev.split("x")[0])
    episodeNo = int (abbrev.split("x")[1])
    return seasonNo, episodeNo

if not os.path.exists (outDir):
    os.makedirs (outDir)

for i, filename in enumerate (sorted (listFiles (dirName))):
    #print filename
    seasonNo, episodeNo = getSeasonAndEpisodeNumber (filename)
    outFile = os.path.join (outDir, "S{0}E{1}.tsv".format(seasonNo, episodeNo))
    print outFile
    lines = readFile (filename)
    with open (outFile, "w") as fout:
        fout.write ("\t".join (["frameNo", "startTime", "endTime",
                                "dialogue"]) + "\n")
        for frameNo, startTime, endTime, dialogue in getStructuredRecord (lines):
            outLine = "\t".join ([str(frameNo), startTime, endTime, dialogue]) + "\n"
            fout.write (outLine)
