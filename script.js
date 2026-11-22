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

// Запуск 3D скинов
window.addEventListener("load", () => {
    // Проверка, загрузилась ли библиотека
    if (typeof skinview3d === 'undefined') {
        console.error("Библиотека skinview3d не загрузилась!");
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
            
            // Отключаем анимацию ходьбы/вращения, чтобы просто стоял
            viewer.animation = null; 
            
            // Слегка поворачиваем, чтобы скин не смотрел идеально в камеру (как на namemc)
            viewer.camera.rotation.y = -0.5; 
        } catch (e) {
            console.error("Ошибка при загрузке скина " + skinUrl, e);
        }
    };

    // Запускаем для локальных файлов
    createSkin("skin-V", "V.png");
    createSkin("skin-R", "R.png");
    createSkin("skin-F", "F.png");

    document.getElementById('online-count').innerText = "Скоро...";
});