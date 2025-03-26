document.addEventListener('DOMContentLoaded', function() {
    const birthdayList = document.getElementById('birthdayList');
    const birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];

    function renderBirthdays() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        birthdayList.innerHTML = '';

        birthdays.forEach((birthday, index) => {
            const birthDate = new Date(birthday.date);
            const day = String(birthDate.getDate()).padStart(2, '0');
            const month = String(birthDate.getMonth() + 1).padStart(2, '0');
            const shortDate = `${day}.${month}`;
            const nextBirthday = getNextBirthday(birthDate);

            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4 birthday-card';
            card.innerHTML = `
                <div class="card p-3">
                    <h5>${birthday.name}</h5>
                    <p>Geburtstag am: ${nextBirthday.toLocaleDateString('de-DE')}</p>
                    <div class="countdown" id="countdown-${index}">
                        <!-- Countdown updated here -->
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-edit me-2" onclick="editBirthday(${index})">Ändern</button>
                        <button class="btn btn-delete" onclick="deleteBirthday(${index})">Löschen</button>
                    </div>
                </div>
            `;
            birthdayList.appendChild(card);
        });

        updateCountdowns();
    }

    function updateCountdowns() {
        const today = new Date();
        birthdays.forEach((birthday, index) => {
            const birthDate = new Date(birthday.date);
            const nextBirthday = getNextBirthday(birthDate);
            const timeDiff = nextBirthday - today;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const secondsDiff = Math.floor((timeDiff % (1000 * 60)) / 1000);

            const countdownElement = document.getElementById(`countdown-${index}`);
            if (countdownElement) {
                countdownElement.innerHTML = `
                    <div class="time-unit"><span>${daysDiff}</span>T</div>
                    <div class="time-unit"><span>${hoursDiff}</span>S</div>
                    <div class="time-unit"><span>${minutesDiff}</span>M</div>
                    <div class="time-unit"><span>${secondsDiff}</span>S</div>
                `;
            }
        });
    }

    renderBirthdays();
    setInterval(updateCountdowns, 1000);
});

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getNextBirthday(birthDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const birthDay = birthDate.getUTCDate();
    const birthMonth = birthDate.getUTCMonth();

    
    let nextBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
    nextBirthday.setHours(0, 0, 0, 0);


    if (birthMonth === 1 && birthDay === 29) {
        if (isLeapYear(nextBirthday.getFullYear())) {
            nextBirthday.setDate(29);
        } else {
            nextBirthday.setMonth(1);
            nextBirthday.setDate(28);
        }
    }

    if (nextBirthday < today) {
        nextBirthday = new Date(today.getFullYear() + 1, birthMonth, birthDay);
        nextBirthday.setHours(0, 0, 0, 0);
        if (birthMonth === 1 && birthDay === 29) {
            if (isLeapYear(nextBirthday.getFullYear())) {
                nextBirthday.setDate(29);
            } else {
                nextBirthday.setMonth(1);
                nextBirthday.setDate(28);
            }
        }
    }

    return nextBirthday;
}

function editBirthday(index) {
    const birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    const birthday = birthdays[index];
    const birthDate = new Date(birthday.date);
    const day = String(birthDate.getDate()).padStart(2, '0');
    const month = String(birthDate.getMonth() + 1).padStart(2, '0');
    const shortDate = `${day}.${month}`;

    const card = document.querySelectorAll('.birthday-card')[index];
    card.classList.add('edit-mode');

    card.querySelector('.card').innerHTML = `
        <form class="edit-form">
            <input type="text" class="form-control mb-2" value="${birthday.name}" id="edit-name-${index}">
            <input type="text" class="form-control mb-2" value="${shortDate}" id="edit-date-${index}" maxlength="5" placeholder="ttmm">
            <button type="button" class="btn btn-save me-2" onclick="saveBirthday(${index})">Save</button>
            <button type="button" class="btn btn-cancel" onclick="cancelEdit(${index})">Cancel</button>
        </form>
    `;

    const editDateInput = document.getElementById(`edit-date-${index}`);
    editDateInput.addEventListener('input', function() {
        let value = this.value.replace(/[^0-9]/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            this.value = value.slice(0, 2) + '.' + value.slice(2);
        } else {
            this.value = value;
        }
    });
}

function saveBirthday(index) {
    const birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    const newName = document.getElementById(`edit-name-${index}`).value.trim();
    const newDateInput = document.getElementById(`edit-date-${index}`).value.trim();

    const [day, month] = newDateInput.split('.');
    const parsedDay = parseInt(day, 10);
    const parsedMonth = parseInt(month, 10) - 1;

    const tempDate = new Date(Date.UTC(2000, parsedMonth, parsedDay));
    if (isNaN(tempDate.getTime()) || parsedDay < 1 || parsedDay > 31 || parsedMonth < 0 || parsedMonth > 11) {
        alert('Bitte geben Sie ein gültiges Datum ein. (tt.mm)');
        return;
    }

    const formattedDate = tempDate.toISOString().split('T')[0];
    birthdays[index] = { name: newName, date: formattedDate };
    localStorage.setItem('birthdays', JSON.stringify(birthdays));
    location.reload();
}

function cancelEdit(index) {
    location.reload();
}

function deleteBirthday(index) {
    const birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    birthdays.splice(index, 1);
    localStorage.setItem('birthdays', JSON.stringify(birthdays));
    location.reload();
}