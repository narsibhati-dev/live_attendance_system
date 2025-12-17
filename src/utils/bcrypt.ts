import bcrypt from "bcrypt";

export const HashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const VerifyPassword = (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
