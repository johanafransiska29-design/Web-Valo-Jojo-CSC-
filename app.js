/**
 * VALORANT PROTOCOL - ARCHIVE LOGIC
 */

// Fallback data teranyar jika API publik belum menyertakan patch terbaru
const FALLBACK_AGENTS = [
  {
    uuid: 'custom-hush',
    displayName: 'Hush',
    developerName: 'Agent 31',
    description: 'Berasal dari Guangdong, China, Hush mengendalikan medan laga melalui manipulasi telekinetik dan distorsi sensorik jarak dekat untuk melumpuhkan inisiatif lawan.',
    displayIcon: 'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png',
    role: {
      displayName: 'Duelist',
      displayIcon: 'https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png'
    },
    abilities: [
      { slot: 'Passive', displayName: 'Telekinesis', description: 'Memungkinkan Hush berinteraksi dan menggeser proyektil atau objek taktis ringan dari jarak pandang.' },
      { slot: 'Ability1', displayName: 'Flashbulb (Q)', description: 'Melemparkan suar sonik yang meledak saat kontak, mendistorsi pandangan dan audio target secara instan.' },
      { slot: 'Ability2', displayName: 'Displacement (E)', description: 'Melesat ke arah kinetik secara instan lalu meninggalkan klon ilusi tipis selama 0.8 detik.' },
      { slot: 'Grenade', displayName: 'Flow (C)', description: 'Menciptakan aliran udara penekan yang membelokkan tembakan peluru sekunder musuh di koridor sempit.' },
      { slot: 'Ultimate', displayName: 'Suspension (X)', description: 'Menghentikan pergerakan semua musuh di area radius kubah gravitasi selama 2.5 detik.' }
    ]
  },
  {
    uuid: 'custom-miks',
    displayName: 'Miks',
    developerName: 'Agent 30',
    description: 'Berasal dari pesisir Kroasia, Miks menggunakan frekuensi getaran sonik dan tabir akustik untuk mendikte pergerakan serta membutakan indra pendengaran musuh.',
    displayIcon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-169c-945a5084c26f/displayicon.png',
    role: {
      displayName: 'Controller',
      displayIcon: 'https://media.valorant-api.com/agents/roles/4ee40330-ecba-4563-86f7-beecda53ffed/displayicon.png'
    },
    abilities: [
      { slot: 'Ability1', displayName: 'Harmonize (Q)', description: 'Melepaskan gelombang audio penyeimbang yang meredam semua jejak langkah rekan setim dalam radius.' },
      { slot: 'Grenade', displayName: 'M-Pulse (C)', description: 'Menembakkan suar frekuensi rendah yang mengirim getaran concussive ke musuh di balik dinding.' },
      { slot: 'Ability2', displayName: 'Waveform (E)', description: 'Mendirikan tirai sonik bergelombang tinggi yang menelan tembakan peluru serta menutup pandangan.' },
      { slot: 'Ultimate', displayName: 'Bassquake (X)', description: 'Menggetarkan tanah secara meluas, memaksa crosshair musuh tersentak hebat dan memperlambat langkah kaki.' }
    ]
  }
];

const FALLBACK_WEAPONS = [
  {
    uuid: 'custom-warden',
    displayName: 'Warden',
    category: 'EEquippableCategory::Rifle',
    displayIcon: 'https://media.valorant-api.com/weapons/ae3de142-4e85-25c3-4d9e-1286c5f6844f/displayicon.png',
    shopData: {
      cost: 2900,
      category: 'Rifles',
      categoryText: 'Rifles'
    },
    weaponStats: {
      fireRate: 6.5,
      magazineSize: 18,
      wallPenetration: 'Medium',
      damageRanges: [
        { rangeStartMeters: 0, rangeEndMeters: 30, headDamage: 200, bodyDamage: 50, legDamage: 42 },
        { rangeStartMeters: 30, rangeEndMeters: 50, headDamage: 180, bodyDamage: 45, legDamage: 38 }
      ]
    }
  }
];

let currentTab = 'agents';
let agentsData = [];
let weaponsData = [];
let currentFilter = 'ALL';

