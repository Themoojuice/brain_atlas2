# Brain Network Atlas

A rotatable 3D human brain for learning neuroanatomy, networks, pathways and psychopharmacology. One self-contained web page; works on desktop and phone.

**Live:** https://themoojuice.github.io/brain_atlas2/

## What's in it
- 78 structures in MNI152 space: cortex, deep grey matter, basal forebrain, hypothalamus, habenula, thalamic nuclei, brainstem monoamine nuclei, ventricles and 11 white matter tracts. Each has a plus/minus toggle (solid, ghost, hidden), a teaching note and its source atlas
- Networks: salience, default mode, central executive, triple network, all seven Yeo networks
- Pathways: animated schematic circuits (dopamine, Papez, noradrenaline, serotonin, acetylcholine, limbic and motor loops), each framed to fit above the card on phones
- Animated stories (Pathways tab): **Psychosis: the gain story** (10 scenes) and **Mood: the affective disruption story** (9 scenes). Signed edges (excitatory, inhibitory, dopamine, regulatory), a state switch, a dopamine gain dial, a dopamine-neuron grid, event tokens and free-play sliders, all driven by one small state model per story. Deep link: `#story=psy&scene=5` (add `&pause=1`, `&t=6` to freeze at a moment)
- Drugs: 20 receptor PET maps painted on the brain and on the MRI slice, and 40 drugs linked to their targets
- Tools: cut planes with the MNI152 MRI and atlas outlines, "Find it" quiz, orientation marker

## Data and licences
All atlases are group averages, resampled to MNI152 (FSL 6th generation, 1 mm). Atlas files came from [neuroparc](https://github.com/neurodata/neuroparc), [Lead-DBS](https://github.com/netstim/leaddbs), [hansen_brainstemfc](https://github.com/netneurolab/hansen_brainstemfc) and [hansen_receptors](https://github.com/netneurolab/hansen_receptors).
- Cortex and deep grey matter: Hammers 83-region atlas (Hammers 2003; Gousias 2008), academic use
- Hypothalamus, habenula, mammillary bodies, subthalamic nucleus, ventral pallidum, red nucleus, ventral tegmental area: CIT168 (Pauli 2018)
- Thalamic nuclei and mammillothalamic tract: THOMAS (Su 2019)
- Basal forebrain: Julich-Brain 3
- Fourth ventricle: CerebrA (Manera 2020)
- Locus coeruleus, raphe, periaqueductal grey: Brainstem Navigator centroids, shapes schematic
- Tracts: HCP842 tractography atlas (Yeh 2018)
- Networks: Yeo et al. 2011
- Receptor maps: Hansen et al. 2022 collection (CC BY-NC-SA 4.0) and the original studies named in the page

Drug affinity tiers are approximate teaching values, not measured constants. Non-commercial teaching use only. This is not a clinical tool and cannot localise anything in an individual patient's scan.

## Rebuild
`build/` holds the data scripts (build2.py, build_pet.py), the page template (template_v3.html) and its content files (content.js, content_drugs.js, content_story.js), the story engine (story_engine.js, story.css, story.html), the assembler (assemble_v3.py) and the headless phone/desktop check (qa_story.py). Paths in the scripts point at the original build machine; see the comments for the source repositories.
