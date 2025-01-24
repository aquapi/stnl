import { Glob } from "bun";

const DIR = import.meta.dir + '/src/';
const TESTS = import.meta.dir + '/tests/';

const nameOf = (path: string, ext: string) => JSON.stringify(path.substring(0, path.lastIndexOf(ext)));

// Run build script
{
  for (const path of new Glob('**/*.build.ts').scanSync(DIR)) {
    await Bun.$`bun run ${DIR + path}`;
  }
}

// Load validators
{
  const items = Array.from(new Glob('**/*.case.ts').scanSync(DIR));

  await Bun.write(
    DIR + 'index.ts',
    items.map((path, i) => `import _${i} from ${nameOf('./' + path, '.ts')};`).join('')
    + `export default [${items.map((_, i) => '_' + i).join()}];`
  );
}

// Load test cases
{
  const items = Array.from(new Glob('**/*.case.ts').scanSync(TESTS));

  await Bun.write(
    TESTS + 'index.ts',
    items.map((path, i) => `import _${i} from ${nameOf('./' + path, '.ts')};`).join('')
    + `export default {${items.map((path, i) => `${nameOf(path, '.case.ts')}:_${i}`).join()}};`
  );
}
