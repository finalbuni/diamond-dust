/* Apply the saved format to chapter navigation links.
   Never redirect a directly opened chapter or section URL. */
(() => {
  let format;
  try { format = localStorage.getItem('diamond-dust-reading-format'); } catch (_) {}
  if (format !== 'short') return;

  document.querySelectorAll('.chapter-list-item[data-short-url], .drawer-chapter-link[data-short-url]').forEach(link => {
    link.href = link.dataset.shortUrl;
  });

  const start = document.querySelector('.start-reading-button[data-short-start-url]');
  if (start) start.href = start.dataset.shortStartUrl;
  /* reading.js may subsequently replace Start with an exact Continue Reading URL. */
})();