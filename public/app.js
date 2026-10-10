const grid = document.querySelector('#stall-grid');
const searchInput = document.querySelector('#search');
const sortSelect = document.querySelector('#sort');
const statusText = document.querySelector('#status');

function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function renderStalls(stalls) {
  grid.innerHTML = '';

  if (stalls.length === 0) {
    statusText.textContent = 'No stalls found. Try another search.';
    return;
  }

  statusText.textContent = `${stalls.length} stall${stalls.length === 1 ? '' : 's'} found`;

  for (const stall of stalls) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <h2>${stall.name}</h2>
        <p class="meta">${stall.cuisine} · ${stall.centre}</p>
      </div>
      <div class="details">
        <span class="pill">${stall.price}</span>
        <span class="pill">⭐ ${stall.rating.toFixed(1)}</span>
        <span class="pill">${stall.hours.open}–${stall.hours.close}</span>
        ${stall.halal ? '<span class="pill halal">Halal</span>' : ''}
      </div>
    `;
    grid.append(card);
  }
}

async function loadStalls() {
  const params = new URLSearchParams({
    q: searchInput.value.trim(),
    sort: sortSelect.value,
  });

  statusText.classList.remove('error');
  statusText.textContent = 'Loading stalls...';

  try {
    const response = await fetch(`/api/stalls?${params}`);
    if (!response.ok) {
      throw new Error('The stall list could not be loaded. Please try again.');
    }
    renderStalls(await response.json());
  } catch (error) {
    grid.innerHTML = '';
    statusText.classList.add('error');
    statusText.textContent = error.message;
  }
}

const debouncedLoad = debounce(loadStalls);
searchInput.addEventListener('input', debouncedLoad);
sortSelect.addEventListener('change', loadStalls);
loadStalls();
