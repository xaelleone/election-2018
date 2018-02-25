from bs4 import BeautifulSoup
import requests
import csv

def get_children(node):
    children = list(node.children)
    children = list(filter(lambda x: x != '\n', children))
    return children

def scrape_sheet(outfile_name, gid, state_list, num_cols):
    print(outfile_name)
    url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4KY7cdB2oiA8_Qlfjuei0O9LkApgXMnyUm4pcW2KR5pKsTRcEcnC-UoSB8LfqljT1ktFI5e9CPJUn/pubhtml?gid=' + gid + '&single=true'
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')

    output = []
    for state in state_list:
        state_rows = soup('td', text=state)
        if not state_rows:
            continue
        for state_row in state_rows:
            contents = [x.text for x in get_children(state_row.parent)[1:1 + num_cols]]
            if contents[1] == 'AL':
                contents[1] = '0'
            if contents[0] in name_to_abbr:
                contents[0] = name_to_abbr[contents[0]]
            if contents not in output:
                output.append(contents)

    with open('sabato_' + outfile_name + '.csv','w+') as my_csv:
        csvWriter = csv.writer(my_csv, delimiter=',')
        csvWriter.writerows(output)

senate_gid = '0'
governor_gid = '1856131767'
house_gid = '2083419594'
with open('states.txt') as fin:
    state_names = [x.strip() for x in fin.readlines()]

with open('state_abbrs.txt') as fin:
    state_abbrs = [x.strip() for x in fin.readlines()]

name_to_abbr = dict(zip(state_names, state_abbrs))
state_names = state_names + ['Minnesota (S)']
name_to_abbr['Minnesota (S)'] = 'MN'

scrape_sheet('senate', senate_gid, state_names, 6)
scrape_sheet('governor', governor_gid, state_names, 6)
scrape_sheet('house', house_gid, state_abbrs, 7)
