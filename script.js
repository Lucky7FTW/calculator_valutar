const apiKey = 'ef5ffc451f06478b9d795bdfa7587f5c';
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const amountInput = document.getElementById('amount');
const resultDisplay = document.getElementById('result');
const convertButton = document.getElementById('convertButton');
const copyButton = document.getElementById('copyButton');

async function populateCurrencies() {
    try {
        const response = await fetch(`https://openexchangerates.org/api/currencies.json?app_id=${apiKey}`);
        const currencies = await response.json();
        
        for (const [currency, name] of Object.entries(currencies)) {
            const optionFrom = new Option(`${currency} (${name})`, currency);
            const optionTo = new Option(`${currency} (${name})`, currency);
            fromSelect.add(optionFrom);
            toSelect.add(optionTo);
        }
    } catch (error) {
        console.error("Eroare la obținerea listei de monede:", error);
    }
}

async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (isNaN(amount) || amount <= 0) {
        alert("Te rugăm să introduci o sumă validă.");
        return;
    }

    try {
        const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}`);
        const data = await response.json();

        const fromRate = data.rates[fromCurrency];
        const toRate = data.rates[toCurrency];
        
        if (!fromRate || !toRate) {
            alert("Moneda selectată nu este validă.");
            return;
        }

        const convertedValue = (amount / fromRate * toRate).toFixed(2);
        resultDisplay.textContent = `${amount} ${fromCurrency} = ${convertedValue} ${toCurrency}`;
    } catch (error) {
        console.error("Eroare la conversie:", error);
    }
}

function copyResult() {
    const resultText = resultDisplay.textContent;
    const valueToCopy = resultText.split(' = ')[1]; 
    if (valueToCopy) {
        navigator.clipboard.writeText(valueToCopy).then(() => {
            alert("Rezultatul a fost copiat în clipboard!");
        }).catch(err => {
            console.error("Eroare la copiere:", err);
        });
    } else {
        alert("Nu există rezultat de copiat.");
    }
}

convertButton.addEventListener('click', convertCurrency);
copyButton.addEventListener('click', copyResult);

populateCurrencies();
