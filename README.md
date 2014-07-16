Steps to run this:

1) have Elasticsearch install and running on :9200
2) install the requirements.txt
3) run `python scripts/doc.py` (this creates 100,000 documents in elasticsearch, use with discretion; you can drop the index and created entries with `curl -XDELETE http://localhost:9200/test`)
4) run `python server.py`
5) run `ipython notebook`
6) open the notebook, and run the cell
