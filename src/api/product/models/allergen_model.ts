type AllergenModel = {
  name: string;
  isAllergen: boolean;
};

const defaultAllergenTypes: AllergenModel[] = [
  {
    name: "Molluscs",
    isAllergen: false,
  },

  {
    name: "Eggs",
    isAllergen: false,
  },
  {
    name: "Fish",
    isAllergen: false,
  },
  {
    name: "Lupin",
    isAllergen: false,
  },
  {
    name: "Soya",
    isAllergen: false,
  },
  {
    name: "Milk",
    isAllergen: false,
  },
  {
    name: "Peanuts",
    isAllergen: false,
  },
  {
    name: "Gluten",
    isAllergen: false,
  },
  {
    name: "Mustard",
    isAllergen: false,
  },
  {
    name: "Nuts",
    isAllergen: false,
  },
  {
    name: "Sesame",
    isAllergen: false,
  },
  {
    name: "Celery",
    isAllergen: false,
  },
  {
    name: "Sulphites",
    isAllergen: false,
  },
  {
    name: "Crustaceans",
    isAllergen: false,
  },
];

export { AllergenModel, defaultAllergenTypes };
