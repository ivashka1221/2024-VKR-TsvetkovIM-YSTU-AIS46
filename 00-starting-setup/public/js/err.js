// modal.js

// Получение модального окна
var modal = document.getElementById("errorModal");

// Получение кнопки закрытия модального окна
var closeButton = document.getElementsByClassName("close")[0];

// При клике на кнопку закрытия модального окна скрыть его
closeButton.onclick = function() {
    modal.style.display = "none";
}

// Показать модальное окно при загрузке страницы
window.onload = function() {
    modal.style.display = "block";
}
