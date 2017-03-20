import os

if __name__ == "__main__":
    data_dir = '../data/subtitles/subtitlesInTSV/'
    rename_files = [os.path.join(data_dir, f) 
                    for f in os.listdir(data_dir)
                    if 'chunk' in f]
    for f in rename_files:
        new_name = f.replace('.tsv', '') + '.tsv'
        os.rename(f, new_name)
