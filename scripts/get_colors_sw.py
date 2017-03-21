# https://github.com/fengsp/color-thief-py
# https://trac.ffmpeg.org/wiki/Create%20a%20thumbnail%20image%20every%20X%20seconds%20of%20the%20video
import numpy as np 
from PIL import Image, ImageDraw
from operator import itemgetter
import os
from colorthief import ColorThief
import time
import json
import matplotlib.pyplot as plt
import cv2
import math
import colorsys

# File paths
# dir_path = '/Users/fredhohman/Github/cs-7450/data/screenshots/output/'

def make_episode_list():
    
    episode_list = []

    for season_num in [1, 2, 3, 4, 5, 6]:
        for episode_num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
            episode = 's' + str(season_num) + 'e' + str(episode_num)
            episode_list.append(episode)
    return episode_list

# def get_colors(infile, outfile, numcolors=50, swatchsize=100, resize=150):

#     # Get color palette
#     image = Image.open(infile)
#     image = image.resize((resize, resize))
#     result = image.convert('P', palette=Image.ADAPTIVE, colors=numcolors)
#     result.putalpha(0)
#     colors = result.getcolors(resize*resize)
#     # Manual check
#     # for color in colors:
# 	   #  print color

# 	# Sort color palette by count
#     colors = sorted(colors, key=itemgetter(0), reverse=True)
#     # Manual check
#     # print('\n')
#     # for color in colors:
# 	    # print color
#     # print(type(colors))

#     # Save colors to file
#     pal = Image.new('RGB', (swatchsize*numcolors, swatchsize))
#     draw = ImageDraw.Draw(pal)

#     posx = 0
#     for count, col in colors:
#         draw.rectangle([posx, 0, posx+swatchsize, swatchsize], fill=col)
#         posx = posx + swatchsize

#     del draw
#     pal.save(outfile, "PNG")

# this is for sorting colors
def step(r, g, b, repetitions=1):
    lum = math.sqrt(.241 * r + .691 * g + .068 * b)

    h, s, v = colorsys.rgb_to_hsv(r,g,b)

    h2 = int(h * repetitions)
    lum2 = int(lum * repetitions)
    v2 = int(v * repetitions)

    if h2 % 2 == 1:
        v2 = repetitions - v2
        lum = repetitions - lum

    return (h2, lum, v2)

if __name__ == '__main__':

    # for raw images
    episode_list = make_episode_list()
    # episode_list = episode_list[50:]
    # print(episode_list)

    # for created images
    # episode_list = ['/Users/fredhohman/Github/cs-7450']


    # episode = episode + '/'
    # dir_path = '/Volumes/SG-1TB/sw/i-screenshots/'  #for raw images
    dir_path = '/Users/fredhohman/Github/a-viz-of-ice-and-fire/data/sw/iii-color-palettes-chunk-temp-60/'  # for chunked pngs
    # dir_path = episode

    # images = [img for img in os.listdir(dir_path) if img.startswith('out')]  # for raw images
    images = [img for img in os.listdir(dir_path) if img.endswith('.png')]  # for chunk png
    # images = images[0:10]
    print(images)
    print(str(len(images)) + ' images found')

    color_count = 11
    swatchsize = 10
    posx = 0
    posy = 0

    palettes = []

    for img in images:
        print(str(img))
        start = time.time()

        color_thief = ColorThief(dir_path+img)
        palette = color_thief.get_palette(color_count=color_count, quality=5)
        end = time.time() - start
        print(end)

        # print(palette)
        # print(len(palette))
        if len(palette) == color_count:
            print('COLOR PALETTE FOR IMAGE HAD 11 COLORS NOT 10')
            break

        # sort colors
        print(palette)  #checking format
        temp = palette
        temp_np = np.array(temp)
        temp_np = temp_np / 255.0
        temp_list = np.ndarray.tolist(temp_np)
        temp_list.sort(key=lambda rgb: step(rgb[0],rgb[1],rgb[2],8))
        sorted_np = np.round(np.array(temp_list)*255.0).astype(int)
        sorted_list = np.ndarray.tolist(sorted_np)
        palette = sorted_list
        palette = [tuple(x) for x in palette] #convert to list of tuples
        print(palette)  #checking format
        palettes.append(palette)



    pal = Image.new('RGB', (swatchsize*len(palettes[0]), swatchsize*len(images)))
    draw = ImageDraw.Draw(pal)

    for cpal in palettes:
        for col in cpal:
            draw.rectangle([posx, posy, posx+swatchsize, posy+swatchsize], fill=col)
            posx = posx + swatchsize
        posy = posy + swatchsize
        posx = 0
    del draw
    pal.save('../data/sw/sw-iii-chunked-inline-sorted-60.png', "PNG")

    with open('../data/sw/sw-iii-chunked-inline-sorted-60.json', 'w') as outfile:
        json.dump({'palettes': palettes}, outfile)