// Inisialisasi data API
async function init() {
  const loadingEl = document.getElementById('loading');
  try {
    const [agentsRes, weaponsRes] = await Promise.all([
      fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true').then(res => res.json()),
      fetch('https://valorant-api.com/v1/weapons').then(res => res.json())
    ]);

    agentsData = agentsRes.data || [];
    FALLBACK_AGENTS.forEach(fAgent => {
      if (!agentsData.some(a => a.displayName.toLowerCase() === fAgent.displayName.toLowerCase())) {
        agentsData.unshift(fAgent);
      }
    });

    weaponsData = weaponsRes.data || [];
    FALLBACK_WEAPONS.forEach(fWep => {
      if (!weaponsData.some(w => w.displayName.toLowerCase() === fWep.displayName.toLowerCase())) {
        weaponsData.unshift(fWep);
      }
    });

    loadingEl.style.display = 'none';
    renderFilters();
    renderGrid();
  } catch (error) {
    console.error('Fetch error:', error);
    loadingEl.innerText = 'Gagal memuat data dari API. Pastikan perangkat terhubung internet.';
  }
}

// Beralih antara tab Agent dan Weapon
function switchTab(tab) {
  currentTab = tab;
  currentFilter = 'ALL';
  
  document.getElementById('tabAgents').classList.toggle('active', tab === 'agents');
  document.getElementById('tabWeapons').classList.toggle('active', tab === 'weapons');
  
  document.getElementById('searchInput').value = '';
  renderFilters();
  renderGrid();
}

// Render tombol filter dinamis sesuai tab
function renderFilters() {
  const container = document.getElementById('filterTags');
  const filters = currentTab === 'agents'
    ? ['ALL', 'Duelist', 'Initiator', 'Controller', 'Sentinel']
    : ['ALL', 'Sidearms', 'SMGs', 'Shotguns', 'Rifles', 'Sniper', 'Heavy', 'Melee'];

  container.innerHTML = filters.map(f => `
    <button class="filter-btn ${f === currentFilter ? 'active' : ''}" onclick="setFilter('${f}')">
      ${f}
    </button>
  `).join('');
}

function setFilter(filter) {
  currentFilter = filter;
  renderFilters();
  renderGrid();
}

function handleSearch() {
  renderGrid();
}

