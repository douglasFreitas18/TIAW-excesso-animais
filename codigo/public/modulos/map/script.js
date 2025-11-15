// ==================== VARIÁVEIS GLOBAIS ====================
let map;
let currentLocation = null;
let addedAnimals = [];
let reports = [];
let markers = [];

// ==================== ÍCONES LEAFLET ====================
const reportIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ==================== INICIALIZAÇÃO ====================
function initMap() {
    map = L.map('map').setView([-19.9167, -43.9345], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap | ZooPet'
    }).addTo(map);
    loadReports();
}

// ==================== NAVEGAÇÃO ENTRE VIEWS ====================
function showView(viewName) {
    const btnMap = document.getElementById('btnViewMap');
    const btnList = document.getElementById('btnViewList');
    const viewMap = document.getElementById('viewMap');
    const viewList = document.getElementById('viewList');
    
    btnMap.classList.remove('active');
    btnList.classList.remove('active');
    viewMap.classList.remove('active');
    viewList.classList.remove('active');
    
    if (viewName === 'map') {
        btnMap.classList.add('active');
        viewMap.classList.add('active');
        setTimeout(() => map.invalidateSize(), 100);
    } else if (viewName === 'list') {
        btnList.classList.add('active');
        viewList.classList.add('active');
        renderReportsList();
    }
}

// ==================== MODAL ====================
function openReportModal() {
    document.getElementById('reportModal').classList.add('active');
    nextStep(1);
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('active');
    resetForm();
}

// ==================== NAVEGAÇÃO ENTRE STEPS ====================
function nextStep(step) {
    if (step === 2 && currentLocation === null) {
        const bairro = document.getElementById('bairro').value.trim();
        const cidade = document.getElementById('cidade').value.trim();
        const estado = document.getElementById('estado').value;
        
        if (!bairro || !cidade || !estado) {
            alert('Por favor, preencha os campos obrigatórios de localização.');
            return;
        }
        
        currentLocation = {
            endereco: document.getElementById('endereco').value.trim() || 'Não informado',
            bairro: bairro,
            cidade: cidade,
            estado: estado,
            latitude: -19.9167 + (Math.random() - 0.5) * 0.1,
            longitude: -43.9345 + (Math.random() - 0.5) * 0.1
        };
    }

    if (step === 3 && addedAnimals.length === 0) {
        alert('Por favor, adicione pelo menos um animal antes de continuar.');
        return;
    }

    const steps = ['step1', 'step2', 'step3'];
    steps.forEach((stepId, index) => {
        const stepEl = document.getElementById(stepId);
        stepEl.classList.remove('active', 'completed');
        if (index + 1 === step) {
            stepEl.classList.add('active');
        } else if (index + 1 < step) {
            stepEl.classList.add('completed');
        }
    });

    document.getElementById('stepLocation').style.display = 'none';
    document.getElementById('stepAnimals').style.display = 'none';
    document.getElementById('stepConfirm').style.display = 'none';
    
    if (step === 1) document.getElementById('stepLocation').style.display = 'block';
    else if (step === 2) {
        document.getElementById('stepAnimals').style.display = 'block';
        updateAnimalsDisplay();
    } else if (step === 3) {
        document.getElementById('stepConfirm').style.display = 'block';
        updateConfirmation();
    }
}

// ==================== GEOLOCALIZAÇÃO ====================
function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    endereco: 'Localização atual',
                    bairro: 'A definir',
                    cidade: 'A definir',
                    estado: 'MG'
                };
                alert('✅ Localização obtida com sucesso!');
                document.getElementById('bairro').value = currentLocation.bairro;
                document.getElementById('cidade').value = currentLocation.cidade;
                document.getElementById('estado').value = currentLocation.estado;
            },
            (error) => {
                alert('❌ Não foi possível obter sua localização.');
                console.error('Erro de geolocalização:', error);
            }
        );
    } else {
        alert('❌ Seu navegador não suporta geolocalização.');
    }
}

