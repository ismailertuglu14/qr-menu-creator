import * as yup from "yup";

export const signUpValidator = yup.object().shape({
  email: yup.string().required().email().min(3).max(128),
  password: yup.string().required().min(6).max(128),
  passwordAgain: yup
    .string()
    .required()
    .min(6)
    .max(128)
    .oneOf([yup.ref("password")]),

  countryCode: yup.string().required().min(1).max(6),
  phoneNumber: yup.string().required().min(6).max(128),
});