// Render daftar card ke grid
function renderGrid() {
  const grid = document.getElementById('contentGrid');
  const search = document.getElementById('searchInput').value.trim().toLowerCase();

  if (currentTab === 'agents') {
    const list = agentsData.filter(agent => {
      const matchRole = currentFilter === 'ALL' || (agent.role && agent.role.displayName.toUpperCase() === currentFilter.toUpperCase());
      const matchSearch = agent.displayName.toLowerCase().includes(search) || (agent.description && agent.description.toLowerCase().includes(search));
      return matchRole && matchSearch;
    });

    grid.innerHTML = list.map(agent => `
      <div class="card" onclick="openAgentModal('${agent.uuid}')">
        <div class="card-img-wrap">
          ${agent.role && agent.role.displayIcon ? `<img src="${agent.role.displayIcon}" class="card-role-icon" alt="${agent.role.displayName}" />` : ''}
          <img src="${agent.displayIcon || ''}" alt="${agent.displayName}" loading="lazy" />
        </div>
        <div class="card-body">
          <div class="card-meta">${agent.role ? agent.role.displayName : 'Specialist'}</div>
          <div class="card-title">${agent.displayName}</div>
          <div class="card-desc">${agent.description || 'Data operasional rahasia.'}</div>
        </div>
      </div>
    `).join('');
  } else {
    const list = weaponsData.filter(wep => {
      const categoryName = (wep.shopData && wep.shopData.categoryText) 
        ? wep.shopData.categoryText 
        : (wep.category ? wep.category.replace('EEquippableCategory::', '') : '');
      const matchCategory = currentFilter === 'ALL' || categoryName.toLowerCase().includes(currentFilter.toLowerCase());
      const matchSearch = wep.displayName.toLowerCase().includes(search);
      return matchCategory && matchSearch;
    });

    grid.innerHTML = list.map(wep => {
      const cost = wep.shopData ? `¤ ${wep.shopData.cost}` : 'FREE';
      const cat = wep.shopData ? wep.shopData.categoryText : 'Melee';
      return `
        <div class="card" onclick="openWeaponModal('${wep.uuid}')">
          <div class="card-img-wrap">
            <img src="${wep.displayIcon || ''}" alt="${wep.displayName}" style="object-fit: contain; width: 85%;" loading="lazy" />
          </div>
          <div class="card-body">
            <div class="card-meta">${cat}</div>
            <div class="card-title">${wep.displayName}</div>
            <div class="badge-cost">${cost}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Modal Detail Agent
function openAgentModal(uuid) {
  const agent = agentsData.find(a => a.uuid === uuid);
  if (!agent) return;

  const abilitiesHtml = (agent.abilities || []).map(ab => `
    <div class="ability-item">
      ${ab.displayIcon ? `<img src="${ab.displayIcon}" alt="${ab.displayName}" />` : '<div style="width:36px;height:36px;background:var(--val-red)"></div>'}
      <div class="ability-info">
        <h4>${ab.displayName} [${ab.slot}]</h4>
        <p>${ab.description || 'Tidak ada deskripsi rinci.'}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-header">
      <img src="${agent.displayIcon}" alt="${agent.displayName}" />
      <div>
        <div class="card-meta">${agent.role ? agent.role.displayName : 'Specialist'}</div>
        <h2 style="font-family:'Rajdhani';font-size:2rem;text-transform:uppercase;">${agent.displayName}</h2>
        <p style="font-size:0.9rem;color:var(--val-sub);margin-top:4px;">${agent.description}</p>
      </div>
    </div>
    <h3 style="font-family:'Rajdhani';letter-spacing:1px;text-transform:uppercase;margin-bottom:0.5rem;">Tactical Abilities</h3>
    <div class="modal-abilities">${abilitiesHtml}</div>
  `;
  document.getElementById('detailModal').classList.add('open');
}

// Modal Detail Senjata
function openWeaponModal(uuid) {
  const wep = weaponsData.find(w => w.uuid === uuid);
  if (!wep) return;

  const stats = wep.weaponStats;
  const cost = wep.shopData ? `¤ ${wep.shopData.cost}` : 'Free';
  const cat = wep.shopData ? wep.shopData.categoryText : 'Melee';

  let statsHtml = '<p style="color:var(--val-sub)">Informasi balistik melee standar.</p>';
  if (stats) {
    const dmg = (stats.damageRanges && stats.damageRanges[0]) || {};
    statsHtml = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.9rem;">
        <div><strong>Fire Rate:</strong> ${stats.fireRate} rds/sec</div>
        <div><strong>Magazine:</strong> ${stats.magazineSize} rounds</div>
        <div><strong>Wall Penetration:</strong> ${stats.wallPenetration ? stats.wallPenetration.replace('EWallPenetrationDisplayType::', '') : 'Medium'}</div>
        <div><strong>Reload Time:</strong> ${stats.reloadTimeSeconds || 2.5}s</div>
      </div>
      ${dmg.headDamage ? `
        <div style="margin-top:1.5rem;background:var(--val-dark);padding:1rem;border-left:3px solid var(--val-accent);">
          <h4 style="font-family:'Rajdhani';margin-bottom:6px;">Damage Profile (0-${dmg.rangeEndMeters}m)</h4>
          <div>Head: <strong style="color:var(--val-red);">${dmg.headDamage}</strong> | Body: <strong>${dmg.bodyDamage}</strong> | Leg: <strong>${dmg.legDamage}</strong></div>
        </div>
      ` : ''}
    `;
  }

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-header">
      <img src="${wep.displayIcon}" style="width:140px;object-fit:contain;" alt="${wep.displayName}" />
      <div>
        <div class="card-meta">${cat} &bull; ${cost}</div>
        <h2 style="font-family:'Rajdhani';font-size:2rem;text-transform:uppercase;">${wep.displayName}</h2>
      </div>
    </div>
    <h3 style="font-family:'Rajdhani';letter-spacing:1px;text-transform:uppercase;margin-bottom:0.5rem;">Weapon Specifications</h3>
    ${statsHtml}
  `;
  document.getElementById('detailModal').classList.add('open');
}

// Handler Tutup Modal
function closeModal(e) {
  document.getElementById('detailModal').classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Jalankan inisialisasi saat script dimuat
init();