// --- НАСТРОЙКИ API ---
const API_IP = '37.27.166.94';
const API_PORT = '25532';
const API_TOKEN = '2H-0s6mmf3ZAsJAenQaHV_CjjAzo0CJTSRt_dixOIK8';
const API_BASE = `http://${API_IP}:${API_PORT}/api`; 

// ==========================================
// КОПИРОВАНИЕ IP (СО СЛУЧАЙНЫМ РАЗБРОСОМ)
// ==========================================
function copyToClipboard(event, text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.innerText = 'Скопировано!';
        
        const randomX = (Math.random() - 0.5) * 60;
        const randomY = (Math.random() - 0.5) * 40;
        
        toast.style.left = (event.clientX + randomX) + 'px';
        toast.style.top = (event.clientY + randomY) + 'px';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 1500);
        
    }).catch(err => {
        console.error('Ошибка при копировании: ', err);
    });
}

// ==========================================
// 3D ЛИСА (THREE.JS)
// ==========================================
function initFox() {
    const container = document.getElementById('fox-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const loader = new THREE.GLTFLoader();
    
    if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
        loader.setDRACOLoader(dracoLoader);
    }

    loader.load('./fox.glb', function (gltf) {
        const model = gltf.scene;
        
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        model.position.x += (model.position.x - center.x);
        model.position.y += (model.position.y - center.y);
        model.position.z += (model.position.z - center.z);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.set(scale, scale, scale);

        scene.add(model);

        camera.position.set(0, 0, 3); 
        camera.lookAt(0, 0, 0);

        function animate() {
            requestAnimationFrame(animate);
            model.rotation.y += 0.005; 
            renderer.render(scene, camera);
        }
        animate();

    }, 
    undefined, 
    function (error) {
        console.error('ОШИБКА ЗАГРУЗКИ МОДЕЛИ:', error);
        container.innerHTML = '<div style="font-size: 60px; text-align: center; line-height: 120px;" title="Ошибка: модель не загрузилась">🦊</div>';
    });

    const phrases = [
        "Фыр", "фыр", "ФЫР", "Фыр!", "Фырк", "фыр~", "Фыр?", "ФЫРК!", 
        "фыр...", "Фыр-фыр", "Фырк~", "фыр!", "Фырк?", "ФЫР...", "фыр-фыр~", 
        "Фыр-фыр!", "Фыр :3", "фыр ;3"
    ];

    container.addEventListener('click', (e) => {
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 400);

        const phraseEl = document.createElement('div');
        phraseEl.className = 'fox-phrase';
        phraseEl.innerText = phrases[Math.floor(Math.random() * phrases.length)];

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left + (Math.random() - 0.5) * 40;
        const y = e.clientY - rect.top + (Math.random() - 0.5) * 40;

        phraseEl.style.left = x + 'px';
        phraseEl.style.top = y + 'px';
        
        container.appendChild(phraseEl);

        setTimeout(() => {
            if (phraseEl.parentNode) phraseEl.parentNode.removeChild(phraseEl);
        }, 1200);
    });

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// ==========================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК И ТЕМ
// ==========================================
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if(btn.classList.contains('nav-btn')) {
        btn.classList.add('active');
    } else {
        document.querySelectorAll('.nav-btn').forEach(b => {
            if(b.innerText.includes(tabId === 'home' ? 'Главная' : 'О проекте')) b.classList.add('active');
        });
    }
}

function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'campfire' ? 'purple' : 'campfire';
    root.setAttribute('data-theme', newTheme);
    
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.textContent = newTheme === 'campfire' ? '🌌' : '🔥';
    }
}

