export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const getEnvNumber = (key: string): number => {
  const raw = getEnv(key);
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return value;
};
