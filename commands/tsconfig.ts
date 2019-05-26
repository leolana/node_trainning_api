// tslint:disable:no-console
// tslint:disable:no-any
// tslint:disable:no-unsafe-any

import * as jsonfile from 'jsonfile';
import * as path from 'path';

import * as tsconfig from '../tsconfig.json';

const content: any = tsconfig;
content.compilerOptions.outDir = '.tmp';
content.include = [
  'src/**/*',
];

const filePath: string = path.join(process.cwd(), 'tsconfig.build.json');
jsonfile.writeFile(filePath, content, { spaces: 2 }, (err: any) => {
  if (err === null) {
    process.exit(0);
  } else {
    console.error('Failed to generate the tsconfig.build.json', err);
    process.exit(1);
  }
});
