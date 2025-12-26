// js/load-footer.js
(function() {
    // Функция для загрузки футера
    function loadFooter() {
        const footerContainer = document.getElementById('footer-container');
        if (!footerContainer) return;
        
        // Определяем правильный путь к компоненту
        const isInPages = window.location.pathname.includes('/pages/');
        const footerPath = isInPages ? '../components/footer.html' : 'components/footer.html';
        
        fetch(footerPath)
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
