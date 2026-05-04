const OLLAMA_URL = 'http://localhost:11434/api/generate';
const DEFAULT_TEXT_MODEL = 'llama3';
const DEFAULT_VISION_MODEL = 'llava';

// Keyboard shortcut handler
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (command === 'toggle-overlay') {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
    } catch {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' });
    }
  } else if (command === 'capture-screen') {
    startScreenCapture(tab);
  }
});

// Message handler from content script / popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_SCREEN_CAPTURE') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) startScreenCapture(tab);
    });
    return true;
  }

  if (msg.type === 'ASK_OLLAMA_TEXT') {
    askOllamaText(msg.prompt, msg.model)
      .then((answer) => sendResponse({ ok: true, answer }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true; // keep channel open for async response
  }

  if (msg.type === 'ASK_OLLAMA_IMAGE') {
    askOllamaImage(msg.prompt, msg.imageBase64, msg.model)
      .then((answer) => sendResponse({ ok: true, answer }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (msg.type === 'CHECK_OLLAMA') {
    checkOllama()
      .then((ok) => sendResponse({ ok }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }
});

function startScreenCapture(tab) {
  chrome.desktopCapture.chooseDesktopMedia(
    ['screen', 'window'],
    tab,
    (streamId) => {
      if (!streamId) return; // user cancelled
      chrome.tabs.sendMessage(tab.id, {
        type: 'SCREEN_CAPTURE_STREAM_ID',
        streamId,
      });
    }
  );
}

const SYSTEM_PROMPT = `You are a multilingual study assistant specialising in literature, language, and vocabulary.

When you receive a question or text in Turkish:
1. Internally translate it to English.
2. Reason about the answer in English, drawing on your knowledge of the book, poem, or article being discussed.
3. Write your final answer in Turkish.

When the question is in English, answer in English.
Be clear and concise. For literature questions, reference specific details from the work when relevant.`;

async function askOllamaText(prompt, model = DEFAULT_TEXT_MODEL) {
  const body = {
    model,
    prompt: `${SYSTEM_PROMPT}\n\n${prompt}`,
    stream: false,
  };
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}

async function askOllamaImage(prompt, imageBase64, model = DEFAULT_VISION_MODEL) {
  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const body = {
    model,
    prompt: `${SYSTEM_PROMPT}\n\nLook at this screenshot. Find all questions visible and answer them. If the questions are in Turkish, answer in Turkish.\n\n${prompt}`,
    images: [base64],
    stream: false,
  };
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response;
}

async function checkOllama() {
  const res = await fetch('http://localhost:11434/', { method: 'GET' });
  return res.ok;
}
