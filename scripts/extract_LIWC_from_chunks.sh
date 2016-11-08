# extract LIWC counts in ~parallel~
SUB_DIR='../data/subtitles/subtitlesInTSV'
SUB_FILES=$SUB_DIR/S*E*[0-9].tsv
for SUB_FILE in $SUB_FILES;
do
    echo $SUB_FILE
    python extract_LIWC_from_chunks.py --all_episodes $SUB_FILE &
done
