import os
import re
import sys

# set to true or false for addtional program information or commands
richoutput = False
dooutput = True
outputdir = "../html/"

# grab html source files
htmldir = os.path.dirname(os.path.realpath(__file__)) + "\\html"
onlyfiles = [f for f in os.listdir(htmldir) if os.path.isfile(os.path.join(htmldir, f)) and f[-5:] == ".html"]
htmlfiles = {}

# load file contents into memory
for file in onlyfiles:
    openedfile = open("html/"+file, 'r')
    htmlfiles[file[:-5]] = openedfile.read()

# replace link indicators in files
# <??replace"example"> -> example.html contents
for file in onlyfiles:
    replaceindicators = [p.start() for p in re.finditer(r"<\?\?replace=\"", htmlfiles[file[:-5]])]
    flagged = False
    iterator = 0
    while htmlfiles[file[:-5]][iterator:].find("<??replace=\"") != -1:
        pos = htmlfiles[file[:-5]][iterator:].find("<??replace=\"") + iterator
        flagged = True
        endpos = htmlfiles[file[:-5]][pos:].find("\">") + pos
        shortcutname = htmlfiles[file[:-5]][pos+12:endpos]
        if shortcutname in htmlfiles:
            print("Linked html/",shortcutname,".html @ ",file," [char ",pos,"]",sep='')
            htmlfiles[file[:-5]] = htmlfiles[file[:-5]][:pos] + htmlfiles[shortcutname] + htmlfiles[file[:-5]][endpos+2:]
        else:
            # log error and stop program if incorrect link found
            print("ERROR: file html/",shortcutname, ".html not found",sep='')
            print("> ",file," @ char ",pos,sep='')
            sys.exit()
        iterator = pos
    if flagged:
        if richoutput:
            query = input("\ndisplay linked file? (y/n) ")
            if query.find("y") or query[:1] == "y":
                print("\n", htmlfiles[file[:-5]])
        if dooutput:
            os.makedirs(os.path.dirname(outputdir), exist_ok=True)
            output = open(outputdir+file, 'w')
            output.write(htmlfiles[file[:-5]])