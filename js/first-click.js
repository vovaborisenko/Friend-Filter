(function(){
    const firstBtn = document.querySelector('.logo'), // картинка "другофильтр"
        popUp = document.querySelector('.pop-up'), // модальное окно со списками друзей
        btnClose = document.querySelector('.btn__close'), // кнопка, которая закрывает модальное окно
        lists = document.querySelectorAll('.col .list'), // набор списков друзей
        listAllFriends = document.querySelector('.col-all .list'), // контейнер списка всех друзей
        listAddedFriends = document.querySelector('.col-add .list'), // контейнер списка выбранных друзей
        inputs = document.querySelectorAll('.col .filter'), // набор input-ов
        inputAllFriends = document.querySelector('.col-all .filter'), // input списка всех друзей
        inputAddFriends = document.querySelector('.col-add .filter'), // input списка выбранных друзей
        itemsList = document.querySelectorAll('.list-item') // набор всех плашек друзей


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

        return str.indexOf(substr) < 0 ? false : true;
    };

    /** функция скрывает пункты списка {list} не соответствующие фильтру {filter} */
    function filterItems(list, filter) {
        let itemsList = list.children;

        unsetList(list);
        for (const item of itemsList) {
            let name = item.querySelector('.name').innerHTML;

            if (!isHas(name, filter)) {
                item.classList.add('unvisible')
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

    /** функции очищает все inputs и списки */
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
        
        popUp.classList.remove('zoom');
        firstBtn.classList.add('remove');
        clearInputs();
        clearLists();

        await vkInit();

        const friends = await vkApi('friends.get', { fields: 'photo_100' });

        for (const friend of friends.items) {
            listAllFriends.appendChild(renderFriend(friend));
        };
        
    });

    /** обрабатывает клик на крестик:) */
    btnClose.addEventListener('click', () => {
        popUp.classList.add('zoom');
        firstBtn.classList.remove('remove');
        VK.Auth.logout(data => {
            if(!data.session){
                clearInputs();
                clearLists();
            } else {
                new Error(' Не удалось выйти');
            }
        });
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
        console.log(e);
        if (target.tagName === 'I'){
            let targetBtn = target.parentElement;

            if (targetBtn.classList.contains('btn__add')) {
                let listItem = targetBtn.parentElement;

                moveElementInContainer(listItem, listAddedFriends);
                targetBtn.classList.toggle('btn__add');
                targetBtn.classList.toggle('btn__delete');

            } else if (targetBtn.classList.contains('btn__delete')) {
                let listItem = targetBtn.parentElement;

                moveElementInContainer(listItem, listAllFriends);
                targetBtn.classList.toggle('btn__add');
                targetBtn.classList.toggle('btn__delete');            
            }
        }
    });

    /** DRAG and DROP */
    /** функция вешает обработчки D'n'D */
    function makeDnD(zones) {
        
    }
    /** обработка начала перетаскивания dragstart */
    
})();