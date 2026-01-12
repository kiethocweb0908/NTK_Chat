import bcrypt from 'bcryptjs';

export const hashValue = async (password: string, saltNumber: number = 10) => {
  const salt = await bcrypt.genSalt(saltNumber);
  return await bcrypt.hash(password, salt);
};

export const comparaValue = async (password: string, hashPassword: string) => {
  return await bcrypt.compare(password, hashPassword);
};
