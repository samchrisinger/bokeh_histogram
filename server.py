from flask import Flask, request, jsonify, redirect, url_for
from pyelasticsearch import ElasticSearch
import json
import os
from requests import get as G

app = Flask(__name__, static_url_path='')
app.debug = True

es = ElasticSearch('http://localhost:9200')

from werkzeug.contrib.cache import SimpleCache
data_cache = SimpleCache()

schema_cache = None
map_cache = None

def get_data(page):
    global es
    global data_cache
    if(data_cache.get(page)):
        return data_cache.get(page)
    else:
        schema = get_schema()
        schema = {k:v for k,v in schema.iteritems() if v['type'] == 'date'}
        keys = schema.keys()
        aggs = {}
        for key in keys:
            aggs[key+'_hist'] = {
                'date_histogram': {
                    'field': key,
                    'interval': 'month'
                }
            }

        query = {"aggs": aggs}
        res = es.search(query, index='test')
        aggs = res['aggregations']
        data = ','.join(['date']+keys)+'\n'
        cells = {}
        for key in keys:
            buckets = aggs[key+'_hist']['buckets']
            for buck in buckets:
                if not cells.get(buck['key']):
                    cells[buck['key']] = {}
                cells[buck['key']][key] = buck['doc_count'] 
        for row in cells:
            items = cells[row]
            r = []
            for key in keys:
                r.append(items.get(key) or 0)
            r = [str(row)]+[str(i) for i in r]

            data += ','.join(r)+'\n'

        return data

def get_map():
    global es
    global map_cache
    if map_cache:
        return map_cache
    else:
        query = {
            "query": {
                "match_all": {}
            },
            "size": 1
        }
        res = es.search(query, index='test')
        mp = res['hits']['hits'][0]['_source']['map']        
        map_cache = mp
        return mp

def get_schema():
    global es
    global schema_cache
    if schema_cache:
        return schema_cache
    schema = {}
    res = G('http://localhost:9200/test/_mapping').json()
    schema = res['test']['mappings']['sample']['properties']
    return schema

@app.route('/')
def root():
    return redirect(url_for('static', filename='app.html'))

@app.route('/times')
def times():
    global es    
    page = request.args.get('slice') or '0:100000'
    return get_data(page)        
    
@app.route('/search')
def search():
    global es
    args = request.args
    query = None
    if args.get('query'):
        query = json.loads(args.get('query'))
        query['size'] = 100
    else:
        query = {
            "query": {
                "match_all": {}
            },
            "size": 100
        }
    res = es.search(query, index="test")
    hits = [h['_source'] for h in res['hits']['hits']]

    if args.get('query'):        
        for hit in hits:
            del hit['map']
        return jsonify({
            'size': res['hits']['total'],
            'data': hits
        })

    schema = get_schema()
        
    for hit in hits:
        del hit['map']
    return jsonify({
        'size': res['hits']['total'],
        'data': hits,
        'schema': schema
    })

@app.route('/schema')
def schema():
    schema = get_schema()
    schema = {k:v for k, v in schema.iteritems() if v['type'] == 'date'}
    gtime = {'max': 19500101, 'min': 20140701}
    schema['__global'] = gtime
    return json.dumps(schema)
    
        
@app.route('/js/<path:path>')
def static_proxy(path):
    return app.send_static_file(os.path.join('js', path))

if __name__ == '__main__':
    app.run()
