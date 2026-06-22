import os, json, urllib.request
base=os.path.dirname(__file__)
os.makedirs(os.path.join(base,"icons"),exist_ok=True)
with open(os.path.join(base,"icon_manifest.json"),encoding="utf-8") as f: data=json.load(f)
for x in data:
    path=os.path.join(base,x["local_path"])
    print("download",x["url"],"->",path)
    req=urllib.request.Request(x["url"],headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req,timeout=20) as r, open(path,"wb") as out: out.write(r.read())
print("done")
