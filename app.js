if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(err => console.error('Service worker registration failed', err));
  });
}

function getBaseUrl() {
  return localStorage.getItem('baseUrl') || '';
}

function setBaseUrl(url) {
  localStorage.setItem('baseUrl', url);
}

document.addEventListener('DOMContentLoaded', () => {
  const baseUrlInput = document.getElementById('baseUrl');
  baseUrlInput.value = getBaseUrl();

  document.getElementById('saveBaseUrl').addEventListener('click', () => {
    const url = baseUrlInput.value.trim();
    setBaseUrl(url);
    alert('Base URL saved');
  });

  document.getElementById('testHealth').addEventListener('click', async () => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      alert('Please set a base URL first');
      return;
    }
    const statusEl = document.getElementById('healthStatus');
    statusEl.textContent = 'Testing...';
    try {
      const resp = await fetch(`${baseUrl}/health`);
      if (resp.ok) {
        const json = await resp.json();
        statusEl.textContent = 'Healthy: ' + JSON.stringify(json);
      } else {
        statusEl.textContent = 'Error: ' + resp.status;
      }
    } catch (err) {
      statusEl.textContent = 'Error: ' + err.message;
    }
  });

  document.getElementById('predict').addEventListener('click', async () => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      alert('Please set a base URL first');
      return;
    }
    const sport = document.getElementById('sport').value;
    const contextStr = document.getElementById('context').value.trim();
    const oddsStr = document.getElementById('odds').value.trim();
    let context;
    let odds;
    try {
      context = contextStr ? JSON.parse(contextStr) : {};
    } catch (err) {
      alert('Context JSON is invalid');
      return;
    }
    try {
      odds = oddsStr ? JSON.parse(oddsStr) : undefined;
    } catch (err) {
      alert('Market odds JSON is invalid');
      return;
    }
    const payload = { sport, context };
    if (odds) {
      payload.market_odds = odds;
    }
    const resultEl = document.getElementById('result');
    resultEl.textContent = 'Predicting...';
    try {
      const resp = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await resp.json();
      resultEl.textContent = JSON.stringify(json, null, 2);
    } catch (err) {
      resultEl.textContent = 'Error: ' + err.message;
    }
  });
});