// ==================== GERENCIAR ANIMAIS ====================
function addAnimal() {
    const especie = document.getElementById('especie').value;
    const porte = document.getElementById('porte').value;
    const corPrimaria = document.getElementById('corPrimaria').value;
    const corSecundaria = document.getElementById('corSecundaria').value;
    const sexo = document.getElementById('sexo').value;
    const observacoes = document.getElementById('observacoes').value.trim();

    if (!especie || !porte || !corPrimaria) {
        alert('Por favor, preencha os campos obrigatórios.');
        return;
    }

    const animal = {
        id: Date.now(),
        especie,
        porte,
        corPrimaria,
        corSecundaria: corSecundaria || 'Nenhuma',
        sexo: sexo || 'Não identificado',
        observacoes: observacoes || 'Sem observações'
    };

    addedAnimals.push(animal);
    updateAnimalsDisplay();
    clearAnimalForm();
    alert('✅ Animal adicionado com sucesso!');
}

function removeAnimal(id) {
    addedAnimals = addedAnimals.filter(a => a.id !== id);
    updateAnimalsDisplay();
}

function updateAnimalsDisplay() {
    const container = document.getElementById('animalsContainer');
    const count = document.getElementById('animalCount');
    count.textContent = addedAnimals.length;

    if (addedAnimals.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum animal adicionado ainda</div>';
        return;
    }

    container.innerHTML = addedAnimals.map(animal => `
        <div class="animal-item">
            <div class="animal-info">
                <strong>${animal.especie} ${animal.porte}</strong>
                <span>Cores: ${animal.corPrimaria}${animal.corSecundaria !== 'Nenhuma' ? ' / ' + animal.corSecundaria : ''} | Sexo: ${animal.sexo}</span>
            </div>
            <button class="btn-remove" onclick="removeAnimal(${animal.id})">🗑️</button>
        </div>
    `).join('');
}

function clearAnimalForm() {
    document.getElementById('especie').value = '';
    document.getElementById('porte').value = '';
    document.getElementById('corPrimaria').value = '';
    document.getElementById('corSecundaria').value = '';
    document.getElementById('sexo').value = '';
    document.getElementById('observacoes').value = '';
}

// ==================== CONFIRMAÇÃO ====================
function updateConfirmation() {
    document.getElementById('confirmLocation').textContent = 
        `${currentLocation.endereco}, ${currentLocation.bairro}, ${currentLocation.cidade}/${currentLocation.estado}`;
    
    document.getElementById('confirmAnimalCount').textContent = addedAnimals.length;
    
    const confirmContainer = document.getElementById('confirmAnimalsContainer');
    confirmContainer.innerHTML = addedAnimals.map(animal => `
        <div class="animal-item">
            <div class="animal-info">
                <strong>${animal.especie} ${animal.porte}</strong>
                <span>Cores: ${animal.corPrimaria}${animal.corSecundaria !== 'Nenhuma' ? ' / ' + animal.corSecundaria : ''}</span><br>
                <span>Sexo: ${animal.sexo}</span><br>
                <span style="font-style: italic;">${animal.observacoes}</span>
            </div>
        </div>
    `).join('');
}

// ==================== ENVIAR REPORT ====================
function submitReport() {
    const report = {
        id: Date.now(),
        data: new Date().toISOString(),
        localizacao: currentLocation,
        animais: [...addedAnimals],
        status: 'ativo'
    };

    reports.push(report);
    const marker = L.marker([currentLocation.latitude, currentLocation.longitude], { icon: reportIcon })
        .addTo(map)
        .bindPopup(`
            <div class="popup-content">
                <div class="popup-title">🐾 Avistamento Reportado</div>
                <div class="popup-info">
                    📍 ${currentLocation.bairro}, ${currentLocation.cidade}/${currentLocation.estado}<br>
                    🐕 ${addedAnimals.length} animal(is)<br>
                    📅 ${new Date().toLocaleDateString('pt-BR')}
                </div>
            </div>
        `);
    
    markers.push(marker);
    localStorage.setItem('zoopet_reports', JSON.stringify(reports));
    
    const successMsg = document.getElementById('successMessage');
    successMsg.classList.add('show');
    setTimeout(() => successMsg.classList.remove('show'), 3000);
    
    setTimeout(() => {
        closeReportModal();
        map.setView([currentLocation.latitude, currentLocation.longitude], 15);
    }, 2000);
}

