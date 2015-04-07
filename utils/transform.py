"""
reads the csv files and converts to json
"""

import csv
import json

data_file = open("201402_trip_data.csv","r")
trip_reader = csv.reader(data_file)

skipFirst = 1
resList = []
for trip in trip_reader:
	if skipFirst!=1:
		resList.append({"source":trip[4],"target":trip[7],"type":"directed","subscription":trip[9]})
	skipFirst = 0


with open('trips.json', 'w') as outfile:
    json.dump(resList, outfile,indent=1)