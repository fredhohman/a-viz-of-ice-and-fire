# -*- coding=utf8 -*-
"""
Preprocess the text extracted from subtitle
files by stripping unnecessary characters.
"""
import re
from nltk.tokenize import WordPunctTokenizer

removal_strings = ['\(.*\)', '<i>', '</i>',
                   '.*font color.*', u'♪ ♪', 
                   '^- ', '^[a-zA-Z ]*:', '--', 
                   '.*[Ss]ync.*', '.*www.*']
removal_regexes = list(map(lambda r: re.compile(r),
                           removal_strings))
substitute_strings = {'don\'t' : 'dont',
                      'didn\'t' : 'didnt',
                      'doesn\'t' : 'doesnt',
                      'can\'t': 'cant', 
                      'wouldn\'t': 'wouldnt',
                      'couldn\'t': 'couldnt',
                      'shouldn\'t': 'shouldnt',
                      'weren\'t' : 'werent',
                      'won\'t' : 'wont'}
substitute_regexes = {k : re.compile(k) for k in substitute_strings.keys()}
line_break_delim = '$'

TKNZR = WordPunctTokenizer()
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
      for s, regex in substitute_regexes.items():
         if(regex.findall(l)):
            l = l.replace(s, substitute_strings[s])
      # we only want alphanumeric stuff
      # l = ' '.join(list(filter(lambda w: w.isalnum(), TKNZR.tokenize(l))))
      clean_lines.append(l)
   clean_text = ' '.join(clean_lines)
   return clean_text

