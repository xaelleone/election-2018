from bs4 import BeautifulSoup
import requests
import csv

def scrape_states(section, state_list):
    url = 'https://insideelections.com/ratings/' + section
    soup = BeautifulSoup(requests.get(url).text, 'html.parser')

    in_header = soup('h3', text='Toss-up')[0].next_sibling.next_sibling.findChildren

def scrape_section(header_name, state_list, soup):
    
