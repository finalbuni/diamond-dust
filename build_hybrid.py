#!/usr/bin/env python3
"""Rebuild long chapters and short-section pages from EDIT_CHAPTERS_HERE only.

Editable source:
    EDIT_CHAPTERS_HERE/chapter_XX/section_XX.html
    EDIT_CHAPTERS_HERE/chapter_XX/notes.yml

Generated _chapters and _sections are not editable originals.

Translator's-note source syntax:
    [[visible text|note-id]]

Example:
    [[Hyeoni|hyeoni]]

Notes are numbered automatically in order of first appearance.
Short-section pages number only notes used in that section.
Full chapters number notes across the entire chapter.
"""

from pathlib import Path
import html
import re

root = Path(__file__).resolve().parent
editable = root / "EDIT_CHAPTERS_HERE"
chapters = root / "_chapters"
sections = root / "_sections"

folders = sorted(editable.glob("chapter_[0-9][0-9]"))

if len(folders) != 34:
    raise SystemExit(
        f"Expected 34 editable chapter folders; found {len(folders)}. "
        "No changes made."
    )

outputs = {}

NOTE_REF_RE = re.compile(r"\[\[([^\[\]|]+)\|([a-z0-9][a-z0-9-]*)\]\]")


def parse_notes(path):
    """Parse our intentionally tiny notes.yml format without PyYAML."""

    if not path.exists():
        return {}

    notes = {}
    current_id = None

    for line_number, raw_line in enumerate(
        path.read_text().splitlines(), start=1
    ):
        line = raw_line.rstrip()

        if not line or line.lstrip().startswith("#"):
            continue

        note_match = re.fullmatch(
            r"([a-z0-9][a-z0-9-]*):",
            line
        )

        if note_match:
            current_id = note_match.group(1)

            if current_id in notes:
                raise SystemExit(
                    f"Duplicate note ID '{current_id}' in {path} "
                    f"at line {line_number}. No changes made."
                )

            notes[current_id] = {}
            continue

        field_match = re.fullmatch(
            r'  (term|text):\s*"(.*)"',
            line
        )

        if field_match and current_id:
            key, value = field_match.groups()

            # Support the \" used inside our quoted values.
            value = value.replace(r"\"", '"').replace(r"\\", "\\")

            if key in notes[current_id]:
                raise SystemExit(
                    f"Duplicate '{key}' for note '{current_id}' "
                    f"in {path} at line {line_number}. No changes made."
                )

            notes[current_id][key] = value
            continue

        raise SystemExit(
            f"Invalid notes syntax in {path} at line {line_number}:\n"
            f"{raw_line}\nNo changes made."
        )

    for note_id, note in notes.items():
        missing = {"term", "text"} - set(note)

        if missing:
            raise SystemExit(
                f"Note '{note_id}' in {path} is missing "
                f"{', '.join(sorted(missing))}. No changes made."
            )

    return notes


def render_note_references(prose, notes, scope_id):
    """Replace note source markers and return rendered prose + used note IDs."""

    used = []

    def replace(match):
        visible_text = match.group(1)
        note_id = match.group(2)

        if note_id not in notes:
            raise SystemExit(
                f"Reference to undefined note '{note_id}' "
                f"in {scope_id}. No changes made."
            )

        if note_id not in used:
            used.append(note_id)

        number = used.index(note_id) + 1

        ref_id = f"tn-ref-{scope_id}-{number}"
        note_anchor = f"tn-{scope_id}-{number}"

        return (
            f"{visible_text}"
            f'<sup class="tn-marker" id="{ref_id}">'
            f'<a href="#{note_anchor}" '
            f'aria-label="Translator note {number}">{number}</a>'
            f"</sup>"
        )

    rendered = NOTE_REF_RE.sub(replace, prose)
    return rendered, used


def render_notes_block(note_ids, notes, scope_id):
    """Render the Translator's Notes block for one reading unit."""

    if not note_ids:
        return ""

    heading = (
        "TRANSLATOR'S NOTE"
        if len(note_ids) == 1
        else "TRANSLATOR'S NOTES"
    )

    items = []

    for number, note_id in enumerate(note_ids, start=1):
        note = notes[note_id]
        term = html.escape(note["term"])
        text = html.escape(note["text"])
        note_anchor = f"tn-{scope_id}-{number}"
        ref_id = f"tn-ref-{scope_id}-{number}"

        items.append(
            f'<li id="{note_anchor}" class="translator-note">'
            f'<span class="translator-note__number">{number}</span> '
            f"<strong>{term}</strong> — {text} "
            f'<a class="translator-note__back" href="#{ref_id}" '
            f'aria-label="Return to note reference {number}">'
            f"↩ Back to text"
            f"</a>"
            f"</li>"
        )

    return (
        '\n<section class="translator-notes" '
        'aria-label="Translator notes">\n'
        f'  <div class="translator-notes__heading">{heading}</div>\n'
        '  <ol class="translator-notes__list">\n'
        + "\n".join(f"    {item}" for item in items)
        + "\n  </ol>\n"
        "</section>\n"
    )


