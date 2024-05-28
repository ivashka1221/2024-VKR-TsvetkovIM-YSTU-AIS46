function generatePDF() {
    var element = getContents();
    console.log(element);
    
    const opt = {
        margin:       [0,0,0,0],
        filename:     'material_map.pdf',
        autoPaging:true,
        pagebreak: {    
                        mode: ['avoid-all', 'css', 'legacy'],
                        after:[`#tableContainer`],
                        before:[`#tableContainer`]
                    },
        html2canvas:  { scale: 1 },
        jsPDF:        { 
                        unit: 'px', 
                        format: [864, 628], //'letter' 866 626
                        orientation: 'landscape'
                    },
    };
const ht = html2pdf().from(element).set(opt).save();
console.log(ht);
}

function getContents(){
    var jsonMainString = document.getElementById('jsonMain').value;
    var jsonCutsString = document.getElementById('jsonCuts').value;

    var container = document.createElement('div'); // Создаем новый элемент DIV для хранения содержимого
    container.id = 'pdfContent'; // Присваиваем ID элементу

    var main = JSON.parse(jsonMainString);
    var cuts = JSON.parse(jsonCutsString);

    const widthGlobal = 864;
    const heightGlobal = 624;

    const coefW = widthGlobal / main[0].width;
    const coefH = heightGlobal / main[0].height;

    const mainSheetCount = main[0].count;
    for (var i = 0; i < mainSheetCount; i++) {

        // Создаем контейнер для таблицы с заданными параметрами высоты и ширины
        const tableContainer = document.createElement('div');
        tableContainer.id = `tableContainer`
        tableContainer.classList.add('container-table');
        tableContainer.style.width = `${main[0].width * coefW}px`; // Задаем ширину контейнера 
        tableContainer.style.height = `${main[0].height * coefH}px`; // Задаем высоту контейнера  // 

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
      });
      table.appendChild(tbody);
      tableContainer.appendChild(table);

      // Добавляем таблицу над SVG
      container.appendChild(tableContainer);

      const tableContainerDiv = document.createElement('div');
        tableContainerDiv.id = `tableContainerDiv`
        tableContainerDiv.classList.add('container-table');
        tableContainerDiv.style.width = `${main[0].width * coefW}px`; // Задаем ширину контейнера 
        tableContainerDiv.style.height = `4px`; // Задаем высоту контейнера  // 
        container.appendChild(tableContainerDiv);


      const mainSheetContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      mainSheetContainer.classList.add('container-svg');
      mainSheetContainer.setAttribute("width", main[0].width * coefW);
      mainSheetContainer.setAttribute("height", main[0].height * coefH);
      
      // Создаем прямоугольник, который будет служить задним фоном и заливаем его цветом
        const backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        backgroundRect.setAttribute("width", main[0].width * coefW);
        backgroundRect.setAttribute("height", main[0].height * coefH); // 100%
        backgroundRect.setAttribute("fill", "rgb(239, 236, 236)"); // Устанавливаем цвет фона
        backgroundRect.setAttribute("stroke", "black");
        backgroundRect.setAttribute("stroke-width", "0.5");
        mainSheetContainer.appendChild(backgroundRect);
        cuts[i].forEach((cut, index) => {
            const blank = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            blank.classList.add('blank');
            blank.setAttribute("width", cut.w * coefW);
            blank.setAttribute("height", cut.h * coefH);
            blank.setAttribute("x", cut.x * coefW);
            blank.setAttribute("y", cut.y * coefH);
            blank.setAttribute("fill", "rgb(235, 230, 183)"); // Устанавливаем цвет фона
            blank.setAttribute("stroke", "black");
            blank.setAttribute("stroke-width", "0.5");
  
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
            container.appendChild(mainSheetContainer);
    }
    return container
  }