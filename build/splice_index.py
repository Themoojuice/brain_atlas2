"""Rebuild index.html without the large data files: swap the page's copies of the content, engine and story files
for the current ones in build/. The old copies are read from git at REF (default HEAD), so run this before committing.
Usage (from the repo root): python3 build/splice_index.py [REF] [OUT]
assemble_v3.py stays the full rebuild when out/ (meshes, volumes, PET maps) is available."""
import subprocess, sys
REF = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'index.html'
page = open('index.html').read()
old = lambda f: subprocess.run(['git', 'show', f'{REF}:build/{f}'], capture_output=True, text=True, check=True).stdout
def old_or_none(f):
    try: return old(f)
    except subprocess.CalledProcessError: return None
for f in ['content.js', 'content_drugs.js', 'content_story.js', 'story_engine.js', 'story.css', 'story.html']:
    o, n = old(f), open(f'build/{f}').read()
    assert page.count(o) == 1, f'{f}: the page does not hold exactly one copy of {REF}:build/{f}'
    page = page.replace(o, n)
# version 5: the affective v2 story sits right after content_story.js
aff2_old, aff2 = old_or_none('content_story_aff2.js'), open('build/content_story_aff2.js').read()
if aff2_old and page.count(aff2_old) == 1: page = page.replace(aff2_old, aff2)
else:
    cs = open('build/content_story.js').read(); assert page.count(cs) == 1
    page = page.replace(cs, cs + '\n' + aff2)
open(OUT, 'w').write(page)
print(OUT, round(len(page) / 1e6, 2), 'MB')
