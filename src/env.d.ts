/** Konstanta yang disuntikkan Vite lewat `define` pada vite.config.ts. */
declare const API_URL: string;

interface ApiResult<T = any> {
  ok: boolean;
  message: string;
  data: T;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface Category {
  id: number;
  name: string;
  recipe_count?: number;
}

interface Ingredient {
  id?: number;
  name: string;
  quantity: string | number;
  unit: string;
}

interface Step {
  id?: number;
  step_number?: number;
  instruction: string;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  /** Path gambar di backend (mis. /api/recipes/1/image?v=123), atau null. */
  image_url: string | null;
  user_id: number | null;
  author_name: string | null;
  cooking_time: number;
  servings: number;
  difficulty: "Mudah" | "Sedang" | "Sulit";
  category_id: number;
  category_name: string;
  ingredients?: Ingredient[];
  steps?: Step[];
}

interface RecipeBody {
  title: string;
  description: string;
  image: File | null;
  remove_image: boolean;
  cooking_time: number;
  servings: number;
  difficulty: string;
  category_id: number;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: string[];
}
