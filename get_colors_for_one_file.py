# https://github.com/fengsp/color-thief-py
# https://trac.ffmpeg.org/wiki/Create%20a%20thumbnail%20image%20every%20X%20seconds%20of%20the%20video
import numpy as np 
from PIL import Image, ImageDraw
from operator import itemgetter
import os, sys
from colorthief import ColorThief
import time
import json
import matplotlib.pyplot as plt
import cv2


def make_episode_list():
    
    episode_list = []

    for season_num in [1, 2, 3, 4, 5, 6]:
        for episode_num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]:
            episode = 's' + str(season_num) + 'e' + str(episode_num)
            episode_list.append(episode)
    return episode_list

if __name__ == '__main__':

    dir_path = '/Users/fredhohman/Github/cs-7450/'

    images = make_episode_list()
    images = [image + '.png' for image in images]
    images = ['intro.jpg']
    print(len(images))
    print(images)
    
    color_count = 11
    swatchsize = 100
    posx = 0
    posy = 0

    palettes = []

    for img in images:
        print(str(img))
        start = time.time()

        color_thief = ColorThief(dir_path+img)
        palette = color_thief.get_palette(color_count = color_count, quality = 1)
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
    pal.save('series_title.png', "PNG")

    # print(palettes)
    with open('data/color/intro.json', 'w') as outfile:
        json.dump({'palettes': palettes}, outfile)