// ==========================================
// ЗАГРУЗКА СТАТИСТИКИ С СЕРВЕРА (ELEMENTRIX API)
// ==========================================
async function fetchServerStatus() {
    try {
        // Запрашиваем все нужные данные ОДНОВРЕМЕННО для скорости
        const headers = { 'Authorization': `Bearer ${API_TOKEN}` };
        
        const [statusRes, perfRes, playersRes] = await Promise.all([
            fetch(`${API_BASE}/status`, { headers }),
            fetch(`${API_BASE}/performance`, { headers }),
            fetch(`${API_BASE}/players`, { headers })
        ]);

        if (!statusRes.ok || !perfRes.ok || !playersRes.ok) {
            throw new Error(`HTTP error! Status: ${statusRes.status}`);
        }

        const statusData = await statusRes.json();
        const perfData = await perfRes.json();
        const playersData = await playersRes.json();

        // Выведем данные в консоль, чтобы ты мог посмотреть, как они называются, если вдруг что-то не совпадет
        console.log("API Status:", statusData);
        console.log("API Performance:", perfData);
        console.log("API Players:", playersData);

        // 1. ОНЛАЙН (пытаемся найти в разных возможных ключах)
        const online = statusData.online ?? statusData.players?.online ?? statusData.playersOnline ?? 0;
        const max = statusData.max ?? statusData.players?.max ?? statusData.playersMax ?? 20;
        document.getElementById('online-count').innerText = `${online} / ${max}`;

        // 2. ВЕРСИЯ
        document.getElementById('server-version').innerText = statusData.version || statusData.serverVersion || '1.21.11';

        // 3. TPS (TPS обычно приходит в performance)
        let tps = 20.0;
        const rawTps = perfData.tps || perfData.TPS;
        if (rawTps) {
            if (Array.isArray(rawTps)) tps = rawTps[0]; // Берем за 1 минуту
            else if (typeof rawTps === 'object') tps = rawTps['1m'] || rawTps.oneMinute || 20.0;
            else if (typeof rawTps === 'number') tps = rawTps;
        }
        
        const tpsElement = document.getElementById('tps-value');
        tpsElement.innerText = parseFloat(tps).toFixed(1);
        
        if (tps < 15.0) tpsElement.style.color = '#ef4444';
        else if (tps < 19.0) tpsElement.style.color = '#eab308';
        else tpsElement.style.color = '#4ade80';

        // 4. АПТАЙМ (обычно в status, в секундах)
        const uptimeSeconds = statusData.uptime || statusData.uptimeSeconds || 0;
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        let uptimeText = '';
        if (days > 0) uptimeText += `${days}д `;
        if (hours > 0 || days > 0) uptimeText += `${hours}ч `;
        uptimeText += `${minutes}м`;
        
        document.getElementById('uptime').innerText = uptimeText || 'Только что';

        // 5. СПИСОК ИГРОКОВ
        const listContainer = document.getElementById('player-list');
        listContainer.innerHTML = ''; 
        
        // API может возвращать массив как есть, или внутри объекта
        let playersList = Array.isArray(playersData) ? playersData : (playersData.players || playersData.list || []);

        if (playersList.length > 0) {
            playersList.forEach(player => {
                // Имя может быть строкой или объектом {name: "..."}
                const playerName = typeof player === 'string' ? player : (player.name || player.username);
                if (!playerName) return;

                const playerTag = document.createElement('div');
                playerTag.className = 'player-tag';
                const headUrl = `https://mc-heads.net/avatar/${playerName}/40`;
                
                playerTag.innerHTML = `
                    <img src="${headUrl}" alt="${playerName}" class="player-head" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/40'">
                    <span>${playerName}</span>
                `;
                listContainer.appendChild(playerTag);
            });
        } else {
            listContainer.innerHTML = `<p style="color: var(--text-muted);">Сейчас на сервере никого нет. Стань первым!</p>`;
        }

    } catch (error) {
        console.error("Ошибка при загрузке статуса с сервера:", error);
        document.getElementById('online-count').innerText = 'Оффлайн';
        document.getElementById('tps-value').innerText = '--';
        document.getElementById('tps-value').style.color = 'var(--text-muted)';
        document.getElementById('uptime').innerText = 'Нет связи';
        document.getElementById('player-list').innerHTML = `<p style="color: var(--text-muted);">Не удалось получить данные от сервера. Возможно, он выключен или API заблокировано.</p>`;
    }
}

// ==========================================
// 3D СКИНЫ КОМАНДЫ
// ==========================================
function initSkins() {
    if (typeof skinview3d === 'undefined') return;
    const createSkin = (canvasId, skinUrl) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        try {
            const viewer = new skinview3d.SkinViewer({
                canvas: canvas, width: 150, height: 300, skin: skinUrl
            });
            viewer.animation = null; 
            viewer.camera.rotation.y = -0.5; 
        } catch (e) {
            console.error("Ошибка скина " + skinUrl, e);
        }
    };
    createSkin("skin-V", "V.png");
    createSkin("skin-R", "R.png");
    createSkin("skin-F", "F.png");
}

// ==========================================
// ЗАПУСК
// ==========================================
window.addEventListener("load", () => {
    initSkins();
    initFox(); 
    fetchServerStatus();
    setInterval(fetchServerStatus, 30000); // Обновление каждые 30 сек
});