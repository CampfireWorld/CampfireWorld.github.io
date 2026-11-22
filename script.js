// --- НАСТРОЙКИ API ---
const API_IP = '37.27.166.94';
const API_PORT = '8080';
const API_TOKEN = 'campfire_super_secret_token_2026';
const API_URL = `http://${API_IP}:${API_PORT}/api/v1/status`; 

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
    
    // Меняем тему (картинки переключатся сами через CSS)
    root.setAttribute('data-theme', newTheme);
    
    // Меняем иконку на кнопке
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
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const online = data.players?.online ?? 0;
        const max = data.players?.max ?? 20;
        document.getElementById('online-count').innerText = `${online} / ${max}`;

        document.getElementById('server-version').innerText = data.version || '1.21.11';

        let tps = 20.0;
        if (data.tps) {
            if (Array.isArray(data.tps)) {
                tps = data.tps[0];
            } else if (typeof data.tps === 'object') {
                tps = data.tps['1m'] || data.tps.oneMinute || 20.0;
            } else if (typeof data.tps === 'number') {
                tps = data.tps;
            }
        }
        
        const tpsElement = document.getElementById('tps-value');
        tpsElement.innerText = parseFloat(tps).toFixed(1);
        
        if (tps < 15.0) {
            tpsElement.style.color = '#ef4444';
        } else if (tps < 19.0) {
            tpsElement.style.color = '#eab308';
        } else {
            tpsElement.style.color = '#4ade80';
        }

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
        if (data.players && data.players.list) {
            playersList = data.players.list;
        }

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
// 3D СКИНЫ
// ==========================================
function initSkins() {
    if (typeof skinview3d === 'undefined') {
        console.warn("Библиотека skinview3d не загружена.");
        return;
    }

    const createSkin = (canvasId, skinUrl) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        try {
            const viewer = new skinview3d.SkinViewer({
                canvas: canvas,
                width: 150,
                height: 300,
                skin: skinUrl
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
    fetchServerStatus();
    setInterval(fetchServerStatus, 30000);
});