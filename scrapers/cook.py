from bs4 import BeautifulSoup
import requests
import csv

SENATE_CATEGORIES = [['SOLID D', 'LIKELY D'], ['LEAN D', 'TOSS UP'], ['LEAN R', 'LIKELY R'], ['SOLID R']]
POLITICAL_PARTY = ['dem', 'rep']

HOUSE_CATEGORIES = [['LIKELY DEMOCRATIC', 'LEAN DEMOCRATIC'], ['DEMOCRATIC TOSS UP', 'REPUBLICAN TOSS UP'], ['LEAN REPUBLICAN', 'LIKELY REPUBLICAN']]

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

def scrape_senate():
    url = 'https://www.cookpolitical.com/ratings/senate-race-ratings'
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')

    def get_output(item, cat, i):
        item_contents = get_child(item)
        contents = item_contents.text
        pieces = [x.strip() for x in contents.split('-')]
        assert len(pieces) == 2
        output = []
        output.append(POLITICAL_PARTY[i])
        output.extend(pieces)   ## state abbreviation, senator name
        output.append(cat)
        return output
    outputs = parse_cook(soup, SENATE_CATEGORIES, 2, get_output)

    with open('cook_senators.csv','w+') as my_csv:
        csvWriter = csv.writer(my_csv, delimiter=',')
        csvWriter.writerows(outputs)

def scrape_house():
    url = 'https://www.cookpolitical.com/index.php/ratings/house-race-ratings'
    soup = BeautifulSoup(requests.get(url).content, 'html.parser')

    def get_output(item, cat, i):
        output = []
        assert len(item['class']) == 1
        color = item['class'][0]
        output.append(color[:color.index('-')])  ## party
        pieces = [x.strip() for x in item.text.split('-')]
        output.append(pieces[0])   ## state abbreviation
        split_ind = pieces[1].index(' ')
        output.append(pieces[1][:split_ind])   ## district num
        output.append(pieces[1][split_ind + 1:])   ## incumbent name
        output.append(cat)
        return output
    outputs = parse_cook(soup, HOUSE_CATEGORIES, 1, get_output)

    with open('cook_representatives.csv','w+') as my_csv:
        csvWriter = csv.writer(my_csv, delimiter=',')
        csvWriter.writerows(outputs)

if __name__ == '__main__':
    # scrape_senate()
    # scrape_house()
