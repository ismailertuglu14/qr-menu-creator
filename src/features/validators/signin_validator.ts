import * as yup from "yup";

export const signInValidator = yup.object().shape({
  userNameOrEmail: yup.string().required().min(3).max(128),
  password: yup.string().required().min(6).max(128),
});

