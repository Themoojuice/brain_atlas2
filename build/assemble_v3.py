import base64, json, os
s = open('/home/claude/template_v3.html').read()
man = json.load(open('/home/claude/out/manifest.json')); man['pet'] = json.load(open('/home/claude/out/pet.json'))
man['tian'] = json.load(open('/home/claude/out/tian.json'))
rep = {
  '__MANIFEST__': json.dumps(man, separators=(',', ':')).replace('</', '<\\/'),
  '__CONTENT__': '\n'.join(open('/home/claude/' + f).read() for f in ['content.js', 'content_drugs.js', 'content_story.js', 'content_story_aff2.js', 'content_series.js', 'content_p1.js', 'content_p2.js', 'content_p3.js', 'content_p4.js', 'content_p6.js', 'content_p7.js', 'content_p8.js', 'content_series_order.js'] if os.path.exists('/home/claude/' + f)),
  '__STORY_ENGINE__': open('/home/claude/story_engine.js').read(),
  '__STORY_CSS__': open('/home/claude/story.css').read(),
  '__STORY_HTML__': open('/home/claude/story.html').read(),
  '__DATA__': base64.b64encode(open('/home/claude/out/brain.bin', 'rb').read()).decode(),
  '__VOL__': base64.b64encode(open('/home/claude/out/vol.bin.gz', 'rb').read()).decode(),
  '__PET__': base64.b64encode(open('/home/claude/out/pet.bin.gz', 'rb').read()).decode(),
}
for k, v in rep.items():
    assert s.count(k) == 1, k
    s = s.replace(k, v)
open('/home/claude/brain-network-atlas.html', 'w').write(s)
print(round(len(s) / 1e6, 2), 'MB')
