/* Direct URLs always retain their format; reader-initiated changes save a navigation preference. */
(() => {
  const select = document.querySelector('#hybrid-format');
  if (!select) return;
  const sections = [...document.querySelectorAll('.hybrid-section')];
  const settingsSelect = document.querySelector('#hybrid-settings-format');

  function visibleSection() {
    if (!sections.length) return 1;
    const line = window.innerHeight / 3;
    let candidate = sections[0];
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line) candidate = section;
      if (rect.top <= line && rect.bottom >= line) return Number(section.dataset.section);
    }
    return Number(candidate.dataset.section);
  }

  function switchToShort() {
    location.assign(select.dataset.shortBase + visibleSection() + '/');
  }

  function changeFormat(value) {
    try { localStorage.setItem('diamond-dust-reading-format', value); } catch (_) {}
    if (value === 'short') switchToShort();
    else {
      const section = select.dataset.currentSection;
      location.assign(select.dataset.fullUrl + (section ? '#section-' + section : ''));
    }
  }

  select.addEventListener('change', () => changeFormat(select.value));
  if (settingsSelect) {
    settingsSelect.addEventListener('change', () => changeFormat(settingsSelect.value));
  }
})();
