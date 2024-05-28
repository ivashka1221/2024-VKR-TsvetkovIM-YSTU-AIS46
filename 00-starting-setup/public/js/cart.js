const toggleFormButton = document.getElementById('toggleFormButton');
const productForm = document.getElementById('productForm');

toggleFormButton.addEventListener('click', function() {
    if (productForm.classList.contains('hidden')) {
        productForm.classList.remove('hidden');
        toggleFormButton.textContent = 'Закрыть форму для заготовок';
    } else {
        productForm.classList.add('hidden');
        toggleFormButton.textContent = 'Открыть форму для заготовок';
    }
});

    // Проверяем наличие параметра editing в URL
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var editing = urlParams.get('edit');

    // Если параметр editing равен 'true' или '1', отображаем форму
    if (editing === 'true' || editing === '1') {
        productForm.classList.remove('hidden');
        toggleFormButton.textContent = 'Закрыть форму для заготовок';
    }




