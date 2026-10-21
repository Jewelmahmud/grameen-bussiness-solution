import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApiService } from '../hooks/useApiService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip
} from '@mui/material';
import { 
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductDetailWithApi = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { loading, error, useProducts } = useApiService();
  const { fetchProductById } = useProducts();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    const loadProduct = async () => {
      setProductLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        
        // In a real implementation, we would fetch related products
        // For now, we'll simulate it
        setRelatedProducts([
          {
            id: 101,
            name: 'Related Product 1',
            price: 120,
            image_url: 'https://picsum.photos/300/200',
            rating: 4.5
          },
          {
            id: 102,
            name: 'Related Product 2',
            price: 150,
            image_url: 'https://picsum.photos/300/200',
            rating: 4.2
          },
          {
            id: 103,
            name: 'Related Product 3',
            price: 90,
            image_url: 'https://picsum.photos/300/200',
            rating: 4.7
          },
          {
            id: 104,
            name: 'Related Product 4',
            price: 110,
            image_url: 'https://picsum.photos/300/200',
            rating: 4.3
          }
        ]);
      } catch (err) {
        setProductError('Failed to load product details');
        console.error(err);
      } finally {
        setProductLoading(false);
      }
    };

    loadProduct();
  }, [id, fetchProductById]);

  const handleAddToCart = () => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product is already in cart
    const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: product.image_url,
        store: product.store.name,
        quantity: quantity,
        stock: product.stock
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show success message
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (productLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </>
    );
  }

  if (productError || !product) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert severity="error">
            {productError || 'Product not found'}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {addedToCart && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Product added to cart successfully!
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={product.image_url}
                alt={product.name}
              />
              {product.images && product.images.length > 0 && (
                <Box sx={{ display: 'flex', p: 2 }}>
                  {product.images.map((image, index) => (
                    <Box 
                      key={index}
                      component="img"
                      src={image.url}
                      alt={`${product.name} view ${index + 1}`}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        objectFit: 'cover', 
                        borderRadius: 1,
                        mr: 1,
                        border: index === 0 ? '2px solid #5e35b1' : '1px solid #e0e0e0',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              {product.category && (
                <Chip label={product.category.name} color="primary" size="small" sx={{ mb: 2 }} />
              )}
              
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={product.rating || 0} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({product.review_count || 0} reviews)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                {product.sale_price && product.sale_price < product.price ? (
                  <>
                    <Typography variant="h4" color="primary" sx={{ mr: 2 }}>
                      ৳{product.sale_price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      ৳{product.price}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h4" color="primary">
                    ৳{product.price}
                  </Typography>
                )}
                <Typography variant="body1" sx={{ ml: 1 }}>
                  per {product.unit || 'unit'}
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Availability: <Chip 
                    label={product.stock > 0 ? 'In Stock' : 'Out of Stock'} 
                    color={product.stock > 0 ? 'success' : 'error'} 
                    size="small" 
                  />
                </Typography>
                {product.stock > 0 && (
                  <Typography variant="body2">
                    {product.stock} {product.unit || 'units'} available
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Quantity:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Typography sx={{ mx: 2 }}>
                    {quantity}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    disabled={quantity >= (product.stock || 10)}
                  >
                    +
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  startIcon={<CartIcon />}
                  sx={{ mr: 2, flexGrow: 1 }}
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  startIcon={<FavoriteIcon />}
                >
                  Wishlist
                </Button>
              </Box>
              
              {product.store && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sold by:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {product.store.logo_url && (
                      <Box 
                        component="img"
                        src={product.store.logo_url}
                        alt={product.store.name}
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: '50%',
                          mr: 2
                        }}
                      />
                    )}
                    <Box>
                      <Typography variant="h6">
                        {product.store.name}
                      </Typography>
                      <Rating value={product.store.rating || 0} size="small" readOnly />
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ ml: 'auto' }}
                      component={Link}
                      to={`/stores/${product.store.id}`}
                    >
                      Visit Store
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Related Products */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image_url}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={item.rating} size="small" readOnly />
                    </Box>
                    <Typography variant="h6" color="primary">
                      ৳{item.price}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      fullWidth
                      startIcon={<CartIcon />}
                      component={Link}
                      to={`/products/${item.id}`}
                    >
                      View Product
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default ProductDetailWithApi;
