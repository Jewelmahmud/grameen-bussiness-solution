import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApiService } from '../hooks/useApiService';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Example of updating a component to use the API service
const BazarDetailWithApi = () => {
  const { id } = useParams();
  const { loading, error, useBazars, useStores } = useApiService();
  const { fetchBazarById } = useBazars();
  const { stores, fetchStores } = useStores();
  
  const [bazar, setBazar] = useState(null);
  const [bazarLoading, setBazarLoading] = useState(true);
  const [storesLoading, setStoresLoading] = useState(true);
  const [bazarError, setBazarError] = useState(null);

  // Fetch bazar details
  useEffect(() => {
    const loadBazar = async () => {
      setBazarLoading(true);
      try {
        const data = await fetchBazarById(id);
        setBazar(data);
      } catch (err) {
        setBazarError('Failed to load bazar details');
        console.error(err);
      } finally {
        setBazarLoading(false);
      }
    };

    loadBazar();
  }, [id, fetchBazarById]);

  // Fetch stores in this bazar
  useEffect(() => {
    const loadStores = async () => {
      setStoresLoading(true);
      try {
        await fetchStores({ bazar_id: id });
      } catch (err) {
        console.error('Failed to load stores:', err);
      } finally {
        setStoresLoading(false);
      }
    };

    if (bazar) {
      loadStores();
    }
  }, [bazar, id, fetchStores]);

  if (bazarLoading) {
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

  if (bazarError || !bazar) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert severity="error">
            {bazarError || 'Bazar not found'}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Box 
        sx={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bazar.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom>
            {bazar.name}
          </Typography>
          <Typography variant="h6">
            {bazar.location}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h5" gutterBottom>
          About {bazar.name}
        </Typography>
        <Typography paragraph>
          {bazar.description}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Stores in {bazar.name}
          </Typography>
          
          {storesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : stores.length > 0 ? (
            <Grid container spacing={3}>
              {stores.map((store) => (
                <Grid item xs={12} sm={6} md={4} key={store.id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box 
                      component="img"
                      src={store.logo_url}
                      alt={store.name}
                      sx={{ 
                        height: 140, 
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 2
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {store.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                      {store.description.substring(0, 100)}...
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      component={Link}
                      to={`/stores/${store.id}`}
                    >
                      Visit Store
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No stores found in this bazar.
            </Alert>
          )}
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default BazarDetailWithApi;
