import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  const saltRounds = 10;

  try {
    var x;
    const hashedPassword = await bcrypt
      .genSalt(saltRounds)
      .then((salt) => {
        x = bcrypt.hash(password, salt);
      })
      .then((hash) => {
        console.log("Hash: ", hash);
      })
      .catch((err) => console.error(err.message));
    console.log("x,", x);
    return x;
  } catch (error) {
    throw new Error("Şifre hashleme hatası: " + error.message);
  }
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    throw new Error("Şifre karşılaştırma hatası: " + error.message);
  }
}
