"""Brain Network Atlas, version 1 data build.
Everything ends up in MNI152NLin6 (FSL 1 mm) space. Atlases in MNI152 2009 space are moved with the
neuroparc ANTs transform MNI152NLin2009cAsym_2_MNI152NLin6.h5 (checked against Hammers putamen: Dice 0.83 -> 0.88).
Outputs: out/brain.bin (meshes), out/vol.bin.gz (T1 + two label volumes at 1.5 mm), out/manifest.json"""
import json, gzip, os, sys, tempfile
import numpy as np, nibabel as nib, SimpleITK as sitk, trimesh, fast_simplification
from scipy import ndimage
from skimage import measure

NP = '/home/claude/data/neuroparc/atlases/'
P = NP + 'label/Human/'
DS = '/home/claude/data/leaddbs/ext_libs/dsi_studio/atlas/human/'
OUT = '/home/claude/out'; os.makedirs(OUT, exist_ok=True)
log = lambda *a: print(*a, file=sys.stderr)

ham = nib.load(P + 'Hammersmith_space-MNI152NLin6_res-1x1x1.nii.gz')
H = np.asarray(ham.dataobj).astype(np.int16); A = ham.affine; Ainv = np.linalg.inv(A)
SHAPE = H.shape
hlabels = json.load(open(P + 'Metadata-json/Hammersmith_space-MNI152NLin6_res-1x1x1.json'))['rois']
Y = np.asarray(nib.load(P + 'Yeo-7-liberal_space-MNI152NLin6_res-1x1x1.nii.gz').dataobj).astype(np.int16)
dist, (ii, jj, kk) = ndimage.distance_transform_edt(Y == 0, return_indices=True)
NEAR = Y[ii, jj, kk]; NEAR[dist > 5] = 0

REF = sitk.ReadImage(P + 'Hammersmith_space-MNI152NLin6_res-1x1x1.nii.gz')
XFM = sitk.ReadTransform(NP + 'transforms/MNI152NLin2009cAsym_2_MNI152NLin6.h5')

def resample(img):
    """2009-space label image -> NLin6 grid, as a numpy array indexed like nibabel (i, j, k)."""
    r = sitk.Resample(img, REF, XFM, sitk.sitkNearestNeighbor, 0)
    return sitk.GetArrayFromImage(r).transpose(2, 1, 0)

def xfm_points(ras):
    lps = ras * np.array([-1, -1, 1])
    out = np.array([XFM.TransformPoint(tuple(map(float, p))) for p in lps])
    return out * np.array([-1, -1, 1])

def vox2mni(ijk): return (A[:3, :3] @ np.asarray(ijk, float).T).T + A[:3, 3]
def mni2vox(xyz): return np.rint((Ainv[:3, :3] @ np.asarray(xyz, float).T).T + Ainv[:3, 3]).astype(int)

def finish(tm, target_scale=0.55, lo=400, hi=9000, smooth=12):
    if smooth: trimesh.smoothing.filter_taubin(tm, lamb=0.5, nu=-0.53, iterations=smooth)
    target = int(np.clip(tm.area * target_scale, lo, hi))
    if len(tm.faces) > target:
        p, f = fast_simplification.simplify(tm.vertices.astype(np.float32), tm.faces.astype(np.int32), target_reduction=1 - target / len(tm.faces), agg=6)
        tm = trimesh.Trimesh(p, f, process=True)
    tm.fix_normals()
    return tm

def mesh_from_mask(mask, sigma=None, **kw):
    nvox = int(mask.sum())
    sl = ndimage.find_objects(mask.astype(np.int8))[0]
    lo = [max(s.start - 4, 0) for s in sl]; hi = [min(s.stop + 4, SHAPE[i]) for i, s in enumerate(sl)]
    sub = mask[lo[0]:hi[0], lo[1]:hi[1], lo[2]:hi[2]].astype(np.float32)
    if sigma is None: sigma = 1.1 if nvox > 4000 else (0.85 if nvox > 1000 else 0.65)
    v, f, _, _ = measure.marching_cubes(ndimage.gaussian_filter(sub, sigma), 0.45)
    tm = trimesh.Trimesh(vox2mni(v + np.array(lo)), f[:, ::-1], process=True)
    # keep the largest connected piece plus any piece over 15% of it (drops atlas speckle)
    parts = tm.split(only_watertight=False)
    if len(parts) > 1:
        parts = sorted(parts, key=lambda m: -len(m.faces)); big = len(parts[0].faces)
        tm = trimesh.util.concatenate([p for p in parts if len(p.faces) > 0.15 * big])
    return finish(tm, **kw)

