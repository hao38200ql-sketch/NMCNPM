import { createContext, useContext, useState, useMemo, useCallback } from "react";
import db from "../database.json";

const ProductContext = createContext();

const initialCategories = [
  { key: "ngu-coc", label: "Ngũ Cốc", icon: "🌾" },
  { key: "banh-mi", label: "Bánh Mì", icon: "🍞" },
  { key: "sua-trung", label: "Sữa & Trứng", icon: "🥛" },
  { key: "thit", label: "Thịt", icon: "🥩" },
  { key: "hai-san", label: "Hải Sản", icon: "🦐" },
  { key: "rau-cu", label: "Rau Củ", icon: "🥦" },
  { key: "trai-cay", label: "Trái Cây", icon: "🍎" },
];

const initialProducts = db.products;

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);

  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: String(Date.now()), reviews: [] };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id, updated) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === String(id) ? { ...p, ...updated } : p))
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== String(id)));
  }, []);

  const addCategory = useCallback((category) => {
    setCategories((prev) => [...prev, category]);
  }, []);

  const updateCategory = useCallback((key, updated) => {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...updated } : c))
    );
  }, []);

  const deleteCategory = useCallback((key) => {
    setCategories((prev) => prev.filter((c) => c.key !== key));
  }, []);

  const setPriceRange = useCallback((min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  }, []);

  const resetPriceRange = useCallback(() => {
    setMinPrice(0);
    setMaxPrice(1000000);
  }, []);

  const value = useMemo(() => ({
    products,
    categories,
    minPrice,
    maxPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    setPriceRange,
    resetPriceRange,
  }), [
    products,
    categories,
    minPrice,
    maxPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    setPriceRange,
    resetPriceRange,
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  return useContext(ProductContext);
}