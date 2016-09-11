# Extended from https://gist.github.com/zollinger/1722663

import numpy as np 
from PIL import Image, ImageDraw
from operator import itemgetter
import os


# File paths
ss_dir_path = 'data/screenshots/' # screen shots
ss_dir_path = '/Users/fredhohman/Desktop/temp/' # screen shots
test_file_path = 'data/screensshots/fred.png' # single example image

def get_colors(infile, outfile, numcolors=10, swatchsize=100, resize=150):

    # Get color palette
    image = Image.open(infile)
    image = image.resize((resize, resize))
    result = image.convert('P', palette=Image.ADAPTIVE, colors=numcolors)
    result.putalpha(0)
    colors = result.getcolors(resize*resize)
    # Manual check
    # for color in colors:
	   #  print color

	# Sort color palette by count
    colors = sorted(colors, key=itemgetter(0), reverse=True)
    # Manual check
    # print('\n')
    # for color in colors:
	   #  print color

    # Save colors to file
    pal = Image.new('RGB', (swatchsize*numcolors, swatchsize))
    draw = ImageDraw.Draw(pal)

    posx = 0
    for count, col in colors:
        draw.rectangle([posx, 0, posx+swatchsize, swatchsize], fill=col)
        posx = posx + swatchsize

    del draw
    pal.save(outfile, "PNG")

if __name__ == '__main__':

    images = [img for img in os.listdir(ss_dir_path) if img.endswith('png')]
    
    for image in images:
        get_colors(ss_dir_path + image, ss_dir_path + 'output/' + image)

