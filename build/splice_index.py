"""Rebuild index.html without the large data files: swap the page's copies of the content, engine and story files
for the current ones in build/. The old copies are read from git at REF (default HEAD), so run this before committing.
Usage (from the repo root): python3 build/splice_index.py [REF] [OUT]
assemble_v3.py stays the full rebuild when out/ (meshes, volumes, PET maps) is available.

Story content after content_story.js is a chain of files (EXTRA, in load order). Each is swapped in place if the page
holds REF's copy, or inserted after the previous file in the chain if it is new."""
import os, subprocess, sys
REF = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'index.html'
EXTRA = ['content_story_aff2.js', 'content_series.js', 'content_p1.js', 'content_p2.js', 'content_p3.js', 'content_p4.js',
         'content_p6.js', 'content_p7.js', 'content_p8.js', 'content_series_order.js', 'content_jobs.js']
page = open('index.html').read()
old = lambda f: subprocess.run(['git', 'show', f'{REF}:build/{f}'], capture_output=True, text=True, check=True).stdout
def old_or_none(f):
    try: return old(f)
    except subprocess.CalledProcessError: return None
for f in ['content.js', 'content_drugs.js', 'content_story.js', 'story_engine.js', 'story.css', 'story.html']:
    o, n = old(f), open(f'build/{f}').read()
    assert page.count(o) == 1, f'{f}: the page does not hold exactly one copy of {REF}:build/{f}'
    page = page.replace(o, n)
prev = open('build/content_story.js').read()
assert page.count(prev) == 1
for f in EXTRA:
    o = old_or_none(f)
    n = open(f'build/{f}').read() if os.path.exists(f'build/{f}') else None
    if o is not None and page.count(o) == 1:
        page = page.replace(o, n or '')          # swap (or drop, if the file was deleted)
    elif n is not None:
        assert page.count(prev) == 1, f'{f}: cannot find the file it follows'
        page = page.replace(prev, prev + '\n' + n)
    if n: prev = n
open(OUT, 'w').write(page)
print(OUT, round(len(page) / 1e6, 2), 'MB')