def mask_from_mesh(tm):
    vg = tm.voxelized(pitch=0.7).fill()
    idx = mni2vox(vg.points); idx = idx[(idx >= 0).all(1) & (idx < np.array(SHAPE)).all(1)]
    m = np.zeros(SHAPE, bool); m[tuple(idx.T)] = True
    return m

def hemi_of(xyz_mean): return 'L' if xyz_mean[0] < 0 else 'R'

# ---------------------------------------------------------------- catalogue
S = {}   # key -> dict(name, group, aliases, color, src)
def add(key, name, group, aliases, color, src):
    S[key] = dict(key=key, name=name, group=group, aliases=aliases, color=color, src=src)

HAM = 'Hammers 83-region atlas'
for key, name, group, al, col in [
 ('Superior_frontal_gyrus', 'Superior frontal gyrus', 'Frontal lobe', 'SFG dorsomedial prefrontal supplementary motor SMA', '#e8846b'),
 ('Middle_frontal_gyrus', 'Middle frontal gyrus', 'Frontal lobe', 'MFG dorsolateral prefrontal DLPFC', '#f2a07b'),
 ('Inferior_frontal_gyrus', 'Inferior frontal gyrus', 'Frontal lobe', 'IFG Broca ventrolateral prefrontal VLPFC', '#d96c5f'),
 ('Precentral_gyrus', 'Precentral gyrus', 'Frontal lobe', 'primary motor cortex M1', '#f5b98f'),
 ('Straight_gyrus', 'Gyrus rectus', 'Orbitofrontal cortex', 'straight gyrus ventromedial prefrontal vmPFC OFC', '#b9773e'),
 ('Medial_orbital_gyrus', 'Medial orbital gyrus', 'Orbitofrontal cortex', 'OFC orbitofrontal vmPFC', '#c98a4b'),
 ('Anterior_orbital_gyrus', 'Anterior orbital gyrus', 'Orbitofrontal cortex', 'OFC orbitofrontal', '#a8692f'),
 ('Lateral_orbital_gyrus', 'Lateral orbital gyrus', 'Orbitofrontal cortex', 'OFC orbitofrontal', '#d69a5c'),
 ('Posterior_orbital_gyrus', 'Posterior orbital gyrus', 'Orbitofrontal cortex', 'OFC orbitofrontal', '#9a5e2a'),
 ('Cingulate_gyrus_anterior_part', 'Anterior cingulate gyrus', 'Cingulate & medial prefrontal', 'ACC dACC dorsal anterior cingulate', '#e0699c'),
 ('Cingulate_gyrus_posterior_part', 'Posterior cingulate gyrus', 'Cingulate & medial prefrontal', 'PCC posterior cingulate', '#c95b8c'),
 ('Pre-subgenual_frontal_cortex', 'Pre-subgenual frontal cortex', 'Cingulate & medial prefrontal', 'pregenual cingulate pgACC medial prefrontal mPFC', '#ef8fb7'),
 ('Subgenual_frontal_cortex', 'Subgenual frontal cortex', 'Cingulate & medial prefrontal', 'subgenual cingulate sgACC Cg25 Brodmann 25', '#ff6fa8'),
 ('Subcallosal_area', 'Subcallosal area', 'Cingulate & medial prefrontal', 'subcallosal cingulate septal', '#f7a6c8'),
 ('Insula', 'Insula', 'Insula', 'insular cortex anterior insula interoception', '#4fc4b5'),
 ('Postcentral_gyrus', 'Postcentral gyrus', 'Parietal lobe', 'primary somatosensory cortex S1', '#8cc6f0'),
 ('Superior_parietal_gyrus', 'Superior parietal lobule', 'Parietal lobe', 'superior parietal gyrus SPL precuneus', '#6aaee6'),
 ('Inferiolateral_remainder_parietal_lobe', 'Inferolateral parietal lobe', 'Parietal lobe', 'inferior parietal lobule IPL supramarginal angular gyrus TPJ temporoparietal junction', '#5a96d6'),
 ('Superior_temporal_gyrus_anterior_part', 'Superior temporal gyrus, anterior', 'Temporal lobe', 'STG', '#9fd98a'),
 ('Superior_temporal_gyrus_posterior_part', 'Superior temporal gyrus, posterior', 'Temporal lobe', 'STG Wernicke auditory', '#7fc96f'),
 ('Middle_and_inferior_temporal_gyrus', 'Middle & inferior temporal gyri', 'Temporal lobe', 'MTG ITG', '#6db562'),
 ('Anterior_temporal_lobe_lateral_part', 'Anterior temporal lobe, lateral', 'Temporal lobe', 'temporal pole', '#b5e39c'),
 ('Anterior_temporal_lobe_medial_part', 'Anterior temporal lobe, medial', 'Temporal lobe', 'temporal pole', '#a3d48d'),
 ('Posterior_temporal_lobe', 'Posterior temporal lobe', 'Temporal lobe', '', '#5ea457'),
 ('Fusiform_gyrus', 'Fusiform gyrus', 'Temporal lobe', 'fusiform face area FFA occipitotemporal', '#8fc77a'),
 ('Hippocampus', 'Hippocampus', 'Medial temporal lobe', 'hippocampal formation memory', '#ffd34d'),
 ('Amygdala', 'Amygdala', 'Medial temporal lobe', 'amygdaloid fear threat', '#ff8a3d'),
 ('Parahippocampal_and_ambient_gyri', 'Parahippocampal & ambient gyri', 'Medial temporal lobe', 'parahippocampal gyrus entorhinal', '#e6c36a'),
 ('Lateral_remainder_occipital_lobe', 'Lateral occipital cortex', 'Occipital lobe', 'lateral occipital visual', '#a98be0'),
 ('Lingual_gyrus', 'Lingual gyrus', 'Occipital lobe', 'visual cortex calcarine', '#9479d4'),
 ('Cuneus', 'Cuneus', 'Occipital lobe', 'visual cortex calcarine V1', '#bba2ec'),
 ('Caudate_nucleus', 'Caudate nucleus', 'Basal ganglia', 'striatum dorsal striatum', '#43c6e8'),
 ('Putamen', 'Putamen', 'Basal ganglia', 'striatum dorsal striatum lentiform', '#3f8fe0'),
 ('Pallidum', 'Globus pallidus', 'Basal ganglia', 'pallidum GPe GPi lentiform', '#9ad7ff'),
 ('Nucleus_accumbens', 'Nucleus accumbens', 'Basal ganglia', 'ventral striatum NAc reward mesolimbic', '#9be15d'),
 ('Substantia_nigra', 'Substantia nigra', 'Basal ganglia', 'SN dopamine nigrostriatal midbrain', '#3b3550'),
 ('Thalamus', 'Thalamus', 'Diencephalon', 'thalamic', '#b9a5f0'),
 ('Brainstem', 'Brainstem', 'Brainstem & cerebellum', 'midbrain pons medulla', '#d6b48c'),
 ('Cerebellum', 'Cerebellum', 'Brainstem & cerebellum', 'cerebellar', '#e3b0a2'),
 ('Corpus_callosum', 'Corpus callosum', 'White matter & ventricles', 'commissure white matter', '#f2efe6'),
 ('Lateral_ventricle_no_temporal_horn', 'Lateral ventricle', 'White matter & ventricles', 'CSF ventricle frontal horn body occipital horn', '#5fb3ff'),
 ('Lateral_ventricle_temporal_horn', 'Lateral ventricle, temporal horn', 'White matter & ventricles', 'CSF ventricle inferior horn', '#5fb3ff'),
 ('Third_ventricle', 'Third ventricle', 'White matter & ventricles', 'CSF ventricle', '#5fb3ff'),
]:
    add(key, name, group, al, col, HAM)

