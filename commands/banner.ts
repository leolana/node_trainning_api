// tslint:disable:no-console
// tslint:disable:no-any
// tslint:disable:no-unsafe-any

import * as chalk from 'chalk';
import * as figlet from 'figlet';

const positionTwo: number = 2;

figlet.text(process.argv[positionTwo], (error: any, data: any) => {
  if (error) {
    return process.exit(1);
  }

  console.log(chalk.blue(data));
  console.log('');

  return process.exit(0);
});
