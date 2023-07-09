type IngredientModel = {
  name: DietType;
  isInclude: boolean;
};

// Gluten Free, Vegaterian, Vegan, Lactos Free and Halal are the options for the diet type with IngeridentModel object
type DietType =
  | "Gluten Free"
  | "Vegaterian"
  | "Vegan"
  | "Lactos Free"
  | "Halal";

const defaultIngredients: IngredientModel[] = [
  {
    name: "Gluten Free",
    isInclude: false,
  },
  {
    name: "Vegaterian",
    isInclude: false,
  },
  {
    name: "Vegan",
    isInclude: false,
  },
  {
    name: "Lactos Free",
    isInclude: false,
  },
  {
    name: "Halal",
    isInclude: false,
  },
];

export { IngredientModel, defaultIngredients };