CIT = 'CIT168 subcortical atlas (Pauli 2018)'
add('Subthalamic_nucleus', 'Subthalamic nucleus', 'Basal ganglia', 'STN deep brain stimulation DBS indirect pathway', '#ffb347', CIT)
add('Ventral_pallidum', 'Ventral pallidum', 'Basal ganglia', 'VP hedonic reward', '#7fe0d0', CIT)
add('Hypothalamus', 'Hypothalamus', 'Diencephalon', 'HPA axis hypothalamic arcuate tuberoinfundibular', '#ff8fab', CIT)
add('Habenula', 'Habenula', 'Diencephalon', 'habenular nucleus lateral habenula epithalamus anti-reward', '#7af0ff', CIT)
add('Mammillary_body', 'Mammillary body', 'Diencephalon', 'mammillary nucleus Papez Korsakoff', '#ffe08a', CIT)
add('Red_nucleus', 'Red nucleus', 'Brainstem nuclei', 'rubral midbrain', '#ff5a5f', CIT)
add('VTA', 'Ventral tegmental area', 'Brainstem nuclei', 'VTA dopamine mesolimbic mesocortical parabrachial pigmented', '#ff4fd8', CIT)
JUL = 'Julich-Brain 3 cytoarchitectonic atlas'
add('Bed_nucleus_stria_terminalis', 'Bed nucleus of the stria terminalis', 'Basal forebrain', 'BNST BST extended amygdala anxiety', '#ff7a7a', JUL)
add('Nucleus_basalis', 'Nucleus basalis of Meynert', 'Basal forebrain', 'Ch4 cholinergic acetylcholine basal forebrain', '#e58fff', JUL)
add('Septal_diagonal_band', 'Medial septum & diagonal band', 'Basal forebrain', 'Ch1 Ch2 Ch3 septal nuclei cholinergic', '#f7c5ff', JUL)
THO = 'THOMAS thalamic nuclei atlas (Su 2019)'
for key, name, al, col in [
 ('Thal_AN', 'Anterior nucleus', 'anteroventral AV anterior thalamus Papez', '#ffc6ff'),
 ('Thal_MD', 'Mediodorsal nucleus', 'MD dorsomedial thalamus', '#b388ff'),
 ('Thal_Pul', 'Pulvinar', 'pulvinar thalamus attention', '#8c9eff'),
 ('Thal_CM', 'Centromedian nucleus', 'CM intralaminar thalamus', '#ea80fc'),
 ('Thal_VA', 'Ventral anterior nucleus', 'VA motor thalamus', '#82b1ff'),
 ('Thal_VL', 'Ventral lateral nucleus', 'VL VLa VLp VIM motor thalamus tremor', '#80d8ff'),
 ('Thal_VPL', 'Ventral posterolateral nucleus', 'VPL somatosensory thalamus', '#a7ffeb'),
 ('Thal_LGN', 'Lateral geniculate nucleus', 'LGN visual thalamus', '#cfd8dc'),
 ('Thal_MGN', 'Medial geniculate nucleus', 'MGN auditory thalamus', '#ffe0b2')]:
    add(key, name, 'Thalamic nuclei', al, col, THO)
