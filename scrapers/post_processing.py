import csv

def clean_cook(datum):
	pass
 
with open('cook_house.csv') as csvDataFile:
    csvReader = csv.reader(csvDataFile)
    for row in csvReader:
        print(row)

print(COOK_RATINGS)