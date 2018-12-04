(function(){
    const firstBtn = document.querySelector('.logo'), // картинка "другофильтр"
        popUp = document.querySelector('.pop-up'), // модальное окно со списками друзей
        btnClose = document.querySelector('.btn__close'), // кнопка, которая закрывает модальное окно
        btnSave = document.querySelector('.btn__save'), // кнопка, которая закрывает модальное окно
        lists = document.querySelectorAll('.col .list'), // набор списков друзей
        listAllFriends = document.querySelector('.col-all .list'), // контейнер списка всех друзей
        listAddedFriends = document.querySelector('.col-add .list'), // контейнер списка выбранных друзей
        inputs = document.querySelectorAll('.col .filter'), // набор input-ов
        inputAllFriends = document.querySelector('.col-all .filter'), // набор input-ов
        inputAddedFriends = document.querySelector('.col-add .filter') // набор input-ов

    /** функция обрабатывает данные одного друга {data} пришедшие от VK, возвращает html элемент {div} */
    function renderFriend (data) {
        let srcPhoto = data.photo_100,
            firstName = data.first_name,
            lastName = data.last_name,            
            div = document.createElement('DIV');

        div.classList.add('list-item');
        div.draggable = true;
        div.innerHTML = `<img src="${srcPhoto}" alt="" class="avatar">\
            <div class="name">${lastName} ${firstName}</div>\
            <div class="btn btn__add"><i class="fas fa-plus"></i></div>`;

        return div;        
    };

    /** функция ищет подстоку {subStr} в строке {Str}, возвращает bool */
    function isHas(Str, subStr) {
        let str = Str.toString().toLowerCase(),
            substr = subStr.toString().toLowerCase();

        return str.indexOf(substr) > -1;
    };

    /** функция скрывает пункты списка {list} не соответствующие фильтру {filter} */
    function filterItems(list, filter) {
        let itemsList = list.children;

        unsetList(list);
        if (filter) {            
            for (const item of itemsList) {
                let name = item.querySelector('.name').innerHTML;

                if (!isHas(name, filter)) {
                    item.classList.add('unvisible')
                };
            };
        };
    };

    /** функция сбрасываает фильтр списка {list} друзей */
    function unsetList(list) {
        let itemsList = list.children;

        for (const item of itemsList) {
            item.classList.remove('unvisible');
        }
    }

    /** функции очищают все inputs и списки */
    function clearInputs() {
        for (const item of inputs) {
            item.innerHTML = '';
        }
    }
    function clearLists() {
        for (const item of lists) {
            item.innerHTML = '';
        }
    }

    /** функция переносит html элемент {item} в контейнер {container} */
    function moveElementInContainer(item, container) {

        container.insertBefore(item, container.firstChild);              
    }

    /** обрабатывает клик на картинку "другофильтр" */
    firstBtn.addEventListener('click',async () => {
        
        popUp.classList.remove('zoom'); // показывается модальное окно
        firstBtn.classList.add('remove'); // картинка "другофильтр" передвигается вверх
        clearInputs(); // очищаем все инпуты и списки
        clearLists();
        
        makeDnD([listAllFriends, listAddedFriends]); // добавляем D'n'D спискам
        /** если localStorage не имеет данные о списке, тогда загружаем данные из localStorage
         * иначе из VK */
        if (window.localStorage.getItem('allFriends')){
            listAllFriends.innerHTML = window.localStorage.getItem('allFriends');
            listAddedFriends.innerHTML = window.localStorage.getItem('addedFriends');
            await vkInit();
        } else {
            await vkInit();

            const friends = await vkApi('friends.get', { fields: 'photo_100' });

            for (const friend of friends.items) {
                listAllFriends.appendChild(renderFriend(friend));
            };
        };
        document.querySelector('.fa-snowflake').remove(); // удаляем прелоадер
    });

    /** обрабатывает клик на крестик:) */
    btnClose.addEventListener('click', () => {
        if (confirm('Будут удалены все данные из списков и будет произведен выход из учетной записи. Вы согласны?')) {
            popUp.classList.add('zoom'); // скрываем модальное окно
            firstBtn.classList.remove('remove'); // картинку "другофильтр" смещаем в центр
            /** выходим из учетной записи; очищаем localStorage, inputs и списки */
            VK.Auth.logout(data => {
                if(!data.session){
                    clearInputs();
                    clearLists();
                    window.localStorage.clear();
                    // window.localStorage.removeItem('allFriends');
                    // window.localStorage.removeItem('addedFriends');
                    alert('Выход произведен успешно, все данные стерты.');
                } else {
                    new Error('Не удалось выйти');
                    alert('Не удалось выйти.');
                };
            });
        };
    });
    /** обрабатывает клик на кнопку "Сохранить" */
    btnSave.addEventListener('click', () => {
        /** Сохраняем списки в localStorage */
        window.localStorage.setItem('allFriends', listAllFriends.innerHTML);
        window.localStorage.setItem('addedFriends', listAddedFriends.innerHTML);
        /** реакция кнопки на сохранение */
        btnSave.innerHTML = 'Сохранено';
        btnSave.setAttribute('id', 'green');
        setTimeout(() => {
            btnSave.innerHTML = 'Сохранить';
            btnSave.removeAttribute('id');
        }, 2000);
    });

    /** обрабатывает ввод в поля поиска (фильтр) */
    document.addEventListener('keyup', (e) => {
        if (e.target.tagName === "INPUT") {
            let closestList = e.target.parentElement.parentElement.querySelector('.list'),
                value = e.target.value;

            filterItems(closestList, value);
        }
    });

    /** обрабатывает нажатие на плюсик или крестик на плашке "друга" */
    document.addEventListener('click', (e) => {
        let target = e.target;            
        
        if (target.tagName === 'I'){
            let targetBtn = target.parentElement; // div.btn

            if (targetBtn.classList.contains('btn__add')) {
                let listItem = targetBtn.parentElement; // плашка друга, которой нажат "плюс"

                moveElementInContainer(listItem, listAddedFriends); //перемещаем плашку друга в соседний список
                /** переключаем "плюс" на "крестик" */
                targetBtn.classList.toggle('btn__add'); 
                targetBtn.classList.toggle('btn__delete');
                /** отфильтровать новые списки */                
                filterItems(listAddedFriends, inputAddedFriends.value); 

            } else if (targetBtn.classList.contains('btn__delete')) {
                let listItem = targetBtn.parentElement; // плашка друга, которой нажат "крестик"

                moveElementInContainer(listItem, listAllFriends); //перемещаем плашку друга в соседний список
                /** переключаем "плюс" на "крестик" */
                targetBtn.classList.toggle('btn__add');
                targetBtn.classList.toggle('btn__delete');
                /** отфильтровать новые списки */
                filterItems(listAllFriends, inputAllFriends.value);            
            };
        }
    });

    /** DRAG and DROP */
    /** функция вешает обработчки D'n'D */
    function makeDnD(zones) {
        let currentDrag; // объект с информацией о переносимой плашке друга

        zones.forEach(zone => {
            zone.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/html', 'dragstart');
                currentDrag = { source: zone, node: e.target }; // сохранием данные о переносимой плашке
            });

            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            zone.addEventListener('drop', (e) => {
                if (currentDrag) {
                    let listItem = currentDrag.node, // переносимая плашка
                        listItemBtn = listItem.querySelector('.btn'); // кнопка на переносимой плашке

                    e.preventDefault();
                    /** если перенесли в другой список, то там и оставить плашку */
                    if (currentDrag.source !== zone) {
                        /** если плашка попала на пустую зону списка, то она будет в конце
                         * иначе - первой в списке
                         */
                        if (e.target.classList.contains('list')) {
                            zone.appendChild(listItem);
                            listItemBtn.classList.toggle('btn__add');
                            listItemBtn.classList.toggle('btn__delete');
                        } else {
                            zone.insertBefore(listItem, zone.firstChild);
                            listItemBtn.classList.toggle('btn__add');
                            listItemBtn.classList.toggle('btn__delete');
                        }                
                    }

                    currentDrag = null; // стираем данные о переносимой плашке
                }
            });
        })
    }    
})();