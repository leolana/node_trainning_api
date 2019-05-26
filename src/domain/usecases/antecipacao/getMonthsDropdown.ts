import { DateTime } from 'luxon';

const getMonthsDropdown = (quantityMonths, startingDate = new Date()) => {
  const answer = [];
  const now = DateTime.fromJSDate(startingDate).setLocale('pt');

  // tslint:disable-next-line:no-increment-decrement
  for (let qt = 0; qt < quantityMonths; qt++) {
    const option = now.plus({ month: qt });

    answer.push({
      id: option.toFormat('yyyy-MM'),
      text: (() => {
        const str = option.toFormat('MMMM/yyyy');
        return str[0].toUpperCase() + str.slice(1);
      })(),
    });
  }

  return Promise.resolve(answer);
};

export default getMonthsDropdown;
