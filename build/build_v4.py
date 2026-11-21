"""Version 4 data: Melbourne Subcortex Atlas (Tian 2020, scale III, 3T, MNI152NLin6Asym 1 mm) parcel per striatal mesh vertex,
and the left fornix centreline (HCP842 tractography mesh) for routing the subiculum -> accumbens edge.
Output: out/tian.json  {names: [...], meshes: {meshIndex: base64 uint8 labels (0 = none)}}  and prints fornix waypoints (MNI)."""
import json, base64, numpy as np, nibabel as nib, trimesh
from scipy import ndimage
man = json.load(open('/home/claude/out/manifest.json'))
buf = open('/home/claude/out/brain.bin', 'rb').read()
C = np.array(man['center_mni'])
def mesh_mni(m):
    v = np.frombuffer(buf, np.int16, m['nv'] * 3, m['vo']).reshape(-1, 3) * man['scale']      # three coords
    f = np.frombuffer(buf, np.uint16, m['nf'] * 3, m['fo']).reshape(-1, 3)
    mni = np.stack([-v[:, 0] + C[0], v[:, 2] + C[1], v[:, 1] + C[2]], 1)                    # three -> MNI
    return mni, f

T = '/tmp/subc/Group-Parcellation/3T/Subcortex-Only/'
img = nib.load(T + 'Tian_Subcortex_S3_3T_1mm.nii.gz')
lab = np.asarray(img.dataobj).astype(np.int16); A = img.affine; Ainv = np.linalg.inv(A)
names = [l.strip() for l in open(T + 'Tian_Subcortex_S3_3T_label.txt') if l.strip()]
print('volume', lab.shape, 'labels', lab.max(), len(names))
# nearest labelled voxel for every voxel (so vertices sitting just outside a parcel still get it)
dist, (ii, jj, kk) = ndimage.distance_transform_edt(lab == 0, return_indices=True)
near = lab[ii, jj, kk]
KEYS = {'Caudate_nucleus', 'Putamen', 'Nucleus_accumbens'}
STRIATAL = {i + 1 for i, n in enumerate(names) if n.split('-')[0] in ('CAU', 'PUT', 'NAc')}
out = {'names': names, 'meshes': {}}
for idx, m in enumerate(man['meshes']):
    if m['key'] not in KEYS: continue
    mni, f = mesh_mni(m)
    tm = trimesh.Trimesh(mni, f, process=False); nrm = tm.vertex_normals
    labels = np.zeros(len(mni), np.uint8)
    for d in (1.5, 0.5, 3.0):                                   # probe slightly inside the surface first
        p = mni - nrm * d
        ijk = np.rint((Ainv[:3, :3] @ p.T).T + Ainv[:3, 3]).astype(int)
        ijk = np.clip(ijk, 0, np.array(lab.shape) - 1)
        L = near[ijk[:, 0], ijk[:, 1], ijk[:, 2]]; D = dist[ijk[:, 0], ijk[:, 1], ijk[:, 2]]
        ok = (labels == 0) & (D <= 6) & np.isin(L, list(STRIATAL))
        labels[ok] = L[ok]
    hemi_ok = all(names[l - 1].endswith('-lh' if m['hemi'] == 'L' else '-rh') for l in set(labels.tolist()) if l)
    cover = (labels > 0).mean()
    counts = {names[l - 1]: int((labels == l).sum()) for l in sorted(set(labels.tolist())) if l}
    print(m['key'], m['hemi'], 'verts', len(labels), 'covered', round(float(cover), 3), 'hemi consistent', hemi_ok, counts)
    out['meshes'][str(idx)] = base64.b64encode(labels.tobytes()).decode()
json.dump(out, open('/home/claude/out/tian.json', 'w'))

# fornix centreline (left): order vertices along the arc in the sagittal plane, average in bins
fx = [m for m in man['meshes'] if m['key'] == 'Fornix' and m['hemi'] == 'L'][0]
mni, _ = mesh_mni(fx)
print('fornix L extent', mni.min(0).round(1), mni.max(0).round(1))
yc, zc = -14.0, 2.0
theta = np.degrees(np.arctan2(mni[:, 2] - zc, mni[:, 1] - yc))       # 0 = anterior, 90 = up, 180 = posterior
bins = np.linspace(theta.min(), theta.max(), 15)
pts = []
for a, b in zip(bins[:-1], bins[1:]):
    s = (theta >= a) & (theta < b)
    if s.sum() > 15: pts.append(mni[s].mean(0))
pts = np.array(pts)[::-1]                                             # posterior (hippocampal) end first
print('fornix waypoints (posterior -> anterior):'); print(json.dumps(np.round(pts, 1).tolist()))