// ==================== RESET FORM ====================
function resetForm() {
    currentLocation = null;
    addedAnimals = [];
    document.getElementById('endereco').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('estado').value = '';
    clearAnimalForm();
    updateAnimalsDisplay();
}

// ==================== CARREGAR REPORTS ====================
function loadReports() {
    const saved = localStorage.getItem('zoopet_reports');
    if (saved) {
        reports = JSON.parse(saved);
        reports.forEach(report => {
            const marker = L.marker([report.localizacao.latitude, report.localizacao.longitude], { icon: reportIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="popup-content">
                        <div class="popup-title">🐾 Avistamento Reportado</div>
                        <div class="popup-info">
                            📍 ${report.localizacao.bairro}, ${report.localizacao.cidade}/${report.localizacao.estado}<br>
                            🐕 ${report.animais.length} animal(is)<br>
                            📅 ${new Date(report.data).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                `);
            markers.push(marker);
        });
    }
}

// ==================== RENDERIZAR LISTA ====================
function renderReportsList() {
    const container = document.getElementById('reportsList');
    if (reports.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 60px;">Você ainda não fez nenhum reporte.</div>';
        return;
    }

    container.innerHTML = reports.map(report => `
        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #0066cc; margin-bottom: 15px;">
            <h3 style="color: #0066cc;">📍 ${report.localizacao.cidade}/${report.localizacao.estado}</h3>
            <p style="color: #666;">${report.localizacao.bairro} - ${new Date(report.data).toLocaleDateString('pt-BR')}</p>
            <div style="background: #f0f8ff; padding: 10px; border-radius: 8px;">
                ${report.animais.map(animal => `
                    <div style="border-left: 4px solid #ff6b35; margin-bottom: 8px; padding: 6px;">
                        <strong style="color:#0066cc;">${animal.especie} ${animal.porte}</strong><br>
                        <span style="color:#555;">🎨 ${animal.corPrimaria} ${animal.corSecundaria !== 'Nenhuma' ? '/ ' + animal.corSecundaria : ''}</span><br>
                        <span style="color:#777;">⚧ ${animal.sexo}</span><br>
                        <span style="font-style:italic;">${animal.observacoes}</span>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" style="margin-top:10px;" onclick="viewReportOnMap(${report.id})">🗺️ Ver no Mapa</button>
            <button class="btn-remove" onclick="deleteReport(${report.id})">🗑️ Excluir</button>
        </div>
    `).join('');
}

// ==================== VER REPORT NO MAPA ====================
function viewReportOnMap(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (report) {
        showView('map');
        setTimeout(() => {
            map.setView([report.localizacao.latitude, report.localizacao.longitude], 16);
        }, 100);
    }
}

// ==================== EXCLUIR REPORT ====================
function deleteReport(reportId) {
    if (!confirm('Tem certeza que deseja excluir este reporte?')) return;
    reports = reports.filter(r => r.id !== reportId);
    localStorage.setItem('zoopet_reports', JSON.stringify(reports));
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    loadReports();
    renderReportsList();
    alert('✅ Reporte excluído com sucesso!');
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    document.getElementById('btnViewMap').addEventListener('click', () => showView('map'));
    document.getElementById('btnViewList').addEventListener('click', () => showView('list'));
    document.getElementById('reportFab').addEventListener('click', openReportModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeReportModal);
    document.getElementById('btnNextStep2').addEventListener('click', () => nextStep(2));
    document.getElementById('btnBackStep1').addEventListener('click', () => nextStep(1));
    document.getElementById('btnNextStep3').addEventListener('click', () => nextStep(3));
    document.getElementById('btnBackStep2').addEventListener('click', () => nextStep(2));
    document.getElementById('btnGetLocation').addEventListener('click', getMyLocation);
    document.getElementById('btnAddAnimal').addEventListener('click', addAnimal);
    document.getElementById('btnSubmitReport').addEventListener('click', submitReport);
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('reportModal');
        if (event.target === modal) closeReportModal();
    });
});
