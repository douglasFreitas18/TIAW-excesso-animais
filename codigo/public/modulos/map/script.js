// URL da API JSONServer (ajuste conforme necessário)
const API_URL = 'http://localhost:3000/instituicoes';

// Inicialização do mapa com configuração azul
const map = L.map('map').setView([-19.9167, -43.9345], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors | ZooPet'
}).addTo(map);

let markers = [];
let currentInstitution = null;
let allInstitutions = [];

// Ícone customizado azul para os marcadores
const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Buscar dados do JSONServer
async function loadInstitutions() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao carregar dados do servidor');

    allInstitutions = await response.json();
    renderInstitutions(allInstitutions);
    populateCityFilter();
    console.log('✅ Instituições carregadas:', allInstitutions.length);
  } catch (error) {
    console.error('❌ Erro ao carregar instituições:', error);
    alert('Erro ao carregar dados. Certifique-se de que o JSONServer está rodando na porta 3000.\n\nComando: json-server --watch db.json --port 3000');
  }
}

// Renderizar instituições no mapa e na lista
function renderInstitutions(institutions) {
  // Limpar marcadores antigos
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // Limpar lista lateral
  const list = document.getElementById('institutionsList');
  list.innerHTML = '';

  // Atualizar estatísticas
  document.getElementById('totalInstitutions').textContent = institutions.length;

  if (institutions.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:#0066cc;font-weight:500;">Nenhuma instituição encontrada com os filtros aplicados</div>';
    return;
  }

  institutions.forEach(inst => {
    if (!inst.coordenadas) return;

    // Marcador no mapa
    const marker = L.marker(
      [inst.coordenadas.latitude, inst.coordenadas.longitude],
      { icon: blueIcon }
    )
      .addTo(map)
      .bindPopup(`
        <div class="popup-content">
          <div class="popup-title">${inst.nome}</div>
          <div class="popup-info">
            📍 ${inst.endereco.rua}, ${inst.endereco.numero}<br>
            ${inst.endereco.bairro} - ${inst.endereco.cidade}/${inst.endereco.estado}<br>
            📞 ${inst.telefone}
          </div>
        </div>
      `);

    marker.on('click', () => showDetail(inst));
    markers.push(marker);

    // Card na lista
    const card = document.createElement('div');
    card.className = 'institution-card';
    card.dataset.id = inst.id;
    card.innerHTML = `
      <div class="institution-name">${inst.nome}</div>
      <div class="institution-info">
        <div><strong>📍</strong> ${inst.endereco.cidade}/${inst.endereco.estado}</div>
        <div><strong>📞</strong> ${inst.telefone}</div>
      </div>
    `;
    card.onclick = () => {
      showDetail(inst);
      map.setView([inst.coordenadas.latitude, inst.coordenadas.longitude], 13);
      document.querySelectorAll('.institution-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    };
    list.appendChild(card);
  });

  // Ajustar mapa
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

// Mostrar detalhes
function showDetail(inst) {
  currentInstitution = inst;

  document.getElementById('detailName').textContent = inst.nome;
  document.getElementById('detailAddress').textContent =
    `${inst.endereco.rua}, ${inst.endereco.numero} - ${inst.endereco.bairro}, ${inst.endereco.cidade}/${inst.endereco.estado}`;
  document.getElementById('detailPhone').textContent = inst.telefone;
  document.getElementById('detailEmail').textContent = inst.email || '-';
  document.getElementById('detailSchedule').textContent = inst.horario || '-';
  document.getElementById('detailArea').textContent = inst.areaAtuacao || '-';

  document.getElementById('detailPanel').classList.add('active');
  document.getElementById('institutionsList').style.display = 'none';
}

// Fechar painel
function closeDetail() {
  document.getElementById('detailPanel').classList.remove('active');
  document.getElementById('institutionsList').style.display = 'block';
  currentInstitution = null;
  document.querySelectorAll('.institution-card').forEach(c => c.classList.remove('active'));
}

// Abrir rota no Google Maps
function openGoogleMaps() {
  if (!currentInstitution) return;
  const { latitude, longitude } = currentInstitution.coordenadas;
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
}

// Filtros
function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const stateFilter = document.getElementById('stateFilter').value;
  const cityFilter = document.getElementById('cityFilter').value;

  const filtered = allInstitutions.filter(inst => {
    const matchSearch =
      !searchTerm ||
      inst.endereco.cidade.toLowerCase().includes(searchTerm) ||
      inst.endereco.bairro.toLowerCase().includes(searchTerm) ||
      inst.nome.toLowerCase().includes(searchTerm);

    const matchState = !stateFilter || inst.endereco.estado === stateFilter;
    const matchCity = !cityFilter || inst.endereco.cidade === cityFilter;

    return matchSearch && matchState && matchCity;
  });

  renderInstitutions(filtered);
  document.getElementById('selectedState').textContent = stateFilter || 'Todas';
  document.getElementById('selectedCity').textContent = cityFilter || 'Todas';
}

// Popular cidades
function populateCityFilter() {
  const stateFilter = document.getElementById('stateFilter').value;
  const cityFilter = document.getElementById('cityFilter');

  const cities = [...new Set(
    allInstitutions
      .filter(inst => !stateFilter || inst.endereco.estado === stateFilter)
      .map(inst => inst.endereco.cidade)
  )].sort();

  cityFilter.innerHTML = '<option value="">Todas as Cidades</option>';
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('stateFilter').value = '';
  document.getElementById('cityFilter').value = '';
  populateCityFilter();
  applyFilters();
  closeDetail();
}

// Eventos
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('stateFilter').addEventListener('change', () => {
  populateCityFilter();
  applyFilters();
});
document.getElementById('cityFilter').addEventListener('change', applyFilters);

// Boot
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 ZooPet - Mapeamento de Zoonoses iniciado');
  loadInstitutions();
});
