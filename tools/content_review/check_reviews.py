import json,glob,os,sys
sys.path.insert(0,'/home/ubuntu/linkfields/tools')
from content_audit import flatten
sys.path.insert(0,'/tmp/r15')
from llm_review import items
docs=dict(items())
def field(d, idx, path):
    secs=d.get('sections') or []
    if idx>=len(secs): return None
    for p,t in flatten(secs[idx]):
        if p==path: return t
    return None
def run(names=None, show=True):
    tot=ok=0
    for f in sorted(glob.glob('/tmp/r15/review/llm/*.json')):
        n=os.path.basename(f)[:-5]
        if names and n not in names: continue
        r=json.load(open(f)); d=docs[n]
        if show: print(f"\n##### {n}  score={r['overall_score']}  purpose={r['page_purpose'][:120]}")
        for it in r['issues']:
            tot+=1
            v=field(d,it['section_index'],it['field_path'])
            m = v is not None and it['current_text'] in v
            ok+=m
            if show: print(f" [{it['severity'][0].upper()}|{it['category']}|{'OK' if m else 'NOMATCH'}] s{it['section_index']} {it['field_path']}\n    - {it['current_text'][:220]}\n    + {it['proposed_text'][:220]}\n    why: {it['rationale'][:200]}")
        if show:
            s=r['seo']; print(f" SEO: {s['meta_title']} ({len(s['meta_title'])}) | {s['meta_description']} ({len(s['meta_description'])}) | kw={s['primary_keyword']} | {s['secondary_keywords'][:5]}")
            for mc in r['missing_content']: print(f" MISSING after s{mc['after_section_index']}: {mc['suggestion'][:220]}")
    print(f"\nverbatim match: {ok}/{tot}")
if __name__=='__main__':
    run(set(sys.argv[1].split(',')) if len(sys.argv)>1 else None)
