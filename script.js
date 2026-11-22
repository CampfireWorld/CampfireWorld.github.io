// --- НАСТРОЙКИ API ---
const API_IP = '37.27.166.94';
const API_PORT = '8080';
const API_TOKEN = 'campfire_super_secret_token_2026';
const API_URL = `http://${API_IP}:${API_PORT}/api/v1/status`; 

// ==========================================
// КОПИРОВАНИЕ IP (СО СЛУЧАЙНЫМ РАЗБРОСОМ)
// ==========================================
function copyToClipboard(event, text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.innerText = 'Скопировано!';
        
        // Случайный разброс вокруг курсора (-30 до +30 пикселей по X, -20 до +20 по Y)
        const randomX = (Math.random() - 0.5) * 60;
        const randomY = (Math.random() - 0.5) * 40;
        
        toast.style.left = (event.clientX + randomX) + 'px';
        toast.style.top = (event.clientY + randomY) + 'px';
        
        document.body.appendChild(toast);
        
        // Удаляем элемент после окончания CSS-анимации (1.5 сек)
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

    // 1. Сцена, камера, рендерер
    const scene = new THREE.Scene();
    
    // Настройка камеры (FOV, Aspect, Near, Far)
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 4); // Отодвигаем камеру

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. Освещение (чтобы модель не была черной)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 3. Загрузка модели
    const loader = new THREE.GLTFLoader();
    // ВАЖНО: Файл должен называться fox.glb и лежать рядом с index.html
    loader.load('fox.glb', function (gltf) {
        const model = gltf.scene;
        
        // Центрируем модель и подгоняем масштаб (зависит от исходного размера модели)
        // Если модель слишком большая/маленькая, измени цифру в scale
        model.scale.set(1, 1, 1); 
        model.position.y = -0.5;
        
        scene.add(model);

        // Анимация вращения
        function animate() {
            requestAnimationFrame(animate);
            // Модель медленно вращается по оси Y
            model.rotation.y += 0.005; 
            renderer.render(scene, camera);
        }
        animate();

    }, undefined, function (error) {
        console.error('Ошибка загрузки модели лисы:', error);
        // Если модели нет, показываем смайлик-заглушку
        container.innerHTML = '<div style="font-size: 60px; text-align: center; line-height: 120px;">🦊</div>';
    });

    // 4. Клик по лисе
    const phrases = [
        "Фыр", "фыр", "ФЫР", "Фыр!", "Фырк", "фыр~", "Фыр?", "ФЫРК!", 
        "фыр...", "Фыр-фыр", "Фырк~", "фыр!", "Фырк?", "ФЫР...", "фыр-фыр~", 
        "Фыр-фыр!", "Фыр :3", "фыр ;3"
    ];

    container.addEventListener('click', (e) => {
        // Добавляем класс тряски
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 400);

        // Создаем текст
        const phraseEl = document.createElement('div');
        phraseEl.className = 'fox-phrase';
        phraseEl.innerText = phrases[Math.floor(Math.random() * phrases.length)];

        // Случайная позиция вокруг курсора ВНУТРИ контейнера
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left + (Math.random() - 0.5) * 40;
        const y = e.clientY - rect.top + (Math.random() - 0.5) * 40;

        phraseEl.style.left = x + 'px';
        phraseEl.style.top = y + 'px';
        
        container.appendChild(phraseEl);

        // Удаляем после завершения анимации
        setTimeout(() => {
            if (phraseEl.parentNode) phraseEl.parentNode.removeChild(phraseEl);
        }, 1200);
    });

    // Обновление размера при ресайзе окна
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
// ЗАГРУЗКА СТАТИСТИКИ С СЕРВЕРА
// ==========================================
async function fetchServerStatus() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const online = data.players?.online ?? 0;
        const max = data.players?.max ?? 20;
        document.getElementById('online-count').innerText = `${online} / ${max}`;

        document.getElementById('server-version').innerText = data.version || '1.21.11';

        let tps = 20.0;
        if (data.tps) {
            if (Array.isArray(data.tps)) tps = data.tps[0];
            else if (typeof data.tps === 'object') tps = data.tps['1m'] || data.tps.oneMinute || 20.0;
            else if (typeof data.tps === 'number') tps = data.tps;
        }
        
        const tpsElement = document.getElementById('tps-value');
        tpsElement.innerText = parseFloat(tps).toFixed(1);
        
        if (tps < 15.0) tpsElement.style.color = '#ef4444';
        else if (tps < 19.0) tpsElement.style.color = '#eab308';
        else tpsElement.style.color = '#4ade80';

        const uptimeSeconds = data.uptime || 0;
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        let uptimeText = '';
        if (days > 0) uptimeText += `${days}д `;
        if (hours > 0 || days > 0) uptimeText += `${hours}ч `;
        uptimeText += `${minutes}м`;
        
        document.getElementById('uptime').innerText = uptimeText;

        const listContainer = document.getElementById('player-list');
        listContainer.innerHTML = ''; 
        
        let playersList = [];
        if (data.players && data.players.list) playersList = data.players.list;

        if (playersList.length > 0) {
            playersList.forEach(player => {
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
    initFox(); // Запуск лисы
    fetchServerStatus();
    setInterval(fetchServerStatus, 30000);
});