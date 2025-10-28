// Background service worker to handle authenticated requests

// Handle extension icon click - open the viewer directly
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('viewer.html')
  });
});

// Handle authenticated fetch requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchWithAuth') {
    fetchWithAuth(request.url)
      .then(content => sendResponse({ success: true, content }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function fetchWithAuth(url) {
  try {
    // Get GitHub cookies
    const cookies = await chrome.cookies.getAll({
      domain: '.github.com'
    });

    // Build cookie header
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Fetch with cookies
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'text/plain',
        'User-Agent': 'Chrome Extension Test Cases Viewer'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Background fetch error:', error);
    throw error;
  }
}
