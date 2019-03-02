import os
import docx2txt

import Sorting


def getListOfFiles(dirName):
    # create a list of file and sub directories
    # names in the given directory
    listOfFile = os.listdir(dirName)
    allFiles = list()
    # Iterate over all the entries
    for entry in listOfFile:
        # Create full path
        fullPath = os.path.join(dirName, entry)
        # If entry is a directory then get the list of files in this directory
        if os.path.isdir(fullPath):
            allFiles = allFiles + getListOfFiles(fullPath)
        else:
            allFiles.append(fullPath)

    return allFiles


files = [x for x in getListOfFiles('./data') if ('.docx' in x) and ('Sources for' not in x)]
text = [docx2txt.process(file) for file in files]
labels = Sorting.analyze(text, 7)
print(labels)

members = [index for index in range(len(labels)) if labels[index] == 0]
print([files[index] for index in members])
