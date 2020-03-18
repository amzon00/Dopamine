let menu = $('.menu')[0];
let frame = $('.frame')[0];
let notificationCounter = $('.notification-counter-large')[0];
let smallNotificationCounter = $('.small-counter-icon')[0];
frame.style.display = 'none';

$(menu).click(function toggleMenu() {
    if (frame.style.display === 'none') {
        frame.style.display = 'block';
        $('.option-panel').hide().show('slow');
    } else {
        frame.style.display = 'none';
    };
});

fetch('/db.json')
    .then(res => res.json())
    .then(data => {
        loadContent(data);
        updateCheck(data); //  - When the API returns new notifications they should be added to the notifications list.
    })
    .catch(err => {
        console.error(err);
    });


function loadContent(data) {
    let timers = [];
    data.forEach(notifications => {

        let innerDiv = document.createElement('div');
        let id = document.createElement('div');
        let title = document.createElement('h2');
        let timer = document.createElement('div');
        let type = document.createElement('div');


        id.setAttribute('class', 'notification-id');
        id.style = 'display:none';
        innerDiv.setAttribute('class', 'single-notification-container');
        timer.setAttribute('class', `timers`);
        type.setAttribute('class', 'notification-type');
        type.style = 'display:none';
        timer.style = 'display:none';

        id.textContent = notifications.id;
        title.textContent = notifications.title;
        timer.textContent = notifications.expires;
        type.textContent = notifications.type;

        if (notifications.type === 'text') {
            let text = document.createElement('p');
            text.textContent = notifications.text;
            innerDiv.append(title, text, id, timer, type);
            createNotificationPanel(innerDiv);
            timers.push(timer);

        } else if (notifications.type === 'bonus') {
            let requirement = document.createElement('p');
            requirement.textContent = notifications.requirement;
            innerDiv.append(title, requirement, id, timer, type);
            createNotificationPanel(innerDiv);
            notificationCounter.textContent--; // bonus notifications excluded
            smallNotificationCounter.textContent--;
            timers.push(timer);

        } else if (notifications.type === 'Promotion') {
            let link = document.createElement('a');
            link.setAttribute('href', notifications.link);
            link.textContent = notifications.link;
            let image = document.createElement('img');
            image.setAttribute('src', notifications.image)
            image.setAttribute('class', 'notification-icon');
            innerDiv.append(title, link, id, image, type);
            createNotificationPanel(innerDiv);
        }

    });
    createTimer(timers);
};

function createNotificationPanel(innerDiv) {
    let outerDiv = document.createElement('div');
    outerDiv.setAttribute('class', 'option-panel');
    outerDiv.appendChild(innerDiv);
    frame.appendChild(outerDiv);
    notificationCounter.textContent++;
    smallNotificationCounter.textContent++;
};

function createTimer(timers) {
    timers.forEach(timer => {

        let minutes = timer.textContent / 61;
        let seconds = 60;
        minutes = Math.floor(minutes);

        if (timer.textContent >= 60) {

            setInterval(() => {
                seconds--;

                if (seconds === 0 && minutes === 0) {
                    removeNotification(timer);

                } else if (seconds === 0 && minutes > 0) {
                    seconds = 59;
                    minutes--;
                };

                if (seconds < 10) {
                    let newTimer = `${minutes}:0${seconds}`;
                    timer.innerHTML = newTimer;
                } else if (minutes < 10) {
                    let newTimer = `0${minutes}:${seconds}`;
                    timer.innerHTML = newTimer;
                } else {
                    let newTimer = `${minutes}:${seconds}`;
                    timer.innerHTML = newTimer;
                };
                timer.style = 'display:block';
            }, 1000);
        } else {
            let seconds = timer.innerHTML;

            setInterval(() => {
                seconds--;

                if (seconds < 10) {
                    let newTimer = `${'00'}:0${seconds}`;
                    timer.innerHTML = newTimer;
                } else {
                    let newTimer = `${'00'}:${seconds}`;
                    timer.innerHTML = newTimer;
                };

                if (seconds === 0 && minutes == 0) {
                    removeNotification(timer);
                };
                timer.style = 'display:block';
            }, 1000);
        };
    });
};

function removeNotification(id) {
    let parent = id.parentElement;
    let grandParent = parent.parentElement;
    grandParent.style.opacity = '0';
    setTimeout(function(){grandParent.remove(grandParent)}, 1000);
    if (parent.lastElementChild.innerHTML !== 'bonus') {
        notificationCounter.textContent--;
        smallNotificationCounter.textContent--;
    };
};

function updateCheck(data) {
    setInterval(() => {
        fetch('/db2.json')
            .then(res => res.json())
            .then(updatedData => {
                if (updatedData.length > data.length) { // checks if new data is added and if so it renders it.
                    let diff = updatedData.length - data.length;
                    let newData = updatedData.reverse().slice(0, diff);
                    updatedData.reverse();
                    data = newData.reverse();
                    loadContent(data);
                    data = updatedData;

                } else if (updatedData.length < data.length) { // checks if data is missing and if so deletes it.
                    let unnecessaryData = filterUnnecessaryData(data, updatedData);
                    let existingIds = $('.notification-id');

                    for (const key in data) {
                        const element = data[key].id;
                        if (unnecessaryData.includes(element)) {
                            let id = data[key].id;
                            locatingDomElements(existingIds, id)
                        };
                    };
                };
                data = updatedData;
            })
            .catch(err => {
                console.error(err);
            });
    }, 7000);
};

function filterUnnecessaryData(data, updatedData) {
    let OldDataIds = [];
    let newDataIds = [];
    for (const key in data) {
        OldDataIds.push(data[key].id);
    };
    for (const key in updatedData) {
        newDataIds.push(updatedData[key].id);
    };
    return OldDataIds.filter(id => !newDataIds.includes(id));
};

function locatingDomElements(existingIds, id) {
    for (let element of [...existingIds]) {
        let el = element.innerHTML;

        el = Number(el);
        if (el === id) {
            id = element
            removeNotification(id);
        }
    };
};
