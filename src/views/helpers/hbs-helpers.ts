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
}
