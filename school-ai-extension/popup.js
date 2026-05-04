const DEFAULT_TEXT_MODEL = 'llama3';
const DEFAULT_VISION_MODEL = 'llava';

async function checkOllamaStatus() {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  try {
    const res = await chrome.runtime.sendMessage({ type: 'CHECK_OLLAMA' });
    if (res.ok) {
      dot.className = 'dot online';
      text.textContent = 'Ollama is running';
    } else {
      throw new Error('not running');
    }
  } catch {
    dot.className = 'dot offline';
    text.textContent = 'Ollama offline — start it first';
  }
}

async function loadSettings() {
  const stored = await chrome.storage.local.get(['textModel', 'visionModel']);
  document.getElementById('text-model').value = stored.textModel || DEFAULT_TEXT_MODEL;
  document.getElementById('vision-model').value = stored.visionModel || DEFAULT_VISION_MODEL;
}

document.getElementById('save-btn').addEventListener('click', async () => {
  const textModel = document.getElementById('text-model').value.trim() || DEFAULT_TEXT_MODEL;
  const visionModel = document.getElementById('vision-model').value.trim() || DEFAULT_VISION_MODEL;
  await chrome.storage.local.set({ textModel, visionModel });
  const btn = document.getElementById('save-btn');
  btn.textContent = 'Saved ✓';
  setTimeout(() => { btn.textContent = 'Save'; }, 1500);
});

document.getElementById('open-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const url = tab.url || '';
  const isRestrictedPage = url.startsWith('chrome://') || url.startsWith('about:') ||
                           url.startsWith('chrome-extension://') || url === '';

  if (isRestrictedPage) {
    const btn = document.getElementById('open-btn');
    const original = btn.textContent;
    btn.textContent = '⚠ Open a webpage first';
    btn.style.background = '#f38ba8';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 2500);
    return;
  }

  // Try sending to existing content script; if tab was open before the
  // extension loaded the script won't be there yet — inject it first.
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
  }
  window.close();
});

checkOllamaStatus();
loadSettings();