BSN = 'Brainstem Navigator centroid (Bianciardi lab); shape schematic'
add('PAG', 'Periaqueductal grey', 'Brainstem nuclei', 'PAG periaqueductal gray defence pain', '#d8d2a8', BSN)
add('Dorsal_raphe', 'Dorsal raphe nucleus', 'Brainstem nuclei', 'DRN serotonin 5-HT raphe', '#ffd166', BSN)
add('Median_raphe', 'Median raphe nucleus', 'Brainstem nuclei', 'MnR serotonin 5-HT raphe', '#f4a261', BSN)
add('Locus_coeruleus', 'Locus coeruleus', 'Brainstem nuclei', 'LC noradrenaline norepinephrine', '#3fa9ff', BSN)
add('Fourth_ventricle', 'Fourth ventricle', 'White matter & ventricles', 'CSF ventricle', '#5fb3ff', 'CerebrA atlas (Manera 2020)')
TR = 'HCP842 tractography atlas (Yeh 2018)'
for key, name, al, col in [
 ('Fornix', 'Fornix', 'Papez hippocampal output', '#fff176'),
 ('Cingulum', 'Cingulum bundle', 'cingulum Papez', '#ff80ab'),
 ('Uncinate', 'Uncinate fasciculus', 'uncinate frontotemporal', '#ffab40'),
 ('SLF', 'Superior longitudinal fasciculus', 'SLF frontoparietal', '#40c4ff'),
 ('Arcuate', 'Arcuate fasciculus', 'arcuate language conduction aphasia', '#18ffff'),
 ('IFOF', 'Inferior fronto-occipital fasciculus', 'IFOF', '#b388ff'),
 ('ILF', 'Inferior longitudinal fasciculus', 'ILF occipitotemporal', '#69f0ae'),
 ('CST', 'Corticospinal tract', 'CST pyramidal motor internal capsule', '#ff5252'),
 ('Optic_radiation', 'Optic radiation', 'geniculocalcarine Meyer loop visual', '#ea80fc'),
 ('Anterior_commissure', 'Anterior commissure', 'commissure', '#f5f5f5')]:
    add(key, name, 'White matter tracts', al, col, TR)
