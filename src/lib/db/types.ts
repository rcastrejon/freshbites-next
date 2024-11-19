export type Recipe = {
  id: string;
  title: string;
  imageUrl: string;
  timeInMinutes: number;
  cost: number;
  servings: number;
  caloriesPerServing?: number | null;
  verifiedAt: number | null;
};
