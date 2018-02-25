from bs4 import BeautifulSoup
import requests
import csv
import re

CATEGORY_MAPPINGS = {'Solid Democratic': 1, 'Likely Democratic': 1.75, 'Lean Democratic': 2.5, 'Tilt Democratic': 3.25, 'Toss-up': 4,
                        'Tilt Republican': 4.75, 'Lean Republican': 5.5, 'Likely Republican': 6.25, 'Solid Republican': 7,
                        'Lean Independent': 2.5}
SINGLE_DISTRICT_STATES = set(['AK', 'DE', 'MT', 'ND', 'SD', 'VT', 'WY'])

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


def scrape(url_ext, process_output):
    url = 'https://insideelections.com/ratings/' + url_ext
    soup = BeautifulSoup(requests.get(url).text, 'html.parser')
    sections = soup('table', {'class', re.compile('ratings.*')})
    output = []
    for s in sections:
        substr = s['class'][-1]
        header = soup.find('h3', {'class', re.compile('.*' + substr + '.*')})
        if header is None:
            continue
        output.extend(scrape_section(header.text, state_abbrs, s))

    # print(output)
    output = [process_output(x) for x in output]
    output = [x + [CATEGORY_MAPPINGS[x[-1]]] for x in output]
    with open('rothenberg_' + url_ext + '.csv', 'w+') as my_csv:
        csvWriter = csv.writer(my_csv, delimiter=',')
        csvWriter.writerows(output)

def scrape_house():
    def process(x):
        if len(x) == 8:
            if x[4] == '':
                assert x[5] == 'VACANT Special'
                x[5] = 'Special'
                x[6] = 'None'
            else:
                assert x[4] == x[5] == 'Open', 'House data unexpected format: ' + str(x)
        elif len(x) == 7:
            assert x[4] == ''
            x[4] = 'Incumbent'
        else:
            assert False, 'House data unexpected format: ' + str(x)
        ## renumber districts that are the only ones in the state to 0, not 1
        if x[0] in SINGLE_DISTRICT_STATES:
            x[1] = '0'
        return x[:3] + x[-3:]
    scrape('house', process)
def scrape_senate():
    def process(x):
        if len(x) == 8:
            if x[4] == '':
                assert x[5] == 'Smith Special'
                x[5] = 'Incumbent'
                x[6] = 'Smith'
            else:
                assert x[4] == x[5] == 'Open', 'Senate data unexpected format: ' + str(x)
        elif len(x) == 7:
            assert x[4] == ''
            x[4] = 'Incumbent'
        else:
            assert False, 'Senate data unexpected format: ' + str(x)
        return x[:1] + x[2:3] + x[-3:]
    scrape('senate', process)
def scrape_governors():
    def process(x):
        if len(x) == 7:
            assert x[3] == x[4] == 'Open', 'Governor data unexpected format: ' + str(x)
        elif len(x) == 6:
            assert x[3] == ''
            x[3] = 'Incumbent'
        else:
            assert False, 'Governor data unexpected format: ' + str(x)
        return x[:2] + x[-3:]
    scrape('governor', process)

scrape_house()
# scrape_senate()
# scrape_governors()