add('MTT', 'Mammillothalamic tract', 'White matter tracts', 'MTT Papez mammillothalamic', '#ffd8a8', THO)

GROUP_ORDER = ['Frontal lobe', 'Orbitofrontal cortex', 'Cingulate & medial prefrontal', 'Insula', 'Parietal lobe', 'Temporal lobe',
               'Medial temporal lobe', 'Occipital lobe', 'Basal ganglia', 'Basal forebrain', 'Diencephalon', 'Thalamic nuclei',
               'Brainstem & cerebellum', 'Brainstem nuclei', 'White matter & ventricles', 'White matter tracts']
ORDER = [k for g in GROUP_ORDER for k in S if S[k]['group'] == g]
IDX = {k: i + 1 for i, k in enumerate(ORDER)}       # 1-based structure index used in label volumes

# ---------------------------------------------------------------- collect pieces: (key, hemi, trimesh, mask)
pieces = []
L1 = np.zeros(SHAPE, np.uint8); L2 = np.zeros(SHAPE, np.uint8)

for k, v in hlabels.items():
    k = int(k)
    if k == 0: continue
    lbl = v['label']; hemi, key = ('L', lbl[2:]) if lbl.startswith('L_') else (('R', lbl[2:]) if lbl.startswith('R_') else ('M', lbl))
    m = H == k
    pieces.append((key, hemi, mesh_from_mask(m), m)); L1[m] = IDX[key]
log('hammers done')

# CIT168 surface meshes (2009 space) -> NLin6
import struct
b = gzip.decompress(open('/home/claude/data/leaddbs/ext_libs/surfice/atlas/CIT168.mz3', 'rb').read())
_, attr, nf, nv, nskip = struct.unpack('<HHIII', b[:16]); off = 16
CF = np.frombuffer(b, np.int32, nf * 3, off).reshape(-1, 3); off += nf * 12
CV = np.frombuffer(b, np.float32, nv * 3, off).reshape(-1, 3).astype(float); off += nv * 12 + nv * 4
CS = np.frombuffer(b, np.float32, nv, off).astype(int)
CV = xfm_points(CV)
cit_names = 'Pu Ca NAC EXA GPe GPi SNc RN SNr PBP VTA VeP HN HTH MN STH'.split()
cit_map = {'STH': 'Subthalamic_nucleus', 'VeP': 'Ventral_pallidum', 'HTH': 'Hypothalamus', 'HN': 'Habenula', 'MN': 'Mammillary_body',
           'RN': 'Red_nucleus', 'VTA': 'VTA', 'PBP': 'VTA'}
