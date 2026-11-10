import json,glob,os,re,sys
sys.path.insert(0,'/tmp/r15')
from check_reviews import docs, field
valid={}
for f in glob.glob('/home/ubuntu/linkfields/seed/data/pages/*.json'):
    d=json.load(open(f)); valid[d['path']]={s.get('anchorId') for s in d['sections'] if s.get('anchorId')}|{'get-in-touch'}
for p in list(valid):
    pass
PROTECT=["One strategic partner across","Let’s connect","Let's connect"]
rows=[]
for f in sorted(glob.glob('/tmp/r15/review/llm/*.json')):
    n=os.path.basename(f)[:-5]; r=json.load(open(f)); d=docs[n]
    for k,it in enumerate(r['issues']):
        flags=[]
        v=field(d,it['section_index'],it['field_path'])
        if not (v and it['current_text'] in v): flags.append('NOMATCH')
        cur,new=it['current_text'],it['proposed_text']
        if any(p in cur and p not in new for p in PROTECT): flags.append('PROTECTED')
        nums_new=set(re.findall(r'\d+(?:[.,]\d+)?%?',new))-set(re.findall(r'\d+(?:[.,]\d+)?%?',cur))
        if nums_new: flags.append('NEWNUM:'+','.join(sorted(nums_new))[:30])
        for href in re.findall(r'\]\((/[^)\s]*)\)',new):
            path,_,anc=href.partition('#'); path=path.rstrip('/') or '/'
            if path not in valid and not path.startswith('/company/blog/'): flags.append('BADPATH:'+href)
            elif anc and path in valid and anc not in valid[path]: flags.append('BADANCHOR:'+href)
        sec=(d.get('sections') or [])[it['section_index']] if it['section_index']<len(d.get('sections') or []) else {}
        rows.append(dict(id=f"{n}#{k}",page=n,path=d.get('path'),sec=it['section_index'],comp=sec.get('__component'),anchor=sec.get('anchorId'),**it,flags=flags))
json.dump(rows,open('/tmp/r15/review/triage.json','w'),indent=1,ensure_ascii=False)
def show(sel):
    for x in sel:
        print(f"\n[{x['id']}] {x['severity'][0].upper()} {x['category']} {x['path']} s{x['sec']}({x['comp']},#{x['anchor']}) {x['field_path']} {' '.join(x['flags'])}\n - {x['current_text'][:400]}\n + {x['proposed_text'][:400]}\n ? {x['rationale'][:240]}")
if __name__=='__main__':
    mode=sys.argv[1]
    sel=[x for x in rows if eval(mode)]
    print(len(sel),'items'); show(sel)
