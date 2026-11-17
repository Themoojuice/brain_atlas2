"""Receptor PET maps (Hansen 2022 collection) -> one 3 mm RAS grid in MNI152NLin6, normalised 0-255 within the brain.
2009c-grid maps (193x229x193) are moved with the neuroparc 2009c->NLin6 transform; FSL/SPM-grid maps are used as is."""
import json, gzip, os, tempfile, numpy as np, nibabel as nib, SimpleITK as sitk
D = '/home/claude/data/hansen_receptors/data/PET_nifti_images/'
NP = '/home/claude/data/neuroparc/atlases/'
man = json.load(open('/home/claude/out/manifest.json'))
XFM = sitk.ReadTransform(NP + 'transforms/MNI152NLin2009cAsym_2_MNI152NLin6.h5')
MAPS = [  # id, file
 ('D1', 'D1_SCH23390_hc13_kaller.nii'), ('D2', 'D2_fallypride_hc49_jaworska.nii'), ('DAT', 'DAT_fpcit_hc174_dukart_spect.nii'), ('FDOPA', 'FDOPA_fluorodopa_hc12_gomez.nii'),
 ('5HT1A', '5HT1a_way_hc36_savli.nii'), ('5HT1B', '5HT1b_p943_hc65_gallezot.nii.gz'), ('5HT2A', '5HT2a_cimbi_hc29_beliveau.nii'), ('5HT4', '5HT4_sb20_hc59_beliveau.nii'),
 ('5HT6', '5HT6_gsk_hc30_radhakrishnan.nii.gz'), ('SERT', '5HTT_dasb_hc100_beliveau.nii'), ('NET', 'NAT_MRB_hc77_ding.nii.gz'),
 ('A4B2', 'A4B2_flubatine_hc30_hillmer.nii.gz'), ('M1', 'M1_lsn_hc24_naganawa.nii.gz'), ('VAChT', 'VAChT_feobv_hc18_aghourian_sum.nii'),
 ('NMDA', 'NMDA_ge179_hc29_galovic.nii.gz'), ('mGluR5', 'mGluR5_abp_hc73_smart.nii'), ('GABAA', 'GABAa-bz_flumazenil_hc16_norgaard.nii'),
 ('H3', 'H3_cban_hc8_gallezot.nii.gz'), ('CB1', 'CB1_omar_hc77_normandin.nii.gz'), ('MOR', 'MU_carfentanil_hc204_kantonen.nii')]
v = man['vol']; o = np.array(v['origin']); ext = (np.array(v['dims']) - 1) * np.array(v['step'])
S = 3.0; dims = (np.floor(ext / S) + 1).astype(int); nx, ny, nz = map(int, dims)
ref = sitk.Image(nx, ny, nz, sitk.sitkFloat32); ref.SetSpacing((S, S, S))
ref.SetDirection((-1, 0, 0, 0, -1, 0, 0, 0, 1)); ref.SetOrigin((-o[0], -o[1], o[2]))     # index grows with MNI x, y, z
tmp = tempfile.mkdtemp()
def load(fn):
    im = nib.load(fn); a = np.nan_to_num(np.asarray(im.dataobj, dtype=np.float32).squeeze())
    p = f'{tmp}/x.nii.gz'; nib.save(nib.Nifti1Image(a, im.affine), p); return sitk.ReadImage(p), a.shape
t1 = sitk.GetArrayFromImage(sitk.Resample(sitk.ReadImage(NP + 'reference_brains/MNI152NLin6_res-1x1x1_T1w_descr-brain.nii.gz'), ref, sitk.Transform(), sitk.sitkLinear, 0))
mask = t1 > 0.15 * np.percentile(t1[t1 > 0], 95)
out, meta = [], []
for rid, f in MAPS:
    img, shp = load(D + f)
    T = XFM if shp[:3] == (193, 229, 193) else sitk.Transform()
    a = sitk.GetArrayFromImage(sitk.Resample(img, ref, T, sitk.sitkLinear, 0)).astype(np.float32)   # (nz, ny, nx)
    vals = a[mask]; lo, hi = np.percentile(vals, 1), np.percentile(vals, 99.5)
    n = np.clip((a - lo) / (hi - lo), 0, 1); n[~mask] = 0
    out.append((n * 255).round().astype(np.uint8).tobytes())
    meta.append(rid); print(rid, f, 'warped' if T is XFM else 'as is', round(float(lo), 3), round(float(hi), 3))
blob = b''.join(out); gz = gzip.compress(blob, 9)
open('/home/claude/out/pet.bin.gz', 'wb').write(gz)
json.dump({'dims': [nx, ny, nz], 'origin': o.round(3).tolist(), 'step': [S, S, S], 'maps': meta}, open('/home/claude/out/pet.json', 'w'))
print('grid', (nx, ny, nz), 'raw', len(blob), 'gz', len(gz))
