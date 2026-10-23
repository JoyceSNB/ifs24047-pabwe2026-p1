export const sampleRecipe = (over: Partial<Recipe> = {}): Recipe => ({
  id: 1,
  title: "Arsik Ikan Mas",
  description: "Ikan bumbu kuning",
  image_url: null,
  user_id: 1,
  author_name: "Chef Demo",
  cooking_time: 60,
  servings: 4,
  difficulty: "Sedang",
  category_id: 2,
  category_name: "Lauk",
  ingredients: [{ id: 1, name: "Ikan mas", quantity: "1", unit: "ekor" }],
  steps: [{ id: 1, step_number: 1, instruction: "Haluskan bumbu" }],
  ...over,
});

export const sampleCategories: Category[] = [
  { id: 1, name: "Makanan Utama" },
  { id: 2, name: "Lauk" },
];

export const me: User = { id: 1, name: "Chef Demo", email: "demo@resep.id", avatar_url: null };