document.getElementById('birthdayForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    let dateInput = document.getElementById('date').value.trim();

    dateInput = dateInput.replace(/[^0-9]/g, '');
    if (dateInput.length !== 4) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Bitte geben Sie 4 Ziffern ein.';
        errorMessage.style.display = 'block';
        errorMessage.style.color = 'red';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
        return;
    }
    dateInput = dateInput.slice(0, 2) + '.' + dateInput.slice(2);

    const [day, month] = dateInput.split('.');
    const parsedDay = parseInt(day, 10);
    const parsedMonth = parseInt(month, 10) - 1;


    const tempDate = new Date(Date.UTC(2000, parsedMonth, parsedDay));
    if (isNaN(tempDate.getTime()) || parsedDay < 1 || parsedDay > 31 || parsedMonth < 0 || parsedMonth > 11) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Kein gültiges Datum (tt.mm)';
        errorMessage.style.display = 'block';
        errorMessage.style.color = 'red';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
        return;
    }

    const formattedDate = tempDate.toISOString().split('T')[0];
    const birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    birthdays.push({ name, date: formattedDate });
    localStorage.setItem('birthdays', JSON.stringify(birthdays));

    const successMessage = document.getElementById('success-message');
    successMessage.textContent = `${name} hinzugefügt!`;
    successMessage.style.display = 'block';
    successMessage.style.color = 'green';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);

    document.getElementById('birthdayForm').reset();
    checkBirthdays();
});

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getNextBirthday(birthDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(today.getFullYear());
    nextBirthday.setHours(0, 0, 0, 0);

    if (birthDate.getMonth() === 1 && birthDate.getDate() === 29) {
        if (isLeapYear(nextBirthday.getFullYear())) {
            nextBirthday.setDate(29);
        } else {
            nextBirthday.setMonth(1);
            nextBirthday.setDate(28);
        }
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
            if (isLeapYear(nextBirthday.getFullYear())) {
                nextBirthday.setDate(29);
            } else {
                nextBirthday.setMonth(1);
                nextBirthday.setDate(28);
            }
        }
    } else {
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
    }
    nextBirthday.setHours(0, 0, 0, 0);
    return nextBirthday;
}

function checkBirthdays() {
    const birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    birthdays.forEach(birthday => {
        const birthDate = new Date(birthday.date);
        const nextBirthday = getNextBirthday(birthDate);
        const timeDiff = nextBirthday - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 7) {
            notifyUser(`${birthday.name}'s Geburtstag ist in 1 Woche!`);
        } else if (daysDiff === 1) {
            notifyUser(`${birthday.name}'s Geburtstag ist morgen!`);
        } else if (daysDiff === 0) {
            notifyUser(`Heute hat ${birthday.name} Geburtstag!`);
        }
    });
}

function notifyUser(message) {
    if (Notification.permission === 'granted') {
        new Notification(message);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(message);
            }
        });
    }
}

checkBirthdays();
setInterval(checkBirthdays, 30 * 1000); //Aktualisiere alle 30 Sekunden.