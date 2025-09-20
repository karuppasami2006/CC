// Elements
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convertBtn");
const viewAllBtn = document.getElementById("viewAllBtn");
const singleResult = document.getElementById("singleResult");
const modal = document.getElementById("currencyModal");
const closeBtn = document.querySelector(".close-btn");
const currencyListDiv = document.getElementById("currencyList");
let currencyNames = {}; // To store currency codes and names

// Load currency options on page load
async function loadCurrencies() {
  const res = await fetch("https://api.frankfurter.app/currencies");
  const data = await res.json();
  currencyNames = data; // Store for later use

  // Populate both dropdowns
  for (let code in data) {
    let option1 = document.createElement("option");
    option1.value = code;
    option1.textContent = `${code} - ${data[code]}`;
    fromCurrency.appendChild(option1);

    let option2 = document.createElement("option");
    option2.value = code;
    option2.textContent = `${code} - ${data[code]}`;
    toCurrency.appendChild(option2);
  }

  // Set defaults (USD → INR for example)
  fromCurrency.value = "USD";
  toCurrency.value = "INR";
}

// Convert single currency
async function convertSingle() {
  let amount = parseFloat(amountInput.value);
  let from = fromCurrency.value;
  let to = toCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive amount.");
    return;
  }

  if (from === to) {
    singleResult.textContent = "⚠️ Please select two different currencies.";
    return;
  }

  const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
  const data = await res.json();

  // Display result
  let rate = data.rates[to];
  singleResult.textContent = `${amount} ${from} = ${rate} ${to}`;
}

// Show all currencies in a modal
async function showAllConversionRates() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive amount in the form above.");
    return;
  }

  currencyListDiv.innerHTML = "<em>Loading rates...</em>";
  modal.style.display = "block";

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}`);
    const data = await res.json();

    if (data.error) {
      currencyListDiv.innerHTML = `<p class="error-msg">${data.error}</p>`;
      return;
    }

    currencyListDiv.innerHTML = ""; // Clear loading

    const gridContainer = document.createElement("div");
    gridContainer.className = "rates-grid";

    for (const code in data.rates) {
      const card = document.createElement("div");
      card.className = "rate-card";
      card.innerHTML = `
        <div class="rate-name">${currencyNames[code] || code}</div>
        <div class="rate-code">${code}</div>
        <div class="rate-value">${data.rates[code].toFixed(2)}</div>
      `;
      gridContainer.appendChild(card);
    }

    currencyListDiv.appendChild(gridContainer);
  } catch (error) {
    currencyListDiv.innerHTML = `<p class="error-msg">Failed to fetch rates. Please try again later.</p>`;
    console.error("Error fetching all rates:", error);
  }
}

// Event listeners
convertBtn.addEventListener("click", convertSingle);
viewAllBtn.addEventListener("click", showAllConversionRates);
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

// Initialize
loadCurrencies();
