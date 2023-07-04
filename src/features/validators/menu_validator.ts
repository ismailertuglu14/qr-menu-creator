import * as yup from "yup";

const menuValidator = yup.object().shape({
  restaurantId: yup.string().required(),
  templateId: yup.string().required(),
});
export default menuValidator;
