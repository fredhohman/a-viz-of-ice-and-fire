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


if __name__ == '__main__':

    # for raw images
    episode_list = make_episode_list()
    # episode_list = episode_list[50:]
    # print(episode_list)

    # for created images
    # episode_list = ['/Users/fredhohman/Github/cs-7450']

    for episode in episode_list:
        episode = episode + '/'
        # dir_path = '/Volumes/SG-1TB/screenshots/' + episode #for raw images
        dir_path = '/Users/fredhohman/Github/cs-7450/data/color-palettes-chunk-temp/' + episode  # for raw images
        # dir_path = episode

        # images = [img for img in os.listdir(dir_path) if img.endswith('jpeg')] #for raw images
        images = [img for img in os.listdir(dir_path) if img.endswith('.png')]
        print(images)
        # images = images[0:50]
        print(str(len(images)) + ' images found in ' + episode[:-1])

        color_count = 11
        swatchsize = 10
        posx = 0
        posy = 0

        palettes = []

        for img in images:
            print(str(img))
            start = time.time()

            color_thief = ColorThief(dir_path+img)
            palette = color_thief.get_palette(color_count=color_count, quality=10)
            end = time.time() - start
            print(end)

            # print(palette)
            # print(len(palette))
            if len(palette) == color_count:
                print('COLOR PALETTE FOR IMAGE HAD 11 COLORS NOT 10')
                break

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
        pal.save(episode[:-1] + '.png', "PNG")

        # print(palettes)
        # with open('data/color/' + episode[:-1] + '.json', 'w') as outfile:
        #     json.dump({'palettes': palettes}, outfile)

        with open('data/color/' + str(episode[:-1]) + '_chunk.json', 'w') as outfile:
            json.dump({'palettes': palettes}, outfile)
