import { summary, run, bench, do_not_optimize } from 'mitata';
import type { Tests } from '@/utils';
import tests from './tests';
import cases from './src';

import { exclude, include } from './filter';

const casesMap = new Map<string, [string, Tests[keyof Tests]][]>();

// Map cases
for (const c of cases) {
  const name = c.name;
  if (exclude(name) || !include(name)) continue;

  for (const test in c.tests) {
    const fn = c.tests[test as keyof typeof c.tests];

    if (casesMap.has(test))
      casesMap.get(test)!.push([name, fn]);
    else
      casesMap.set(test, [[name, fn]]);
  }
}

// Register to mitata
casesMap.forEach((val, key) => {
  summary(() => {
    console.log('Start bench:', key);

    const suite = tests[key as keyof typeof tests];
    const suiteData = suite.map((t) => t.data);

    for (const test of val) {
      const fn = test[1];

      // Check if function validate correctly
      suite.forEach((t) => t.validate(fn));

      // Try to optimize
      for (let i = 0; i < 100; i++)
        do_not_optimize(suiteData.map(fn));

      bench(test[0], () => do_not_optimize(suiteData.map(fn))).gc('inner');
    }
  });
});

run();
