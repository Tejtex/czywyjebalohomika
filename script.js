async function loadStatus() {
  let data;
  try {
    const res = await fetch('status.json?t=' + Date.now());
    data = await res.json();
  } catch {
    setUnknown();
    return;
  }

  const card = document.getElementById('status-card');
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const hamster = document.getElementById('hamster');

  const isUp = data.status === 'up';
  const isDown = data.status === 'down';

  card.className = 'status-card ' + (isUp ? 'up' : isDown ? 'down' : '');
  dot.className = 'dot ' + (isUp ? 'up' : isDown ? 'down' : '');
  text.textContent = isUp ? 'działa ✓' : isDown ? 'nie działa ✗' : 'nieznany';

  hamster.classList.toggle('hidden', !isDown);

  if (data.uptime_percentage != null) {
    document.getElementById('uptime').textContent = data.uptime_percentage.toFixed(1) + '%';
  }

  if (data.response_time_ms != null) {
    document.getElementById('response-time').textContent = data.response_time_ms + ' ms';
  }

  if (data.last_checked) {
    const d = new Date(data.last_checked);
    document.getElementById('last-checked').textContent = d.toLocaleTimeString('pl-PL', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  renderHistory(data.history || []);
}

function renderHistory(history) {
  const container = document.getElementById('history');
  container.innerHTML = '';

  // pad to 288 slots if fewer entries exist
  const slots = 288;
  const padded = Array(Math.max(0, slots - history.length)).fill(null).concat(history);

  padded.forEach(entry => {
    const block = document.createElement('div');
    block.className = 'history-block ' + (entry ? entry.status : 'unknown');
    if (entry) {
      const d = new Date(entry.timestamp);
      const time = d.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const rt = entry.response_time_ms != null ? ` (${entry.response_time_ms}ms)` : '';
      block.title = `${time}${rt} — ${entry.status === 'up' ? 'działa' : 'nie działa'}`;
    }
    container.appendChild(block);
  });
}

function setUnknown() {
  document.getElementById('status-text').textContent = 'błąd ładowania danych';
}

loadStatus();
// refresh every 60 seconds
setInterval(loadStatus, 60_000);
