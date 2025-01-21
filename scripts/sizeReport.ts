import { minify } from 'uglify-js';

const DIR = import.meta.dir + '/../lib/';

const sizes: {
  Entry: string,
  Size: string,
  Minified: string,
  GZIP: string,
  "Minified GZIP": string,
}[] = [];

const toKB = (num: number) => (num / 1e3).toFixed(2) + 'KB';

for await (const path of new Bun.Glob('**/*.js').scan(DIR)) {
  const file = Bun.file(DIR + path);

  const stat = await file.stat();
  if (!stat.isFile()) continue;

  const code = await file.text();
  const minfiedCode = minify(code).code;

  sizes.push({
    Entry: path,
    Size: toKB(file.size),
    Minified: toKB(Buffer.from(minfiedCode).byteLength),
    GZIP: toKB(Bun.gzipSync(code).byteLength),
    "Minified GZIP": toKB(Bun.gzipSync(minfiedCode).byteLength)
  });
}

console.table(sizes);
