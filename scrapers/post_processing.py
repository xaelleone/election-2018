from collections import defaultdict
import csv
import json

SOURCES = ['sabato', 'cook', 'rothenberg']
ELECTIONS = ['house', 'senate', 'governor']
POSITIONS = [
	{ 'state': 0, 'name': 1, 'party': 2, 'incumbent': 3, 'sabato_rank': 5 },  ## sabato
	{ 'party': 0, 'state': 1, 'name': 2, 'cook_rank': 4 },  ## cook
	{ 'state': 0, 'party': 1, 'name': 3, 'rothenberg_rank': 5 }  ## rothenberg
]
PROPERTIES = ['party', 'state', 'name']
SOURCE_PROPERTIES = [['incumbent', 'sabato_rank'], ['cook_rank'], ['rothenberg_rank']]
ELECTION_PROPERTIES = [['district'], [], []]

def get_value(source_ind, value_type, election):
	if value_type == 'district':
		return get_value(source_ind, 'state', election) + 1
	else:
		ind = POSITIONS[source_ind][value_type]
		if election == 'house' and POSITIONS[source_ind]['state'] < ind:
			ind += 1
		return ind

def get_data(source, election):
	with open(source + '_' + election + '.csv') as csvDataFile:
		csvReader = csv.reader(csvDataFile)
		return [row for row in csvReader]

if __name__ == '__main__':
	for election_ind, election in enumerate(ELECTIONS):
		results = defaultdict(dict)
		for source_ind, source in enumerate(SOURCES):
			data = get_data(source, election)
			for x in data:
				if election == 'house':
					state = x[get_value(source_ind, 'state', election)]
					district = x[get_value(source_ind, 'district', election)]
					key = state + district
				else:
					key = x[get_value(source_ind, 'state', election)]
				entry = results[key]
				properties = PROPERTIES + SOURCE_PROPERTIES[source_ind] + ELECTION_PROPERTIES[election_ind]
				for prop in properties:
					val = x[get_value(source_ind, prop, election)]
					if prop in entry:
						if prop != 'name':
							assert entry[prop] == val
						elif entry[prop].find(val) == -1 and val.find(entry[prop]) == -1:
							print('name conflict: ' + entry[prop] + ', ' + val + ' ; ' + election)
					else:
						entry[prop] = val
		## save results
		with open('../student-voting/src/data/' + election + '_compiled.json', 'w') as f:
			json.dump(results, f, indent=4)
