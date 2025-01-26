export const exclude = (name: string) => false;
export const include = (name: string) => name.includes('-') || name.startsWith('stnl');
