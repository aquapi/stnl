import { TSCONFIG } from "@utils";

await Bun.$`bun typia generate --input ${import.meta.dir + '/src'} --output ${import.meta.dir + '/lib'} --project ${TSCONFIG}`;
