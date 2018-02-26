from bs4 import BeautifulSoup
import requests
import csv

SENATE_CATEGORIES = [['SOLID D', 'LIKELY D'], ['LEAN D', 'TOSS UP'], ['LEAN R', 'LIKELY R'], ['SOLID R']]
SENATE_CATEORY_MAPPING = {'SOLID D': 1, 'LIKELY D': 2, 'LEAN D': 3, 'TOSS UP': 4, 'LEAN R': 5, 'LIKELY R': 6, 'SOLID R': 7}
POLITICAL_PARTY = ['D', 'R']
COLOR_MAP = {'dem': 'D', 'rep': 'R'}

HOUSE_CATEGORIES = [['LIKELY DEMOCRATIC', 'LEAN DEMOCRATIC'], ['DEMOCRATIC TOSS UP', 'REPUBLICAN TOSS UP'], ['LEAN REPUBLICAN', 'LIKELY REPUBLICAN']]
HOUSE_CATEGORY_MAPPING = {'LIKELY DEMOCRATIC': 2, 'LEAN DEMOCRATIC': 3, 'DEMOCRATIC TOSS UP': 4, 'REPUBLICAN TOSS UP': 4, 'LEAN REPUBLICAN': 5, 'LIKELY REPUBLICAN': 6}

def get_children(node):
    children = list(node.children)
    children = list(filter(lambda x: x != '\n', children))
    return children
## enforces that there is a single child and returns it
def get_child(node):
    children = get_children(node)
    assert len(children) == 1
    return children[0]

def parse_cook(soup, categories, expected_matches, get_output_from_item):
    outputs = []
    for cat_group in categories:
        col_headers = soup('p', text=cat_group[0])
        assert len(col_headers) == expected_matches    ## for senate: first is democrats, second is republicans
        for i, col_header in enumerate(col_headers):
            data_cols = get_children(col_header.parent.parent.next_sibling.next_sibling)
            assert len(data_cols) == len(cat_group)
            for j, cat in enumerate(cat_group):
                data_col = data_cols[j]
                data_col = get_child(data_col)
                items = get_children(data_col)
                for item in items:
                    outputs.append(get_output_from_item(item, cat, i))
    return outputs

def write_csv(outputs, filename):
    with open(filename,'w+') as my_csv:
        csvWriter = csv.writer(my_csv, delimiter=',')
        csvWriter.writerows(outputs)

def scrape_senate_or_governors(url, output_filename):
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')

    def get_output(item, cat, i):
        item_contents = get_child(item)
        contents = item_contents.text
        pieces = [x.strip() for x in contents.split('-')]
        assert len(pieces) == 2
        output = []
        output.append(POLITICAL_PARTY[i])
        output.extend(pieces)   ## state abbreviation, senator name
        if output[-1][-3:] == '(I)':
            output[-1] = output[-1][:-3]
            output[0] = 'I'
        if output[1] == 'MN' and output[2] == 'Smith':
            output[1] = 'MN-S'
        output.append(cat)
        output.append(SENATE_CATEORY_MAPPING[cat])
        return output
    outputs = parse_cook(soup, SENATE_CATEGORIES, 2, get_output)
    write_csv(outputs, output_filename)

def scrape_senate():
    url = 'https://www.cookpolitical.com/ratings/senate-race-ratings'
    output_filename = 'cook_senate.csv'
    scrape_senate_or_governors(url, output_filename)

def scrape_governors():
    url = 'https://www.cookpolitical.com/index.php/ratings/governor-race-ratings'
    output_filename = 'cook_governor.csv'
    scrape_senate_or_governors(url, output_filename)

def scrape_house():
    url = 'https://www.cookpolitical.com/index.php/ratings/house-race-ratings'
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')

    def get_output(item, cat, i):
        output = []
        assert len(item['class']) == 1
        color = item['class'][0]
        output.append(COLOR_MAP[color[:color.index('-')]])  ## party
        pieces = [x.strip() for x in item.text.split('-')]
        output.append(pieces[0])   ## state abbreviation
        split_ind = pieces[1].index(' ')
        output.append(pieces[1][:split_ind])   ## district num
        output.append(pieces[1][split_ind + 1:])   ## incumbent name
        output.append(cat)
        output.append(HOUSE_CATEGORY_MAPPING[cat])
        return output
    outputs = parse_cook(soup, HOUSE_CATEGORIES, 1, get_output)
    write_csv(outputs, 'cook_house.csv')

if __name__ == '__main__':
    scrape_senate()
    # scrape_house()
    # scrape_governors()