groups = {}
for s in range(1, 33):
    nm = cit_names[(s - 1) // 2]
    if nm not in cit_map: continue
    groups.setdefault((cit_map[nm], 'L' if s % 2 else 'R'), []).append(s)
for (key, hemi), labs in groups.items():
    keep = np.isin(CS[CF], labs).all(1)
    tm = trimesh.Trimesh(CV, CF[keep], process=True); tm.remove_unreferenced_vertices()
    assert hemi_of(tm.vertices.mean(0)) == hemi, (key, hemi, tm.vertices.mean(0))
    tm = finish(tm, target_scale=1.2, lo=300, hi=3000, smooth=4)
    m = mask_from_mesh(tm); pieces.append((key, hemi, tm, m)); L2[m] = IDX[key]
log('cit done')

def from_volume(img_arr, mapping, src_key_prefix=None, sigma=None, kw=None):
    for key, labs in mapping:
        for hemi_lab in labs:
            m = np.isin(img_arr, hemi_lab)
            if m.sum() < 8: log('tiny', key, hemi_lab, m.sum()); continue
            cen = vox2mni(np.argwhere(m).mean(0)); hemi = hemi_of(cen) if abs(cen[0]) > 2 else 'M'
            yield key, hemi, m

jb = resample(sitk.ReadImage(DS + 'JulichBrain.nii.gz'))
for key, hemi, m in from_volume(jb, [('Bed_nucleus_stria_terminalis', [11, 218]), ('Nucleus_basalis', [10, 217]), ('Septal_diagonal_band', [9, 216])]):
    pieces.append((key, hemi, mesh_from_mask(m, sigma=0.7), m)); L2[m] = IDX[key]
thom = resample(sitk.ReadImage(DS + 'THOMAS.nii.gz'))
for key, hemi, m in from_volume(thom, [('Thal_AN', [1, 2]), ('Thal_VA', [3, 4]), ('Thal_VL', [[5, 7], [6, 8]]), ('Thal_VPL', [9, 10]), ('Thal_Pul', [11, 12]),
                                       ('Thal_LGN', [13, 14]), ('Thal_MGN', [15, 16]), ('Thal_CM', [17, 18]), ('Thal_MD', [19, 20]), ('MTT', [23, 24])]):
    pieces.append((key, hemi, mesh_from_mask(m, sigma=0.75), m))
    if key != 'MTT': L2[m & (L2 == 0)] = IDX[key]
cer = resample(sitk.ReadImage(DS + 'CerebrA.nii.gz'))
m = np.isin(cer, [88, 37]); pieces.append(('Fourth_ventricle', 'M', mesh_from_mask(m), m)); L2[m] = IDX['Fourth_ventricle']
log('volumes done')

# brainstem nuclei: Brainstem Navigator centroids (file is LPS: flip x, y), schematic ellipsoids
def ellipsoid(c, r):
    tm = trimesh.creation.icosphere(subdivisions=3); tm.apply_scale(r); tm.apply_translation(c); return tm
BS = [('Locus_coeruleus', 'L', (-3.4, -37.5, -25.5), (1.3, 1.6, 6.5)), ('Locus_coeruleus', 'R', (5.0, -37.7, -25.8), (1.3, 1.6, 6.5)),
      ('Dorsal_raphe', 'M', (0.7, -31.6, -14.1), (1.8, 2.2, 5.0)), ('Median_raphe', 'M', (0.65, -31.0, -20.2), (1.6, 2.4, 4.0)),
      ('PAG', 'M', (0.6, -32.6, -8.9), (4.2, 3.6, 6.5))]
for key, hemi, c, r in BS:
    tm = ellipsoid(np.array(c), np.array(r)); tm.fix_normals()
    m = mask_from_mesh(tm)
    inside = (H[m] == 19).mean() if m.any() else 0
    log(key, hemi, 'voxels', int(m.sum()), 'inside Hammers brainstem', round(float(inside), 2))
    pieces.append((key, hemi, tm, m)); L2[m] = IDX[key]

# tracts (HCP842, 4D, one binary volume per tract)
t4 = nib.load(DS + 'HCP842_tractography.nii.gz')
TRACTS = [('Fornix', [8, 9]), ('Cingulum', [22, 23]), ('Uncinate', [38, 39]), ('SLF', [34, 35]), ('Arcuate', [20, 21]), ('IFOF', [28, 29]),
          ('ILF', [30, 31]), ('CST', [4, 5]), ('Optic_radiation', [14, 15]), ('Anterior_commissure', [42])]
tmpd = tempfile.mkdtemp()
for key, vols in TRACTS:
    for vi in vols:
        arr = np.asarray(t4.dataobj[..., vi]).astype(np.uint8)
        fn = f'{tmpd}/t{vi}.nii.gz'; nib.save(nib.Nifti1Image(arr, t4.affine), fn)
        m = resample(sitk.ReadImage(fn)) > 0
        cen = vox2mni(np.argwhere(m).mean(0)); hemi = 'M' if key == 'Anterior_commissure' else hemi_of(cen)
        pieces.append((key, hemi, mesh_from_mask(m, sigma=1.0, target_scale=0.32, hi=7000), m))
log('tracts done')

# ---------------------------------------------------------------- pack meshes
CENTER = np.array([0.0, -18.0, 14.0])
def to_three(v): v = v - CENTER; return np.stack([-v[:, 0], v[:, 2], v[:, 1]], 1)
meshes, chunks, off, structs = [], [], 0, {}
for key, hemi, tm, m in pieces:
    vn = tm.vertex_normals
    ijk = np.clip(mni2vox(tm.vertices + vn * 1.0), 0, np.array(SHAPE) - 1)
    net = NEAR[ijk[:, 0], ijk[:, 1], ijk[:, 2]].astype(np.uint8)
    vt = to_three(tm.vertices); assert len(vt) < 65535, key
    rec = {'key': key, 'hemi': hemi, 'nv': len(vt), 'nf': len(tm.faces), 'vo': off}
    for arr in (np.rint(vt * 100).astype(np.int16), tm.faces.astype(np.uint16)):
        bb = arr.tobytes(); chunks.append(bb); off += len(bb)
        if 'fo' not in rec and arr.dtype == np.uint16: rec['fo'] = off - len(bb)
    rec['no'] = off; chunks.append(net.tobytes()); off += len(net)
    pad = (-off) % 4; chunks.append(b'\0' * pad); off += pad
    meshes.append(rec)
    st = structs.setdefault(key, dict(S[key], vol={}, cent={}, comp=np.zeros(7)))
    st['vol'][hemi] = round(float(m.sum()) / 1000, 2)
    st['cent'][hemi] = np.round(vox2mni(np.argwhere(m).mean(0)), 1).tolist()
    st['comp'] += np.bincount(Y[m], minlength=8)[1:]
for st in structs.values():
    c = st['comp']; tot = c.sum(); v = sum(st['vol'].values()) * 1000
    st['comp'] = [round(float(x / tot), 3) for x in c] if (tot > 0.2 * v and st['group'] not in ('White matter tracts', 'Thalamic nuclei', 'Brainstem nuclei', 'Basal forebrain', 'Diencephalon', 'Basal ganglia')) else None
    st['idx'] = IDX[st['key']]

# ---------------------------------------------------------------- volumes for the MRI slice (1.5 mm, RAS-ordered, cropped)
T1 = np.asarray(nib.load(NP + 'reference_brains/MNI152NLin6_res-1x1x1_T1w_descr-brain.nii.gz').dataobj).astype(np.float32)
nz = np.argwhere(T1 > 0); lo = np.maximum(nz.min(0) - 2, 0); hi = np.minimum(nz.max(0) + 3, SHAPE)
crop = lambda a: a[lo[0]:hi[0], lo[1]:hi[1], lo[2]:hi[2]][::-1]          # flip i so index grows with MNI x
t1c = crop(T1); t1c = np.clip(t1c / np.percentile(t1c[t1c > 0], 99.5), 0, 1)
z = 1 / 1.5
t1d = (ndimage.zoom(t1c, z, order=1) * 255).astype(np.uint8)
l1d = ndimage.zoom(crop(L1), z, order=0); l2d = ndimage.zoom(crop(L2), z, order=0)
x0 = vox2mni([hi[0] - 1, lo[1], lo[2]])                                    # MNI of first voxel after the flip
dims = list(t1d.shape)                                                      # (nx, ny, nz)
vol = b''.join(a.transpose(2, 1, 0).astype(np.uint8).tobytes() for a in (t1d, l1d, l2d))   # x fastest
open(OUT + '/vol.bin.gz', 'wb').write(gzip.compress(vol, 9))
step = [(hi[i] - lo[i] - 1) / (dims[i] - 1) for i in range(3)]          # scipy zoom aligns corners

blob = b''.join(chunks); open(OUT + '/brain.bin', 'wb').write(blob)
man = {'meshes': meshes, 'structs': [structs[k] for k in ORDER if k in structs], 'groups': GROUP_ORDER, 'scale': 0.01,
       'center_mni': CENTER.tolist(), 'vol': {'dims': dims, 'origin': np.round(x0, 3).tolist(), 'step': step}}
json.dump(man, open(OUT + '/manifest.json', 'w'))
log('meshes', len(meshes), 'faces', sum(m['nf'] for m in meshes), 'bin', len(blob), 'vol gz', os.path.getsize(OUT + '/vol.bin.gz'), 'dims', dims, 'step', np.round(step, 3), 'origin', x0)
