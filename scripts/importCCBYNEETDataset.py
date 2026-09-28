import json, re, urllib.request
from pathlib import Path
import pandas as pd

ROOT=Path(__file__).resolve().parents[1]
URL="https://huggingface.co/datasets/datavorous/entrance-exam-dataset/resolve/main/search_NEET.parquet"
OUT=ROOT/"data/licensedQuestions.json"
chapters=json.loads((ROOT/"data/chapters.json").read_text())["chapters"]

STOP={"and","the","of","in","to","a","an","for","with","from","on","by","is","are","was","were","which","what","how","does","doesn","this","that"}

def toks(s):
    return [x for x in re.sub(r"[^a-z0-9]+"," ",str(s).lower()).split() if len(x)>2 and x not in STOP]

def chapter_map(row):
    hay=str(row.get("question",""))+" "+str(row.get("title",""))+" "+str(row.get("tags",""))
    subject=str(row.get("subject","")).lower()
    if subject:
        pool=[c for c in chapters if c["subject"].lower()==subject]
    else:
        pool=chapters
    ht=set(toks(hay))
    best=None; score=0
    for c in pool:
        terms=toks(c["ncertChapter"]) + sum((toks(x) for x in c.get("topics",[])),[])
        s=sum(2 if len(t)>=7 else 1 for t in terms if t in ht)
        if s>score:
            score=s; best=c
    return best["id"] if best and score>=2 else None

def clean_html(s):
    s=re.sub(r"<[^>]+>"," ",str(s))
    return re.sub(r"\s+"," ",s).strip()

print("Downloading reusable CC BY 4.0 NEET dataset...")
df=pd.read_parquet(URL)
rows=[]
seen=set()
for _,r in df.iterrows():
    prompt=clean_html(r.get("question",""))
    if not prompt or len(prompt)<15: continue
    raw=str(r.get("options",""))
    # The dataset stores each answer choice in <span class="option-data">.
    # Extract those spans directly instead of relying on the surrounding <li>.
    opts=[]
    for m in re.finditer(r'<span\\s+class=["\\\']option-data["\\\'][^>]*>(.*?)</span>', raw, flags=re.I|re.S):
        value=clean_html(m.group(1))
        if value: opts.append(value)
    if len(opts)!=4:
        # Some rows contain nested markup; strip tags after locating option-data.
        chunks=re.findall(r'option-data["\\\'][^>]*>(.*?)</span>', raw, flags=re.I|re.S)
        opts=[clean_html(x) for x in chunks if clean_html(x)]
    if len(opts)!=4: continue
    if len(opts)!=4: continue
    answer_text=clean_html(r.get("answer",""))
    correct=clean_html(r.get("correct_option",""))
    idx=-1
    if correct.upper() in "ABCD": idx="ABCD".index(correct.upper())
    if idx<0:
        for i,o in enumerate(opts):
            if answer_text and answer_text.strip()==o.strip(): idx=i
    if idx<0: continue
    cid=chapter_map(r)
    if not cid: continue
    key=re.sub(r"\W+"," ",prompt.lower()).strip()
    if key in seen: continue
    seen.add(key)
    tags=str(r.get("tags",""))
    title=str(r.get("title",""))
    source_db=str(r.get("source_db",""))
    is_ar=("assertion" in title.lower() or "reason" in title.lower() or "assertion" in tags.lower())
    mode="ar" if is_ar else "mcq"
    # The dataset is an exam-question collection; preserve its provenance rather than calling every row an NTA PYQ.
    rows.append({
      "id":f"ccby-neet-{int(r.get('id',len(rows)+1))}",
      "chapterId":cid,"series":mode,"mode":mode,"prompt":prompt,
      "options":opts,"answer":idx,"difficulty":"medium","explanation":clean_html(r.get("answer","")),
      "reviewStatus":"draft","sourceType":"original_neet_style",
      "citation":{"reference":"https://huggingface.co/datasets/datavorous/entrance-exam-dataset","chapter":title},
      "sourceLicense":"CC BY 4.0","sourceId":"datavorous-entrance-exam-neet","sourceQuestionId":str(r.get("id","")),
      "sourceDb":source_db,"sourceTags":tags
    })

# Keep the bank practical: fill each chapter up to its configured target from reusable material.
by={}
for q in rows: by.setdefault(q["chapterId"],[]).append(q)
selected=[]
for c in chapters:
    pool=by.get(c["id"],[])
    selected.extend(pool[:c["questionTarget"]])

payload={"version":"2.1","source":{"id":"datavorous-entrance-exam-neet","name":"Entrance Exam Dataset — NEET split","url":"https://huggingface.co/datasets/datavorous/entrance-exam-dataset","license":"CC BY 4.0","attribution":"datavorous / KingNish"},"questions":selected}
OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n")
print(f"Rows parsed: {len(rows)}; selected: {len(selected)}; chapters with questions: {sum(bool(by.get(c['id'])) for c in chapters)}/{len(chapters)}")
