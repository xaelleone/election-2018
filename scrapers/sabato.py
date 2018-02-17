from bs4 import BeautifulSoup
import requests
import csv

def scrape_sheet(outfile_name, gid, state_list):
    url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4KY7cdB2oiA8_Qlfjuei0O9LkApgXMnyUm4pcW2KR5pKsTRcEcnC-UoSB8LfqljT1ktFI5e9CPJUn/pubhtml?gid=' + gid
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')

    output = []
    for state in state_list:
        state_row = soup.find('td', text=state)
        if state_row is None:
            continue
        contents = [x.text for x in state_row.parent.findChildren()[2:8]]
        output.append(contents)

    with open('sabato_' + outfile_name + '.csv','w+') as my_csv:
        csvWriter = csv.writer(my_csv, delimiter=',')
        csvWriter.writerows(output)

def senators():
    url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4KY7cdB2oiA8_Qlfjuei0O9LkApgXMnyUm4pcW2KR5pKsTRcEcnC-UoSB8LfqljT1ktFI5e9CPJUn/pubhtml'


senate_gid = '0'
governor_gid = '1856131767'
with open('states.txt') as fin:
    state_names = [x.strip() for x in fin.readlines()]

state_names = state_names + ['Minnesota (S)']

governors()
