import { run, bench, do_not_optimize } from 'mitata';

const emails = [
  'test@io.com',
  'test.io@epam.com',
  'test.io.example+today@epam.com',
  'test-io@epam.com',
  'test@io-epam.com',
  'test-io@epam-usa.com',
  '123456789testio@epam2.com',

  'test.io.com',
  'test@io@epam.com',
  'test(io"epam)example]com',
  'test"io"epam.com',

  'email@example.com',
  'firstname.lastname@example.com',
  'email@subdomain.example.com',
  'firstname+lastname@example.com',
  'email@123.123.123.123',
  '"email"@example.com',
  '1234567890@example.com',
  'email@example-one.com',
  '_______@example.com',
  'email@example.name',
  'email@example.museum',
  'email@example.co.jp',
  'firstname-lastname@example.com',

  'much."more\ unusual"@example.com',
  'very.unusual."@".unusual.com@example.com',
  'very."(),:;<>[]".VERY."very@\\\\\\ \"very".unusual@strange.example.com',

  'plainaddress',
  '#@%^%#$@#$@#.com',

  '"(),:;<>[\]@example.com',
  'just"not"right@example.com',
  'this\ is\"really\"not\\\\allowed@example.com'
];

bench('Baseline', function* () {
  yield {
    [0]() {
      return emails;
    },
    bench(emails: string[]) {
      for (let i = 0; i < emails.length; i++)
        do_not_optimize((/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/).test(emails[i]));
    }
  }
});

bench('First part non-greedy', function* () {
  yield {
    [0]() {
      return emails;
    },
    bench(emails: string[]) {
      for (let i = 0; i < emails.length; i++)
        do_not_optimize((/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/).test(emails[i]));
    }
  }
});

run();
