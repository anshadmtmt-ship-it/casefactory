import { useProducts } from '../Products/useProducts';

export function useHotPicks() {
  const { products } = useProducts();
  
  const featuredProducts = products.filter((p) => p.is_hot);
  
  // Sort by updated_at descending so newest hot picks are first
  const allProductsSorted = [...featuredProducts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const homepageProducts = allProductsSorted.slice(0, 4);

  return {
    products,
    featuredProducts: allProductsSorted,
    homepageProducts,
  };
}
