import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cart';
import type { Product } from '@/types';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'product-1',
  name: 'Aurora Pro 14 Ultrabook',
  slug: 'aurora-pro-14-ultrabook',
  description: 'A 14-inch ultrabook.',
  price: 118000,
  compareAtPrice: 135000,
  imageUrl: 'https://example.com/laptop.png',
  stock: 10,
  rating: 4.8,
  reviewCount: 124,
  featured: true,
  active: true,
  ...overrides,
});

const cartItem = (overrides: Partial<Product> = {}) => {
  const item = product(overrides);
  useCartStore.getState().addItem(item, 1);
};

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
    window.localStorage.clear();
  });

  it('adds a product and opens the drawer', () => {
    cartItem();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      productId: 'product-1',
      name: 'Aurora Pro 14 Ultrabook',
      price: 118000,
      quantity: 1,
    });
    expect(state.isOpen).toBe(true);
  });

  it('adds the requested quantity up to the available stock', () => {
    useCartStore.getState().addItem(product({ stock: 3 }), 5);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('falls back to a quantity of one when stock is not tracked', () => {
    useCartStore.getState().addItem(product({ stock: 0 }), 2);

    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('increments an existing line without exceeding stock', () => {
    cartItem({ stock: 2 });
    useCartStore.getState().addItem(product({ stock: 2 }), 5);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('keeps separate lines for different products', () => {
    cartItem();
    cartItem({ id: 'product-2', slug: 'aurora-phone', name: 'Aurora Phone' });

    expect(useCartStore.getState().items.map((item) => item.productId)).toEqual([
      'product-1',
      'product-2',
    ]);
  });

  it('removes a line', () => {
    cartItem();

    useCartStore.getState().removeItem('product-1');

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates the quantity and clamps it to stock', () => {
    cartItem({ stock: 4 });

    useCartStore.getState().updateQuantity('product-1', 3);
    expect(useCartStore.getState().items[0].quantity).toBe(3);

    useCartStore.getState().updateQuantity('product-1', 99);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it('drops the line when the quantity drops to zero or below', () => {
    cartItem();

    useCartStore.getState().updateQuantity('product-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);

    cartItem();
    useCartStore.getState().updateQuantity('product-1', -3);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('ignores quantity updates for unknown products', () => {
    cartItem();

    useCartStore.getState().updateQuantity('missing', 4);

    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('clears the cart and closes the drawer', () => {
    cartItem();

    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('opens, closes and toggles the drawer', () => {
    useCartStore.getState().open();
    expect(useCartStore.getState().isOpen).toBe(true);

    useCartStore.getState().close();
    expect(useCartStore.getState().isOpen).toBe(false);

    useCartStore.getState().toggle();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().toggle();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('counts items and totals the subtotal', () => {
    cartItem({ stock: 5 });
    useCartStore.getState().addItem(product({ id: 'product-2', slug: 'phone', price: 500 }), 2);

    expect(useCartStore.getState().itemCount()).toBe(3);
    expect(useCartStore.getState().subtotal()).toBe(118000 + 1000);
  });

  it('persists only the cart items', () => {
    cartItem();

    const persisted = JSON.parse(window.localStorage.getItem('aurora-cart') as string);

    expect(persisted.state.items).toHaveLength(1);
    expect(persisted.state).not.toHaveProperty('isOpen');
  });
});