for folder in folders:
    n = int(folder.name[-2:])
    source = sorted(folder.glob("section_*.html"))

    if (
        not source
        or [int(p.stem[-2:]) for p in source]
        != list(range(1, len(source) + 1))
    ):
        raise SystemExit(
            f"Missing/nonconsecutive section files in {folder}. "
            "No changes made."
        )

    front = (folder / "front_matter.yml").read_text()

    if not re.match(r"\A---\s*\n.*?\n---\s*\n\Z", front, re.S):
        raise SystemExit(
            f"Invalid front matter in {folder}. No changes made."
        )

    notes_path = folder / "notes.yml"
    notes = parse_notes(notes_path)

    full_slug = f"chapter-{n:02d}"

    # Read everything before generating anything.
    raw_sections = []

    for idx, src in enumerate(source, 1):
        prose = src.read_text().strip()

        if not prose:
            raise SystemExit(
                f"Empty section: {src}. No changes made."
            )

        raw_sections.append((idx, src, prose))

    # Validate every note reference and determine chapter-wide order.
    chapter_note_ids = []

    for idx, src, prose in raw_sections:
        for match in NOTE_REF_RE.finditer(prose):
            note_id = match.group(2)

            if note_id not in notes:
                raise SystemExit(
                    f"Reference to undefined note '{note_id}' "
                    f"in {src}. No changes made."
                )

            if note_id not in chapter_note_ids:
                chapter_note_ids.append(note_id)

    unused_notes = [
        note_id
        for note_id in notes
        if note_id not in chapter_note_ids
    ]

    if unused_notes:
        raise SystemExit(
            f"Unused notes in {notes_path}: "
            f"{', '.join(unused_notes)}. No changes made."
        )

    full_parts = []

    for idx, src, prose in raw_sections:
        # SHORT-SECTION VERSION
        section_scope = f"chapter-{n:02d}-section-{idx:02d}"

        rendered_section, section_note_ids = render_note_references(
            prose,
            notes,
            section_scope
        )

        section_notes = render_notes_block(
            section_note_ids,
            notes,
            section_scope
        )

        section_front = (
            front.rstrip()[:-3].rstrip()
            + "\nhybrid_short: true"
            + f"\nsection_number: {idx}"
            + f"\nsection_count: {len(source)}"
            + f"\npermalink: /sections/{full_slug}/{idx}/"
            + '\nexcerpt_separator: "<!-- section-excerpt-end -->"'
            + "\n---\n"
        )

        outputs[
            sections / f"chapter_{n:02d}_section_{idx:02d}.md"
        ] = (
            section_front
            + rendered_section
            + section_notes
            + "\n"
        )

        # FULL-CHAPTER VERSION
        # Numbering follows chapter-wide order rather than
        # section-local order.
        def replace_full_reference(match):
            visible_text = match.group(1)
            note_id = match.group(2)

            number = chapter_note_ids.index(note_id) + 1
            scope_id = f"chapter-{n:02d}"

            ref_id = f"tn-ref-{scope_id}-{number}"
            note_anchor = f"tn-{scope_id}-{number}"

            return (
                f"{visible_text}"
                f'<sup class="tn-marker" id="{ref_id}">'
                f'<a href="#{note_anchor}" '
                f'aria-label="Translator note {number}">{number}</a>'
                f"</sup>"
            )

        rendered_full_section = NOTE_REF_RE.sub(
            replace_full_reference,
            prose
        )

        if idx > 1:
            full_parts.append(
                "{% include scene-break.html %}"
            )

        full_parts.append(
            f'<div id="section-{idx}" '
            f'class="hybrid-section" data-section="{idx}">\n'
            f"{rendered_full_section}\n"
            "</div>"
        )

    full_notes = render_notes_block(
        chapter_note_ids,
        notes,
        f"chapter-{n:02d}"
    )

    full_front = (
        front.rstrip()[:-3].rstrip()
        + f"\npermalink: /chapters/{full_slug}/"
        + '\nexcerpt_separator: "<!-- section-excerpt-end -->"'
        + "\n---\n"
    )

    outputs[
        chapters / f"chapter_{n:02d}.md"
    ] = (
        full_front
        + "\n".join(full_parts)
        + full_notes
        + "\n"
    )


# Only write generated files after every chapter has passed validation.
sections.mkdir(exist_ok=True)

for old in sections.glob("chapter_*_section_*.md"):
    if old not in outputs:
        old.unlink()

for path, body in outputs.items():
    path.write_text(body)

print(
    f"Built {len(folders)} full chapters and "
    f"{len(outputs) - len(folders)} short-section pages "
    f"from EDIT_CHAPTERS_HERE."
)