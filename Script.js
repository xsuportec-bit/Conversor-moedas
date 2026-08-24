// ===== Elementos do DOM =====
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const convertBtn = document.getElementById('convertBtn');
const convertedSpan = document.getElementById('convertedValue');
const rateInfoSpan = document.getElementById('rateInfo');

// ===== Função para buscar taxa de câmbio =====
async function getExchangeRate(from, to) {
  // Usamos a API Frankfurter (gratuita, sem chave)
  const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro na API');
    }
    const data = await response.json();
    // data.rates[to] contém a taxa
    return data.rates[to];
  } catch (error) {
    console.error('Erro ao buscar câmbio:', error);
    return null;
  }
}

// ===== Função principal de conversão =====
async function convert() {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    convertedSpan.textContent = 'Digite um valor válido';
    rateInfoSpan.textContent = '';
    return;
  }

  const from = fromSelect.value;
  const to = toSelect.value;

  // Se a moeda de origem e destino forem iguais, resultado é o mesmo valor
  if (from === to) {
    convertedSpan.textContent = formatCurrency(amount, to);
    rateInfoSpan.textContent = `1 ${from} = 1 ${to}`;
    return;
  }

  // Mostrar loading
  convertedSpan.textContent = 'Carregando...';
  rateInfoSpan.textContent = '';

  const rate = await getExchangeRate(from, to);
  if (rate === null) {
    convertedSpan.textContent = 'Erro ao obter cotação';
    rateInfoSpan.textContent = 'Tente novamente mais tarde';
    return;
  }

  const result = amount * rate;
  convertedSpan.textContent = formatCurrency(result, to);
  rateInfoSpan.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}  •  Atualizado hoje`;
}

// ===== Formatação monetária =====
function formatCurrency(value, currencyCode) {
  // Tenta usar o locale do navegador para a moeda
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    // Fallback caso a moeda não seja suportada
    return `${value.toFixed(2)} ${currencyCode}`;
  }
}

// ===== Eventos =====
convertBtn.addEventListener('click', convert);

// Converter automaticamente ao mudar os selects ou o valor (com debounce)
amountInput.addEventListener('input', () => {
  clearTimeout(window._convertTimeout);
  window._convertTimeout = setTimeout(convert, 400);
});

fromSelect.addEventListener('change', convert);
toSelect.addEventListener('change', convert);

// ===== Conversão inicial ao carregar a página =====
document.addEventListener('DOMContentLoaded', convert);
