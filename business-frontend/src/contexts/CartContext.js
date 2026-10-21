import React, { createContext, useContext, useState, useEffect } from 'react';
import { parsePrice } from '../utils/priceUtils';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        
        if (storedCart && storedCart !== 'undefined' && storedCart !== 'null') {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
            setCartCount(parsedCart.reduce((total, item) => total + item.quantity, 0));
          }
        }
      } catch (error) {
        console.error('Failed to parse cart data:', error);
        localStorage.removeItem('cart');
        setCartItems([]);
        setCartCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartFromStorage();
  }, []);

  // Update localStorage and cart count when cartItems change
  useEffect(() => {
    if (!isLoading) { // Only save to localStorage after initial load
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
    setCartCount(cartItems.reduce((total, item) => total + item.quantity, 0));
  }, [cartItems, isLoading]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {    
    setCartItems(prevItems => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new product to cart
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          store: product.store,
          quantity: quantity,
          stock: product.stock || 10
        };
        
        
        updatedItems = [...prevItems, newItem];
      }
      
      return updatedItems;
    });

    return true; // Return success status
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: Math.max(1, quantity) } 
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate cart total using utility function
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parsePrice(item.price);
      const quantity = parseInt(item.quantity) || 0;
      const itemTotal = price * quantity;
      
      
      return total + itemTotal;
    }, 0);
  };

  // Debug helper - can be removed in production
  const debugCartData = () => {
    console.log('Current cart items:', cartItems);
    console.log('Cart count:', cartCount);
    console.log('LocalStorage cart:', localStorage.getItem('cart'));
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartCount,
        isLoading,
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        getCartTotal,
        debugCartData
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 