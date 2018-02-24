import pandas as pd
import json

df = pd.read_csv('external_data/zccd.csv')

df['zcta'] = df.apply(lambda row: '0' * (5 - len(str(row['zcta']))) + str(row['zcta']), axis=1)

df = df.set_index('zcta').drop('state_fips', axis=1)

jsonified = df.groupby(level=0).apply(lambda x: x.to_json(orient='records'))
recombined = dict(map(lambda x: (x[0], json.loads(x[1])), jsonified.to_dict().items()))
with open('zccd.json', 'w') as fout:
    fout.write(json.dumps(recombined, indent=2))
