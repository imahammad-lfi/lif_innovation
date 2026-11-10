"""Word-level visible-content diff: original (crawled DOM in /home/ubuntu/lf-crawl/rendered) vs local dev server. Prints OK/DIFF per sitemap URL."""
import re,html,urllib.request,difflib,os
from urllib.parse import quote, unquote
NAV=set("Solutions Services Industries Company Careers Contact us Skip to content".split())
def clean(h):
    h=re.sub(r'<script.*?</script>|<style.*?</style>|<header.*?</header>|<footer.*?</footer>|<nav.*?</nav>','',h,flags=re.S)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',h))).strip()
FOOT_START='Membership ISO Certifications'
urls=[u.strip().replace('https://www.linkfields.com','') or '/' for u in open('/home/ubuntu/lf-crawl/urls.txt')]
for path in urls:
    path=html.unescape(unquote(path))
    key=path.strip('/').replace('/','__') or 'home'
    f=f'/home/ubuntu/lf-crawl/rendered/{key}.html'
    if not os.path.exists(f): print('NOFILE',path,key); continue
    o=clean(open(f).read())
    try: u=clean(urllib.request.urlopen('http://127.0.0.1:3000'+quote(path,safe='/&'),timeout=120).read().decode())
    except Exception as e: print('ERR',path,e); continue
    for s in (o,u): pass
    o=o.split(FOOT_START)[0]; u=u.split(FOOT_START)[0]
    a=[w for w in o.split(' ')]; b=[w for w in u.split(' ')]
    sm=difflib.SequenceMatcher(None,a,b,autojunk=False)
    diffs=[]
    for op,i1,i2,j1,j2 in sm.get_opcodes():
        if op=='equal': continue
        A=' '.join(a[i1:i2]); B=' '.join(b[j1:j2])
        if set(A.split())<=NAV and set(B.split())<=NAV: continue
        diffs.append(f'{op}| ORIG: {A[:150]} | OURS: {B[:150]}')
    print(('OK  ' if not diffs else 'DIFF'), path, len(a), len(b), round(sm.ratio(),3))
    for d in diffs[:6]: print('     ',d)
