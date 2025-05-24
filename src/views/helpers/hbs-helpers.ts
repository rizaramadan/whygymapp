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

  hbs.registerHelper('extractDate', function (date: string) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  });

  hbs.registerHelper('extractDateId', function (date: string) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  });

  //create helper to show remaining days from now to the date
  hbs.registerHelper('remainingDays', function (date: string) {
    if (!date) return '';
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = dateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  });

  hbs.registerHelper('dashToSpaceCapitalize', function (text: string) {
    if (!text) return '';
    return text.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  });

  hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });

  hbs.registerHelper('eq', function (a: any, b: any) {
    return a === b;
  });

  hbs.registerHelper('neq', function (a: any, b: any) {
    return a !== b;
  });

  hbs.registerHelper('formatCurrency', function (amount: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  });

  hbs.registerHelper('multiply', function (a: number, b: number) {
    return a * b;
  });
}
