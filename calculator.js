(function () {
  'use strict';
  const form = document.getElementById('comparison');
  const error = document.getElementById('error');
  const results = document.getElementById('results');
  const cards = document.getElementById('result-cards');
  const exampleNote = document.getElementById('example-note');
  const fields = ['daily', 'deliveryFee', 'deliveries', 'extras', 'discount'];
  const format = cents => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', minimumFractionDigits: 2 }).format(cents / 100);
  const input = id => document.getElementById(id);
  function clearState() {
    error.hidden = true;
    results.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  }
  form.addEventListener('input', () => { clearState(); exampleNote.hidden = true; });
  form.addEventListener('reset', () => { clearState(); exampleNote.hidden = true; });
  function compare(focus) {
    clearState();
    let active = input('days');
    try {
      RaciotekaCost.count(active.value, 1, 'Кількість днів');
      const quotes = ['a', 'b'].map((key, index) => {
        const quote = {};
        for (const field of fields) {
          active = input(key + '-' + field);
          quote[field] = active.value;
          if (field === 'deliveries') RaciotekaCost.count(active.value, 0, 'Кількість доставок');
          else RaciotekaCost.money(active.value);
        }
        active = input(key + '-discount');
        return { name: input(key + '-name').value.trim() || 'Варіант ' + (index ? 'Б' : 'А'), ...RaciotekaCost.calculate(quote, input('days').value) };
      });
      cards.replaceChildren();
      for (const quote of quotes) {
        const card = document.createElement('article');
        card.className = 'result-card';
        const title = document.createElement('h3'); title.textContent = quote.name;
        const total = document.createElement('p'); total.className = 'total'; total.textContent = format(quote.total);
        const daily = document.createElement('p'); daily.className = 'per-day'; daily.textContent = format(quote.perDay) + ' / день · ' + quote.days + ' днів';
        const breakdown = document.createElement('dl');
        for (const [label, amount] of [['Харчування', quote.meals], ['Доставка', quote.delivery], ['Доплати', quote.extras], ['Знижка', quote.discount ? -quote.discount : 0]]) {
          const row = document.createElement('div');
          const term = document.createElement('dt'); term.textContent = label;
          const value = document.createElement('dd'); value.textContent = format(amount);
          row.append(term, value); breakdown.append(row);
        }
        card.append(title, total, daily, breakdown); cards.append(card);
      }
      const difference = Math.abs(quotes[0].total - quotes[1].total);
      const verdict = document.getElementById('verdict');
      if (!difference) verdict.textContent = 'Повна вартість однакова. Порівняйте меню та умови.';
      else {
        const winner = quotes[0].total < quotes[1].total ? quotes[0] : quotes[1];
        verdict.textContent = winner.name + ' коштує на ' + format(difference) + ' менше за ' + winner.days + ' днів.';
      }
      results.hidden = false;
      if (focus) results.focus();
    } catch (failure) {
      active.setAttribute('aria-invalid', 'true');
      const label = form.querySelector('label[for="' + active.id + '"]');
      const group = active.closest('fieldset');
      error.textContent = (group ? (group.dataset.offer === 'a' ? 'Перший варіант. ' : 'Другий варіант. ') : '') + (label ? label.textContent + ': ' : '') + failure.message;
      error.hidden = false;
      active.focus();
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); compare(true); });
  document.getElementById('example').addEventListener('click', () => {
    input('days').value = '5';
    const examples = { a: ['Приклад А', '500', '80', '3', '100', '50'], b: ['Приклад Б', '550', '0', '3', '0', '0'] };
    for (const key of ['a', 'b']) ['name', ...fields].forEach((field, i) => { input(key + '-' + field).value = examples[key][i]; });
    compare(true);
    exampleNote.hidden = false;
  });
})();
