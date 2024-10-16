const apiKey = 'ef5ffc451f06478b9d795bdfa7587f5c';
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const amountInput = document.getElementById('amount');
const resultDisplay = document.getElementById('result');
const convertButton = document.getElementById('convertButton');
const copyButton = document.getElementById('copyButton');
const notification = document.getElementById('notification');

const CURRENCIES_STORAGE_KEY = 'currenciesData';
const RATES_STORAGE_KEY = 'ratesData';
const CACHE_EXPIRATION = 12 * 60 * 60 * 1000;

async function populateCurrencies() {
    const currenciesData = getLocalStorageData(CURRENCIES_STORAGE_KEY);
    if (currenciesData && !isCacheExpired(currenciesData.timestamp)) {
        addCurrenciesToSelect(currenciesData.data);
    } else {
        try {
            const response = await fetch(`https://openexchangerates.org/api/currencies.json?app_id=${apiKey}`);
            const currencies = await response.json();
            setLocalStorageData(CURRENCIES_STORAGE_KEY, currencies);
            addCurrenciesToSelect(currencies);
        } catch (error) {
            console.error("Eroare la obținerea listei de monede:", error);
        }
    }
}

function addCurrenciesToSelect(currencies) {
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    for (const [currency, name] of Object.entries(currencies)) {
        const optionFrom = new Option(`${currency} (${name})`, currency);
        const optionTo = new Option(`${currency} (${name})`, currency);
        fromSelect.add(optionFrom);
        toSelect.add(optionTo);
    }
}

async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (isNaN(amount) || amount <= 0) {
        showNotification("Te rugăm să introduci o sumă validă.");
        return;
    }

    const ratesData = getLocalStorageData(RATES_STORAGE_KEY);
    if (!ratesData || isCacheExpired(ratesData.timestamp)) {
        try {
            const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}`);
            const data = await response.json();
            setLocalStorageData(RATES_STORAGE_KEY, data.rates);
            calculateAndDisplayResult(data.rates, amount, fromCurrency, toCurrency, Date.now());
        } catch (error) {
            console.error("Eroare la conversie:", error);
        }
    } else {
        calculateAndDisplayResult(ratesData.data, amount, fromCurrency, toCurrency, ratesData.timestamp);
    }
}

function calculateAndDisplayResult(rates, amount, fromCurrency, toCurrency, timestamp) {
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (!fromRate || !toRate) {
        showNotification("Moneda selectată nu este validă.");
        return;
    }

    const convertedValue = (amount / fromRate * toRate).toFixed(2);
    const lastUpdatedDate = new Date(timestamp).toLocaleString();

    resultDisplay.textContent = `${amount} ${fromCurrency} = ${convertedValue} ${toCurrency} (Rată actualizată la: ${lastUpdatedDate})`;
}

function copyResult() {
    const resultText = resultDisplay.textContent;
    const match = resultText.match(/= ([\d.]+)/);

    if (match && match[1]) {
        const valueToCopy = match[1]; 
        navigator.clipboard.writeText(valueToCopy).then(() => {
            showNotification("Valoarea convertită a fost copiată în clipboard!");
        }).catch(err => {
            console.error("Eroare la copiere:", err);
        });
    } else {
        showNotification("Nu există rezultat valid de copiat.");
    }
}


function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";
    
    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

function setLocalStorageData(key, data) {
    const dataWithTimestamp = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
}

function getLocalStorageData(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

function isCacheExpired(timestamp) {
    return (Date.now() - timestamp) > CACHE_EXPIRATION;
}

convertButton.addEventListener('click', convertCurrency);
copyButton.addEventListener('click', copyResult);

populateCurrencies();
