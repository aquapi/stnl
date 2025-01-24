import { summary, run, bench, do_not_optimize } from 'mitata';
import type { Tests } from './defineCase';
import tests from './tests';
import cases from './src';

const casesMap = new Map<string, [string, Tests[keyof Tests]][]>();

// Map cases
for (const c of cases) {
  const name = c.name;

  for (const test in c.tests) {
    const fn = c.tests[test as keyof Tests];

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
    const suite = tests[key as keyof typeof tests].map((t) => t.data);

    for (const test of val) {
      const fn = test[1];
      bench(test[0], () => do_not_optimize(suite.map(fn))).gc('inner');
    }
  });
});

run();
