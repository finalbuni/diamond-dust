#!/usr/bin/env python3
"""Rebuild long chapters and short-section pages from EDIT_CHAPTERS_HERE only.
Run after saving edits. Generated _chapters and _sections are not editable originals.
"""
from pathlib import Path
import re
root=Path(__file__).resolve().parent
editable=root/'EDIT_CHAPTERS_HERE'
chapters=root/'_chapters'; sections=root/'_sections'
folders=sorted(editable.glob('chapter_[0-9][0-9]'))
if len(folders)!=34: raise SystemExit(f'Expected 34 editable chapter folders; found {len(folders)}. No changes made.')
outputs={}
for folder in folders:
    n=int(folder.name[-2:]); source=sorted(folder.glob('section_*.html'))
    if not source or [int(p.stem[-2:]) for p in source]!=list(range(1,len(source)+1)):
        raise SystemExit(f'Missing/nonconsecutive section files in {folder}. No changes made.')
    front=(folder/'front_matter.yml').read_text()
    if not re.match(r'\A---\s*\n.*?\n---\s*\n\Z',front,re.S):
        raise SystemExit(f'Invalid front matter in {folder}. No changes made.')
    def field(key):
        m=re.search(r'^'+re.escape(key)+r':\s*(.+?)\s*$',front,re.M)
        if not m: raise SystemExit(f'Missing {key} in {folder}. No changes made.')
        return m.group(1)
    full_slug=f'chapter-{n:02d}'
    full_parts=[]
    for idx,src in enumerate(source,1):
        prose=src.read_text().strip()
        if not prose: raise SystemExit(f'Empty section: {src}. No changes made.')
        if idx>1: full_parts.append('{% include scene-break.html %}')
        full_parts.append(f'<div id="section-{idx}" class="hybrid-section" data-section="{idx}">\n{prose}\n</div>')
        section_front=(front.rstrip()[:-3].rstrip()+f'\nhybrid_short: true\nsection_number: {idx}\nsection_count: {len(source)}\npermalink: /sections/{full_slug}/{idx}/\nexcerpt_separator: "<!-- section-excerpt-end -->"\n---\n')
        outputs[sections/f'chapter_{n:02d}_section_{idx:02d}.md']=section_front+prose+'\n'
    # Preserve original long chapter path and front matter. Explicit permalink prevents slug drift.
    full_front=(front.rstrip()[:-3].rstrip()+f'\npermalink: /chapters/{full_slug}/\nexcerpt_separator: "<!-- section-excerpt-end -->"\n---\n')
    outputs[chapters/f'chapter_{n:02d}.md']=full_front+'\n'.join(full_parts)+'\n'
sections.mkdir(exist_ok=True)
for old in sections.glob('chapter_*_section_*.md'):
    if old not in outputs: old.unlink()
for path,body in outputs.items(): path.write_text(body)
print(f'Built {len(folders)} full chapters and {len(outputs)-len(folders)} short-section pages from EDIT_CHAPTERS_HERE.')
