document.addEventListener('DOMContentLoaded', function() {
    // Код для фильтрации заказов
    var statusFilterInput = document.getElementById('statusFilterInput');
    var ordersContainer = document.getElementById('ordersContainer');
    var orders = JSON.parse(document.getElementById('jsonOrders').value);
    // Находим форму по ее селектору или id
    var form = document.querySelector('form[action="/logout"]');

    // Получаем скрытое поле csrf
    var csrfInput = form.querySelector('input[name="_csrf"]');

    // Получаем значение csrfToken
    var csrfToken = csrfInput.value;

    var isRoleInput = document.getElementById('isRole');
    var role = isRoleInput.value; // Получаем значение параметра editing

    var userIdInput = document.getElementById('userId');
    var userId = userIdInput.value; // Получаем значение параметра editing


    // Функция для фильтрации заказов по статусу
    function filterOrdersByStatus(status) {
        ordersContainer.innerHTML = ''; // Очистка контейнера перед добавлением новых заказов

        orders.reverse().forEach(order => {
            if (status === '' || order.status === status) {
                if(order.status !== `Обрабатывается`){
                // Создание элемента заказа
                var orderElement = document.createElement('div');
                orderElement.classList.add('order'); // Добавляем класс 'order' для применения стилей
        
                // Создание заголовка с номером заказа
                var orderId = document.createElement('h1');
                orderId.textContent = 'Номер заказа: ' + order.id;
                orderElement.appendChild(orderId);
        
                // Создание элемента со статусом заказа
                var orderStatus = document.createElement('h2');
                orderStatus.textContent = 'Статус: ' + order.status;
                orderElement.appendChild(orderStatus);

                const createDate = new Date(order.create);

                var year = createDate.getFullYear();
                var month = ('0' + (createDate.getMonth() + 1)).slice(-2);
                var day = ('0' + createDate.getDate()).slice(-2);
                var hours = ('0' + createDate.getHours()).slice(-2);
                var minutes = ('0' + createDate.getMinutes()).slice(-2);
                var seconds = ('0' + createDate.getSeconds()).slice(-2);

                const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}`;
        
                // Создание элемента с датой и временем создания заказа
                var orderCreate = document.createElement('h2');
                orderCreate.textContent = 'Дата и время создания: ' + formattedDate;
                orderElement.appendChild(orderCreate);

                const updateDate = new Date(order.update);

                year = updateDate.getFullYear();
                month = ('0' + (updateDate.getMonth() + 1)).slice(-2);
                day = ('0' + updateDate.getDate()).slice(-2);
                hours = ('0' + updateDate.getHours()).slice(-2);
                minutes = ('0' + updateDate.getMinutes()).slice(-2);
                seconds = ('0' + updateDate.getSeconds()).slice(-2);

                const formattedUpDate = `${day}.${month}.${year} ${hours}:${minutes}`;
        
                // Создание элемента с датой и временем обновления заказа
                var orderUpdate = document.createElement('h2');
                orderUpdate.textContent = 'Дата и время обновления: ' + formattedUpDate;
                orderElement.appendChild(orderUpdate);
        
                // Создание ссылки для деталей заказа
                var detailsLink = document.createElement('a');
                detailsLink.href = '/orders/' + order.id;
                detailsLink.textContent = 'Детали заказа';
                detailsLink.classList.add('btn'); // Добавляем класс для кнопки
                orderElement.appendChild(detailsLink);

                console.log(role);
                if(formattedDate === formattedUpDate && role != `Продавец`){
                // Добавление формы для принятия заказа
                var acceptForm = document.createElement('form');
                acceptForm.action = '/create-order-master';
                acceptForm.method = 'POST';
                // Добавляем скрытое поле с orderId
                acceptForm.innerHTML = '<input type="hidden" value="' + order.id + '" name="orderId"><input type="hidden" value="' + csrfToken + '" name="_csrf">';
                // Добавляем кнопку для принятия заказа
                var acceptButton = document.createElement('button');
                acceptButton.textContent = 'Принять заказ';
                acceptButton.classList.add('btn'); // Добавляем классы для стилей кнопки
                acceptButton.type = 'submit';
                acceptForm.appendChild(acceptButton);
                orderElement.appendChild(acceptForm);
                }
                
                if(formattedDate === formattedUpDate && userId == order.userId){
                    // Добавление формы для удаления заказа
                var acceptForm = document.createElement('form');
                acceptForm.action = '/orders-delete';
                acceptForm.method = 'POST';
                // Добавляем скрытое поле с orderId
                acceptForm.innerHTML = '<input type="hidden" value="' + order.id + '" name="orderId"><input type="hidden" value="' + csrfToken + '" name="_csrf">';
               
                var acceptButton = document.createElement('button');
                acceptButton.textContent = 'Удалить';
                acceptButton.classList.add('btn', 'danger'); // Добавляем классы для стилей кнопки
                acceptButton.type = 'submit';
                acceptForm.appendChild(acceptButton);
                orderElement.appendChild(acceptForm);
                }
        
                // Добавление элемента заказа в контейнер
                ordersContainer.appendChild(orderElement);
            }
            }
        });
        
    }

    // Вызываем функцию фильтрации при загрузке страницы с установленным значением "Все статусы"
    filterOrdersByStatus('');

    // Добавление обработчика события для фильтра
    statusFilterInput.addEventListener('change', function() {
        var selectedStatus = this.value;
        filterOrdersByStatus(selectedStatus);
    });
});
