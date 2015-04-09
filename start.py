import datetime as dt
import numpy as np
import csv

from sklearn.linear_model import LogisticRegression
from sklearn import cross_validation

zips = {'94107':'SF', '94063':'Red', '94301': 'Palo Alto', '94041': 'MV', '95113' : 'SJ'}

def getDate(date, format="%m/%d/%Y %H:%M"):
	return dt.datetime.strptime(date, format).strftime("%Y-%m-%d")  #"4/8/2015 14:13"

stations = {}
with open('201402_station_data.csv', 'rb') as csvfile:
	reader = csv.DictReader(csvfile, delimiter=',')
	for row in reader:
		stations[row['name']] = row

weather = {'94107':{}, '94063':{}, '94301': {}, '94041': {}, '95113' : {}}
with open('201402_weather_data.csv', 'rb') as csvfile:
	reader = csv.DictReader(csvfile, delimiter=',')
	for row in reader:
		date = getDate(row['Date'], "%m/%d/%Y")
		weather[row['zip']][date] = row

print len(weather['94107'])
# raw_input()

trips = {'94107':{}, '94063':{}, '94301': {}, '94041': {}, '95113' : {}}
trips = {}
twoDays = {}
with open('201402_trip_data.csv', 'rb') as csvfile:
	reader = csv.DictReader(csvfile, delimiter=',')
	for row in reader:
		if getDate(row['Start Date']) != getDate(row['End Date']):
			twoDays[row['Trip ID']] = row
		else:
			trips[row['Trip ID']] = row

print len(twoDays), len(trips)
# raw_input()

sumTrips = {'94107':{}, '94063':{}, '94301': {}, '94041': {}, '95113' : {}}
for values in trips.itervalues():
	zipcode = stations[values['Start Station']]['zip']
	stdate = getDate(values['Start Date'])
	# print stdate.date()
	# raw_input()
	if stdate not in sumTrips[zipcode]:
		sumTrips[zipcode][stdate] = 1
	else:
		sumTrips[zipcode][stdate] += 1

print len(sumTrips['94107'])

def getWeatherList(d):
    l = []
    features = ['Mean_Temperature_F', 'Mean_Humidity ', 'Mean_Visibility_Miles ', 'Mean_Wind_Speed_MPH ', 'Cloud_Cover ']
    for f in features:
        l.append(float(d[f]))
    return l

def getFeatures():
    x, y = [], []
    for date, n in sumTrips['94107'].iteritems():
        features = []
        wdic = weather['94107'][date]
        features.extend(getWeatherList(wdic))
        # features.append(stations[t['Start Station']]['station_id'])
        # features.append(stations[t['End Station']]['station_id'])
        x.append(features)
        y.append(n)
    return np.array(x), np.array(y)

x, y = getFeatures()
print x.shape, y.shape
# print x, y
s = cross_validation.cross_val_score(LogisticRegression(), x, y, cv=4)
print s
