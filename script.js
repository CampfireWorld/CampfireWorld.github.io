// Переключение вкладок
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

// Переключение темы
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'campfire' ? 'purple' : 'campfire';
    
    root.setAttribute('data-theme', newTheme);
    document.getElementById('theme-btn').textContent = newTheme === 'campfire' ? '🌌' : '🔥';
}

// --- ФУНКЦИЯ ЗАГРУЗКИ СТАТИСТИКИ ---
async function fetchServerStatus() {
    const serverAddress = 'campfireworld.joinserver.ru'; // IP сервера
    const apiUrl = `https://api.mcstatus.io/v2/status/java/${serverAddress}`;

    try {
        const response = await fetch(apiUrl);
        
        // Если API вернуло ошибку (например, сервер оффлайн), обрабатываем это
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.online) {
            // 1. Обновляем онлайн
            document.getElementById('online-count').innerText = `${data.players.online} / ${data.players.max}`;
            
            // 2. Обновляем версию
            document.getElementById('server-version').innerText = data.version.name_clean || 'Неизвестно';
            
            // 3. Обновляем MOTD
            const motdElement = document.getElementById('server-motd');
            motdElement.innerHTML = data.motd.html || 'Описание отсутствует';

            // 4. Обновляем список игроков
            const listContainer = document.getElementById('player-list');
            listContainer.innerHTML = ''; // Очищаем контейнер

            if (data.players.list && data.players.list.length > 0) {
                data.players.list.forEach(player => {
                    // Создаём тег для игрока с его головой
                    const playerTag = document.createElement('div');
                    playerTag.className = 'player-tag';
                    
                    // Используем сервис mc-heads.net для получения головы игрока по нику
                    const headUrl = `https://mc-heads.net/avatar/${player.name_clean}/40`;
                    
                    playerTag.innerHTML = `
                        <img src="${headUrl}" alt="${player.name_clean}" class="player-head" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/40'">
                        <span>${player.name_clean}</span>
                    `;
                    
                    listContainer.appendChild(playerTag);
                });
            } else {
                listContainer.innerHTML = `<p style="color: var(--text-muted);">Сейчас на сервере никого нет. Стань первым!</p>`;
            }
        } else {
            // Если сервер оффлайн
            document.getElementById('online-count').innerText = 'Оффлайн';
            document.getElementById('server-version').innerText = '---';
            document.getElementById('server-motd').innerText = 'Сервер сейчас выключен или перезагружается.';
            document.getElementById('player-list').innerHTML = `<p style="color: var(--text-muted);">Сервер оффлайн. Заходи позже!</p>`;
        }
    } catch (error) {
        console.error("Ошибка при загрузке статуса сервера:", error);
        
        // Если произошла ошибка (например, недоступен API)
        document.getElementById('online-count').innerText = 'Ошибка';
        document.getElementById('server-version').innerText = 'Ошибка';
        document.getElementById('server-motd').innerText = 'Не удалось загрузить данные о сервере.';
        document.getElementById('player-list').innerHTML = `<p style="color: var(--text-muted);">Не удалось подключиться к API.</p>`;
    }
}

// --- ЗАПУСК 3D СКИНОВ И СТАТИСТИКИ ---
window.addEventListener("load", () => {
    // 1. Запуск 3D скинов
    if (typeof skinview3d !== 'undefined') {
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
                viewer.animation = null; // Отключаем анимацию
                viewer.camera.rotation.y = -0.5; // Легкий поворот
            } catch (e) {
                console.error("Ошибка при загрузке скина " + skinUrl, e);
            }
        };

        createSkin("skin-V", "V.png");
        createSkin("skin-R", "R.png");
        createSkin("skin-F", "F.png");
    }

    // 2. Запуск загрузки статистики
    fetchServerStatus();

    // 3. Обновление статистики каждые 30 секунд
    setInterval(fetchServerStatus, 30000);
});

// --- СКАЧИВАНИЕ ФАЙЛОВ С GOOGLE ДИСКА ---
function downloadBoth() {
    // Прямые ссылки на скачивание (uc?export=download + confirm=t для обхода вирусов)
    const modsUrl = 'https://drive.google.com/uc?export=download&id=1_I6Jn_HEwUl2innsJaAUp3Y3lZvd-Dv5&confirm=t';
    const packsUrl = 'https://drive.google.com/uc?export=download&id=1Jp3-ZgZlbtp8XTI4hfE8SafWFOVyC_VR&confirm=t';

    // Создаем невидимую ссылку для модов и "кликаем" по ней
    const linkMods = document.createElement('a');
    linkMods.href = modsUrl;
    linkMods.download = 'CWMods.zip'; // Имя файла при скачивании
    document.body.appendChild(linkMods);
    linkMods.click();
    document.body.removeChild(linkMods);

    // Ждем 1.5 секунды, чтобы браузер не заблокировал второе скачивание
    setTimeout(() => {
        const linkPacks = document.createElement('a');
        linkPacks.href = packsUrl;
        linkPacks.download = 'CWResourcepacks.zip';
        document.body.appendChild(linkPacks);
        linkPacks.click();
        document.body.removeChild(linkPacks);
    }, 1500);
}