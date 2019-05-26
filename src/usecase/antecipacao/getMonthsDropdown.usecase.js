const { DateTime } = require('luxon');

module.exports = (quantityMonths, startingDate = new Date()) => {
  const answer = [];
  const now = DateTime.fromJSDate(startingDate).setLocale('pt');

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
