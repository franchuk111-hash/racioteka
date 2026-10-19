/* MIT. All monetary calculations use integer kopecks. No network calls. */
(function (root) {
  'use strict';
  function money(value) {
    const text = String(value).trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Вкажіть суму від 0, не більше двох знаків після коми.');
    const [whole, fraction = ''] = text.split('.');
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (!Number.isSafeInteger(cents) || cents > 1000000000) throw new Error('Сума має бути не більшою за 10 000 000 грн.');
    return cents;
  }
  function count(value, minimum, label) {
    if (!/^\d+$/.test(String(value).trim())) throw new Error(label + ': вкажіть ціле число.');
    const number = Number(value);
    if (number < minimum || number > 366) throw new Error(label + ': від ' + minimum + ' до 366.');
    return number;
  }
  function calculate(quote, daysValue) {
    const days = count(daysValue, 1, 'Кількість днів');
    const daily = money(quote.daily);
    const deliveryFee = money(quote.deliveryFee);
    const deliveries = count(quote.deliveries, 0, 'Кількість доставок');
    const extras = money(quote.extras);
    const discount = money(quote.discount);
    const meals = daily * days;
    const delivery = deliveryFee * deliveries;
    const total = meals + delivery + extras - discount;
    if (total < 0) throw new Error('Знижка перевищує вартість замовлення.');
    return { days, meals, delivery, extras, discount, total, perDay: total / days };
  }
  const api = { money, count, calculate };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RaciotekaCost = api;
})(typeof window === 'object' ? window : this);
