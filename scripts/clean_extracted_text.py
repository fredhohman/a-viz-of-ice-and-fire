# -*- coding=utf8 -*-
"""
Preprocess the text extracted from subtitle
files by stripping unnecessary characters.
"""
import re

removal_strings = ['\(.*\)', '<i>', '</i>'
                      # 
                   '.*font color.*', u'♪ ♪', 
                   '^- ', '^[a-zA-Z ]*:', '--', 
                   '.*[Ss]ync.*', '.*www.*']
removal_regexes = list(map(lambda r: re.compile(r),
                           removal_strings))
line_break_delim = '$'

def clean_text(text):
   """
   Strip all the bad stuff out of the text.
   """
   lines = text.split(line_break_delim)
   clean_lines = []
   for l in lines:
      for regex in removal_regexes:
         l = regex.sub('', l)
      # for some reason this is necessary
      l = l.replace('</i>', '')
      clean_lines.append(l)
   clean_text = '$'.join(clean_lines)
   return clean_text

