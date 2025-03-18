import * as hbs from 'hbs';

export function registerHelpers() {
  hbs.registerHelper('formatDate', function (date: string) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleString('id-ID', {
      year: '2-digit',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  });

  hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });
}

hbs.registerHelper('formatCurrency', function (amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
});
