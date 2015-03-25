#!/usr/bin/python

import sys
import shutil

fileSource = sys.argv[1]

fileDestination = sys.argv[2]

shutil.copy2(fileSource,fileDestination)

print 0

