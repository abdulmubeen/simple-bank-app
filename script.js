'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-12-18T21:31:17.178Z',
    '2022-03-23T07:42:02.383Z',
    '2022-07-28T09:15:04.904Z',
    '2022-09-01T10:17:24.185Z',
    '2022-11-25T14:11:59.604Z',
    '2022-12-03T17:01:17.194Z',
    '2022-12-23T23:36:17.929Z',
    '2022-12-29T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerrightNav = document.querySelector('.nav_right');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = '';
  const sortedMovements = sort ? acc.movements.slice().sort((a,b) => a - b) : acc.movements;
  sortedMovements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit':'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const daysPassed = calcDaysPassed(new Date(), date);
    const displayDateTime = `${date.toLocaleDateString(acc.locale)}, ${daysPassed}`;
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDateTime}</div>
        <div class="movements__value">${currFormat(mov.toFixed(2), acc.currency, acc.locale)}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin',html);
  });
};

const calcDisplayBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${currFormat(acc.balance.toFixed(2), acc.currency, acc.locale)}`;
};

const calcDisplaySummary = (acc) => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate)/100)
    .filter(mov => mov >= 1)
    .reduce((acc, mov) => acc + mov, 0);
  
  labelSumIn.textContent = `${currFormat(incomes.toFixed(2), acc.currency, acc.locale)}`;
  labelSumOut.textContent = `${currFormat(Math.abs(out).toFixed(2), acc.currency, acc.locale)}`;
  labelSumInterest.textContent = `${currFormat(interest.toFixed(2), acc.currency, acc.locale)}`;
};

const calcDaysPassed = (date1, date2) => {
  const daysPassed = Math.round(Math.abs(date2 - date1) / (1000*60*60*24));
  if(daysPassed === 0) return 'Today' ;
  else if(daysPassed === 1) return 'Yesterday';
  else return `${daysPassed} days ago`;
}

const currFormat = (num, curr, locale) => {
  const options = {
    style: 'currency',
    currency: curr
  }
  return Intl.NumberFormat(locale, options).format(num);
}

const updateUI = (acc) => {
  containerrightNav.innerHTML = '';
  const html = `
    <button class="logout__btn">Logout</button>
  `;
  containerrightNav.insertAdjacentHTML('afterbegin',html);
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  btnLogout.addEventListener('click', e => logoutUI);
};

const logoutUI = () => {
  clearInterval(timer);
  containerrightNav.innerHTML = '';
  const html = `
  <input type="text" placeholder="user" class="login__input login__input--user" />
  <input type="password" placeholder="PIN" maxlength="4" class="login__input login__input--pin" />
  <button class="login__btn">&rarr;</button>
  `;
  containerrightNav.insertAdjacentHTML('afterbegin', html);
  containerApp.style.opacity = 0;
  dashNav(false);
}

const dashNav = (status) => {
  if(status) {
    inputLoginUsername.style.visibility = 'hidden';
    inputLoginPin.style.visibility = 'hidden';
    btnLogin.style.visibility = 'hidden';
  } else {
    labelWelcome.value = 'Log in to get started';
    inputLoginUsername.style.visibility = 'visible';
    inputLoginPin.style.visibility = 'visible';
    btnLogin.style.visibility = 'visible';
  }
};

const createUsernames = (accs) => {
  accs.forEach(acc => {
    acc.username = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
  });
};
createUsernames(accounts);

const startLogoutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if(time === 0){
      clearInterval(timer);
      logoutUI();
    }
    time--;
  }
  let time = 50;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

//Event Handlers
let currentAccount, timer;

btnLogin.addEventListener('click', e => {
  e.preventDefault();
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    
    labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    const date = new Date();
    const localeDate = date.toLocaleString(currentAccount.locale, {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'short'
    });
    labelDate.textContent = `${localeDate}`;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    dashNav(true);
    if(timer) clearInterval(timer);
    timer = startLogoutTimer();
    updateUI(currentAccount);

  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const transferAmount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(acc => acc.username === inputTransferTo.value);
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferTo.blur();
  if (transferAmount > 0 &&
      receiverAccount &&
      currentAccount.balance >= transferAmount &&
      receiverAccount?.username !== currentAccount.username) {
        currentAccount.movements.push(-transferAmount);
        receiverAccount.movements.push(transferAmount);
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAccount.movementsDates.push(new Date().toISOString());
        updateUI(currentAccount);
        clearInterval(timer);
        timer = startLogoutTimer();
      }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const inputAmount = Math.floor(inputLoanAmount.value);
  if (inputAmount > 0 && currentAccount.movements.some(mov => mov >= inputAmount * 0.10)) {
    setTimeout(() => {
      currentAccount.movements.push(inputAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  if(currentAccount.username === inputCloseUsername.value && currentAccount.pin === Number(inputClosePin.value)) {
    const accIndex = accounts.findIndex(acc => acc.username === currentAccount.username);
    accounts.splice(accIndex, 1);
    containerApp.style.opacity = 0;
    dashNav(false);
  }
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

let sortStatus = false;
btnSort.addEventListener('click', e=> {
  e.preventDefault();
  displayMovements(currentAccount.movements,!sortStatus);
  sortStatus = !sortStatus;
});
