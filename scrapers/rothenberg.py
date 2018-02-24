from bs4 import BeautifulSoup
import requests
import csv
import re

def scrape_states(section, state_list):
    url = 'https://insideelections.com/ratings/' + section
    soup = BeautifulSoup(requests.get(url).text, 'html.parser')

    #in_header = soup('h3', text='Toss-up')[0].next_sibling.next_sibling.findChildren

def scrape_section(header, state_list, subsoup):
    output = []
    for state in state_list:
        results = subsoup.find('td', text=state)
        if results is None:
            continue
        contents = [x.text for x in results.parent.findChildren()]
        contents[-1] = header
        output.append(contents)
    return output

with open('state_abbrs.txt') as fin:
    state_abbrs = [x.strip() for x in fin.readlines()]

url = 'https://insideelections.com/ratings/' + 'senate'
soup = BeautifulSoup(requests.get(url).text, 'html.parser')
sections = soup('table', {'class', re.compile('ratings.*')})
output = []
for s in sections:
    substr = s['class'][-1]
    header = soup.find('h3', {'class', re.compile('.*' + substr + '.*')})
    if header is None:
        continue
    output.extend(scrape_section(header.text, state_abbrs, s))
print(output)
