type NutritionModel = {
  name: NutritionType;
  value: Number;
};

type NutritionType = "Protein" | "Carbs" | "Fats" | "Fibre";

const defaultNutritionTypes: NutritionModel[] = [
  {
    name: "Protein",
    value: 0,
  },
  {
    name: "Carbs",
    value: 0,
  },
  {
    name: "Fats",
    value: 0,
  },
  {
    name: "Fibre",
    value: 0,
  },
];

export { NutritionModel, NutritionType, defaultNutritionTypes };
