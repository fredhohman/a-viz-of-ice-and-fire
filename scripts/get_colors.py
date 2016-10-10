# https://github.com/fengsp/color-thief-py
# https://trac.ffmpeg.org/wiki/Create%20a%20thumbnail%20image%20every%20X%20seconds%20of%20the%20video
import numpy as np 
from PIL import Image, ImageDraw
from operator import itemgetter
import os
from colorthief import ColorThief
import time

# File paths
# dir_path = '/Users/fredhohman/Github/cs-7450/data/screenshots/output/'
dir_path = '/Volumes/SAMSUNG T3/screenshots/s1e1/'

def get_colors(infile, outfile, numcolors=50, swatchsize=100, resize=150):

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
	    # print color
    # print(type(colors))

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

    images = [img for img in os.listdir(dir_path) if img.endswith('jpg')]
    images = images[436:446]
    print(images)

    color_count = 10
    swatchsize=10
    posx = 0
    posy = 0

    pal = Image.new('RGB', (swatchsize*color_count, swatchsize*len(images)))
    draw = ImageDraw.Draw(pal)

    for img in images:
        print("looped")

        start = time.time()
        color_thief = ColorThief(dir_path+img)
        dominant_color = color_thief.get_color(quality=1)
        palette = color_thief.get_palette(color_count = color_count)
        end = time.time() - start
        print(end)

        start = time.time()
        for col in palette:
            draw.rectangle([posx, posy, posx+swatchsize, posy+swatchsize], fill=col)
            posx = posx + swatchsize
        posy = posy + swatchsize
        posx = 0
        end = time.time() - start
        print(end)

        

    del draw
    pal.save('test.png', "PNG")