document.getElementById('viewBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Opening viewer...';
  statusEl.className = '';

  try {
    // Open the viewer in a new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('viewer.html')
    });
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    statusEl.className = 'error';
  }
});
