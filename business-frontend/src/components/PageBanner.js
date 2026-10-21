import React from 'react';
import { Container, Typography, Box, TextField, InputAdornment, IconButton, Breadcrumbs, Link } from '@mui/material';
import { Search as SearchIcon, Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { getBannerConfig } from '../config/bannerConfig';
import '../styles/PageBanner.css';

const PageBanner = ({ 
  title: propTitle,
  subtitle: propSubtitle,
  breadcrumbs: propBreadcrumbs,
  currentPlaceholder: propPlaceholder,
  videoSrc: propVideoSrc
}) => {
  const location = useLocation();
  const config = getBannerConfig(location.pathname);

  // Use props if provided, otherwise fall back to route-based config
  const title = propTitle || config.title;
  const subtitle = propSubtitle || config.subtitle;
  const breadcrumbs = propBreadcrumbs || config.breadcrumbs;
  const currentPlaceholder = propPlaceholder || config.currentPlaceholder;
  const videoSrc = propVideoSrc || config.videoSrc;

  return (
    <div className="page-banner">
      {/* Video Background */}
      <video 
        className="banner-video-background"
        autoPlay 
        muted 
        loop
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="banner-overlay"></div>
      
      <Container maxWidth="xl" className="banner-content">
        <Box className="banner-layout">
          {/* Left side - Title, subtitle, breadcrumbs */}
          <Box className="banner-text">
            <Typography variant="h5" component="p" className="banner-subtitle">
              {subtitle}
            </Typography>
            <Typography variant="h3" component="h1" className="banner-title">
              {title}
            </Typography>
            
            {/* Breadcrumbs */}
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" className="breadcrumb-icon" />} 
              aria-label="breadcrumb"
              className="breadcrumbs"
            >
              <Link 
                underline="hover" 
                color="inherit" 
                href="/" 
                className="breadcrumb-link"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                হোম
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <Link
                  key={index}
                  underline="hover"
                  color="inherit"
                  href={crumb.link}
                  className="breadcrumb-link"
                >
                  {crumb.label}
                </Link>
              ))}
              <Typography color="text.primary" className="breadcrumb-current">
                {title}
              </Typography>
            </Breadcrumbs>
          </Box>
          
          {/* Right side - Search */}
          <Box className="banner-search">
            <TextField
              fullWidth
              placeholder={currentPlaceholder}
              variant="outlined"
              className="search-field white-placeholder" 
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" className="white-icon">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default PageBanner;