// js/load-footer.js (упрощенная версия)
(function() {
    // Функция для загрузки футера
    function loadFooter() {
        const footerContainer = document.getElementById('footer-container');
        if (!footerContainer) return;
        
        // Используем абсолютный путь
        fetch('/components/footer.html')
            .then(response => {
                if (!response.ok) throw new Error('Не удалось загрузить футер');
                return response.text();
            })
            .then(html => {
                footerContainer.innerHTML = html;
                console.log('Футер загружен');
            })
            .catch(error => {
                console.error('Ошибка загрузки футера:', error);
                footerContainer.innerHTML = '<p>Футер временно недоступен</p>';
            });
    }
    
    // Загружаем футер при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFooter);
    } else {
        loadFooter();
    }
})();
