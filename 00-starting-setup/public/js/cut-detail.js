observeContainerResize();

let prevWidth = null;
let prevHeight = null;

function getContent(newWidth, newHeight){
  var windowHeight = window.innerHeight;
  var jsonMainString = document.getElementById('jsonMain').value;
  var jsonCutsString = document.getElementById('jsonCuts').value;

  var container = document.getElementById('materialMap');
  container.innerHTML = '';

  const widthGlobal = newWidth - 60;
  const heightGlobal = windowHeight - 60;

  var main = JSON.parse(jsonMainString);
  var cuts = JSON.parse(jsonCutsString);

  const coefW = widthGlobal / main[0].width;
  const coefH = heightGlobal / main[0].height

  const mainSheetCount = main[0].count;

  for (var i = 0; i < mainSheetCount; i++) {

      const textList = document.createElement("h1");
      textList.classList.add('text-List');
      textList.textContent = `Лист ${i + 1}`;
      document.getElementById('materialMap').appendChild(textList);

      const mainSheetContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      mainSheetContainer.classList.add('main-sheet-container');
      mainSheetContainer.setAttribute("width", main[0].width * coefW);
      mainSheetContainer.setAttribute("height", main[0].height * coefH);

      cuts[i].forEach((cut, index) => {
          const blank = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          blank.classList.add('blank');
          blank.setAttribute("width", cut.w * coefW);
          blank.setAttribute("height", cut.h * coefH);
          blank.setAttribute("x", cut.x * coefW);
          blank.setAttribute("y", cut.y * coefH);

          // Добавляем текстовый элемент с нумерацией внутри прямоугольника
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          text.classList.add('text-blank');
          text.setAttribute("x", cut.x * coefW + cut.w * coefW / 2);
          text.setAttribute("y", cut.y * coefH + cut.h * coefH / 2);
          text.setAttribute("text-anchor", "middle"); // Центрируем текст по горизонтали
          text.setAttribute("dominant-baseline", "middle");
          text.textContent = index + 1;

          const textH = document.createElementNS("http://www.w3.org/2000/svg", "text");
          textH.classList.add('textH-blank');
          textH.setAttribute("x", cut.x * coefW + 2);
          textH.setAttribute("y", cut.y * coefH + cut.h * coefH * 0.75);
          textH.textContent = cut.h;

          const textW = document.createElementNS("http://www.w3.org/2000/svg", "text");
          textW.classList.add('textW-blank');
          textW.setAttribute("x", cut.x * coefW + cut.w * coefW * 0.25);
          textW.setAttribute("y", cut.y * coefH + cut.h * coefH - 2);
          textW.textContent = cut.w;
          
          mainSheetContainer.appendChild(blank);
          mainSheetContainer.appendChild(text);
          mainSheetContainer.appendChild(textH);
          mainSheetContainer.appendChild(textW);

      });

      document.getElementById('materialMap').appendChild(mainSheetContainer);

      // Создаем таблицу
      const table = document.createElement('table');
      table.classList.add('cut-table'); // Добавляем класс для стилизации
        
      // Создаем заголовок таблицы
      const thead = document.createElement('thead');
      const trHead = document.createElement('tr');
      const th0 = document.createElement('th');
      th0.textContent = 'Номер';
      const th1 = document.createElement('th');
      th1.textContent = 'Ширина';
      const th2 = document.createElement('th');
      th2.textContent = 'Длина';
      trHead.appendChild(th0);
      trHead.appendChild(th1);
      trHead.appendChild(th2);
      thead.appendChild(trHead);
      table.appendChild(thead);

      var plosh = 0;
      // Заполняем таблицу данными
      const tbody = document.createElement('tbody');
      cuts[i].forEach((cut, index) => {
          const tr = document.createElement('tr');
          const td0 = document.createElement('td');
          td0.textContent = index + 1;
          const td1 = document.createElement('td');
          td1.textContent = cut.w;
          const td2 = document.createElement('td');
          td2.textContent = cut.h;
          tr.appendChild(td0);
          tr.appendChild(td1);
          tr.appendChild(td2);
          tbody.appendChild(tr);
          plosh += cut.w * cut.h;
          
      });
      table.appendChild(tbody);

      // Создаем таблицу
      const tableItog = document.createElement('table');
      tableItog.classList.add('cut-table'); // Добавляем класс для стилизации
        
      // Создаем заголовок таблицы
      const theadItog = document.createElement('thead');
      const trHeadItog = document.createElement('tr');
      const th0Itog = document.createElement('th');
      th0Itog.textContent = '';
      const th1Itog = document.createElement('th');
      th1Itog.textContent = 'Общая площадь(м2)';
      const th2Itog = document.createElement('th');
      th2Itog.textContent = 'Используемая площадь(м2)';
      const th3Itog = document.createElement('th');
      th3Itog.textContent = 'Остаток площади(м2)';
      trHeadItog.appendChild(th0Itog);
      trHeadItog.appendChild(th1Itog);
      trHeadItog.appendChild(th2Itog);
      trHeadItog.appendChild(th3Itog);
      theadItog.appendChild(trHeadItog);
      tableItog.appendChild(theadItog);

      // Заполняем таблицу данными
      const tbodyItog = document.createElement('tbody');
          const trItog = document.createElement('tr');
          const td0Itog = document.createElement('td');
          td0Itog.textContent = `Итог:`;
          const td1Itog = document.createElement('td');
          td1Itog.textContent = main[0].width * main[0].height / 1000000;
          const td2Itog = document.createElement('td');
          td2Itog.textContent = plosh / 1000000;
          const td3Itog = document.createElement('td');
          td3Itog.textContent = (main[0].width * main[0].height - plosh) / 1000000;
          trItog.appendChild(td0Itog);
          trItog.appendChild(td1Itog);
          trItog.appendChild(td2Itog);
          trItog.appendChild(td3Itog);
          tbodyItog.appendChild(trItog);

          tableItog.appendChild(tbodyItog);
          
      

      // Добавляем таблицу под SVG
      document.getElementById('materialMap').appendChild(table);
      document.getElementById('materialMap').appendChild(tableItog);
  }
}

// Функция для отслеживания изменений размеров контейнера
function observeContainerResize() {
  console.log(`observeContainerResize`)
  // Получаем ваш контейнер
  const container = document.getElementById('materialMap');

  // Создаем экземпляр ResizeObserver и передаем ему колбэк
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      // Получаем новые размеры контейнера
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      // Проверяем, если новые размеры больше предыдущих
      if (newWidth !== prevWidth ) { //|| newHeight !== prevHeight
        getContent(newWidth, newHeight); // Вызываем функцию getContent() с новыми размерами контейнера
        prevWidth = newWidth;
        prevHeight = newHeight;
      }
    }
  });
  // Запускаем отслеживание изменений размеров контейнера
  resizeObserver.observe(container);
}


