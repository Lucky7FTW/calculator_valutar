const apiKey = 'ef5ffc451f06478b9d795bdfa7587f5c';
const currencyListUrl = `https://openexchangerates.org/api/currencies.json`;
const baseUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`;

function populateCurrencies() {
    fetch(currencyListUrl)
        .then(response => response.json())
        .then(data => {
            const fromCurrency = document.getElementById("from-currency");
            const toCurrency = document.getElementById("to-currency");

            for (const currencyCode in data) {
                const currencyName = data[currencyCode];

                const optionFrom = document.createElement("option");
                optionFrom.value = currencyCode;
                optionFrom.textContent = `${currencyCode} (${currencyName})`;
                fromCurrency.appendChild(optionFrom);

                const optionTo = document.createElement("option");
                optionTo.value = currencyCode;
                optionTo.textContent = `${currencyCode} (${currencyName})`;
                toCurrency.appendChild(optionTo);
            }
        })
        .catch(error => {
            console.error("Eroare la obținerea listei de monede:", error);
        });
}

document.getElementById("convert").addEventListener("click", function() {
    const amount = document.getElementById("amount").value;
    const fromCurrency = document.getElementById("from-currency").value;
    const toCurrency = document.getElementById("to-currency").value;

    if (amount === "" || amount <= 0) {
        alert("Vă rugăm să introduceți o sumă validă.");
        return;
    }

    fetch(baseUrl)
        .then(response => response.json())
        .then(data => {
            const rates = data.rates;
            const fromRate = rates[fromCurrency];
            const toRate = rates[toCurrency];
            
            if (!fromRate || !toRate) {
                alert("Nu există date disponibile pentru această conversie.");
                return;
            }

            // Calculăm valoarea convertită fără rotunjire
            const result = Math.floor((amount / fromRate * toRate) * 100) / 100;
            document.getElementById("result").textContent = `${amount} ${fromCurrency} = ${result} ${toCurrency}`;

            // Afișăm butonul pentru copiere
            const copyButton = document.getElementById("copy");
            copyButton.style.display = "inline";  // Arată butonul
        })
        .catch(error => {
            alert("A apărut o eroare. Vă rugăm să încercați din nou.");
            console.error(error);
        });
});

document.getElementById("copy").addEventListener("click", function() {
    const resultText = document.getElementById("result").textContent;

    navigator.clipboard.writeText(resultText).then(() => {
        alert("Rezultatul a fost copiat în clipboard!");
    }).catch(error => {
        console.error("Eroare la copierea în clipboard:", error);
        alert("Nu s-a putut copia rezultatul. Încercați din nou.");
    });
});

populateCurrencies();
