# Diamond Dust hybrid — editing guide

**Edit prose ONLY in `EDIT_CHAPTERS_HERE/chapter_XX/section_YY.html`.** The chapter folders contain `front_matter.yml` (metadata) and numbered section files. Never edit `_chapters/` or `_sections/`: the script replaces those generated files.

## After editing a section

1. Open the appropriate `EDIT_CHAPTERS_HERE/chapter_XX/section_YY.html`, edit and **save** (Command-S).
2. In Terminal, from this project folder run `python3 build_hybrid.py`.
3. For local preview, run `PAGES_REPO_NWO=finalbuni/diamond-dust bundle exec jekyll serve` (if already running, it usually rebuilds automatically).
4. Check the full chapter and the individual section page. Example: `/diamond-dust/chapters/chapter-05/` and `/diamond-dust/sections/chapter-05/3/`.

The generator rebuilds all 34 full chapter sources and their section pages from one editable source per section. Existing full chapter URLs are preserved; section pages have separate URLs. No new sections or chapters are expected. This is a **local integration package**: before publishing, check all chapters and both reading modes, and commit the generated `_chapters/` and `_sections/` alongside the editing sources. GitHub Pages will not run `build_hybrid.py` for you; run it before committing changes. Keep a backup of your live repository and do not overwrite it without review.

## Announcements and feedback
The site-wide banner is in `_includes/site-update-banner.html`. Its dismissal key is independent of the old survey. The permanent update archive is `updates/index.html`; add new dated entries above older ones. The footer link is in `_includes/site-footer.html` and opens the Google Form.
