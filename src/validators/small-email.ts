//const reg = /^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const DOMAIN_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const NAME_REGEX = /^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+$/;

export default (str: string): boolean => {
  const parts = str.split('@');
  return parts.length === 2 && NAME_REGEX.test(parts[0]) && DOMAIN_REGEX.test(parts[1]);
};
