import glob, os
import argparse

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

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sub_file', default='../data/subtitles/finding_nemo.txt')
    parser.add_argument('--out_dir', default='../data/subtitles/subtitlesInTSV/')
    args = parser.parse_args()
    sub_file = args.sub_file
    print(sub_file)
    fname = os.path.basename(sub_file)
    out_dir = args.out_dir
    out_file = os.path.join(out_dir, fname.replace('.txt', '.tsv'))
    lines = readFile (sub_file)
    with open (out_file, "w") as fout:
        fout.write ("\t".join (["frameNo", "startTime", "endTime",
                                "dialogue"]) + "\n")
        for frameNo, startTime, endTime, dialogue in getStructuredRecord (lines):
            outLine = "\t".join ([str(frameNo), startTime, endTime, dialogue]) + "\n"
            fout.write (outLine)

if __name__ == '__main__':
    main()
