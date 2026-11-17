import base64, json
s = open('/home/claude/template_v2.html').read()
man = json.load(open('/home/claude/out/manifest.json')); man['pet'] = json.load(open('/home/claude/out/pet.json'))
rep = {
  '__MANIFEST__': json.dumps(man, separators=(',', ':')).replace('</', '<\\/'),
  '__CONTENT__': open('/home/claude/content.js').read() + '\n' + open('/home/claude/content_drugs.js').read(),
  '__DATA__': base64.b64encode(open('/home/claude/out/brain.bin', 'rb').read()).decode(),
  '__VOL__': base64.b64encode(open('/home/claude/out/vol.bin.gz', 'rb').read()).decode(),
  '__PET__': base64.b64encode(open('/home/claude/out/pet.bin.gz', 'rb').read()).decode(),
}
for k, v in rep.items():
    assert s.count(k) == 1, k
    s = s.replace(k, v)
open('/home/claude/brain-network-atlas.html', 'w').write(s)
print(round(len(s) / 1e6, 2), 'MB')
