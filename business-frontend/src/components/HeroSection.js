import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { getBannerConfig } from '../config/bannerConfig';
import '../styles/HeroSection.css'; // Import the CSS file

const HeroSection = ({ 
  title: propTitle,
  subtitle: propSubtitle,
  placeholders: propPlaceholders,
  searchPlaceholder: propSearchPlaceholder,
  videoSrc: propVideoSrc
}) => {
  const location = useLocation();
  const config = getBannerConfig(location.pathname);
  const heroConfig = config.hero;

  // Use props if provided, otherwise fall back to route-based config
  const title = propTitle || heroConfig.title;
  const subtitle = propSubtitle || heroConfig.subtitle;
  const placeholders = propPlaceholders || heroConfig.placeholders;
  const searchPlaceholder = propSearchPlaceholder || heroConfig.searchPlaceholder;
  const videoSrc = propVideoSrc || config.videoSrc;

  // Typewriter effect state
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typeSpeed = 150; // Speed for typing effect (ms)
    const eraseSpeed = 75; // Speed for erasing effect (ms)
    const pauseTime = 1500; // How long to pause at full text (ms)

    let timer;
    
    if (isTyping) {
      // Typing effect
      if (charIndex < placeholders[placeholderIndex].length) {
        timer = setTimeout(() => {
          setCurrentPlaceholder(prevText => 
            prevText + placeholders[placeholderIndex][charIndex]
          );
          setCharIndex(charIndex + 1);
        }, typeSpeed);
      } else {
        // Finished typing, pause before erasing
        timer = setTimeout(() => {
          setIsTyping(false);
        }, pauseTime);
      }
    } else {
      // Erasing effect
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setCurrentPlaceholder(prevText => prevText.slice(0, -1));
          setCharIndex(charIndex - 1);
        }, eraseSpeed);
      } else {
        // Finished erasing, move to next placeholder
        setIsTyping(true);
        setPlaceholderIndex((placeholderIndex + 1) % placeholders.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isTyping, placeholderIndex, placeholders]);

  return (
    <div className="hero-section">
      {/* Video Background */}
      <video 
        className="hero-video-background"
        autoPlay 
        muted 
        loop
      >
        <source src={videoSrc} type="video/mp4" />
        {/* Add fallback sources if needed */}
        Your browser does not support the video tag.
      </video>
      <div class="video-overlay"></div>      
      <Container maxWidth="md" className="hero-content">
        <Typography variant="h3" component="h1" className="hero-title">
          {title}
        </Typography>
        <Typography variant="h5" component="h2" className="hero-subtitle">
          {subtitle}
        </Typography>
        <Box className="search-container">
            <TextField
                fullWidth
                placeholder={currentPlaceholder || searchPlaceholder}
                variant="outlined"
                className="search-field main-search white-placeholder" 
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
      </Container>
    </div>
  );
};

export default HeroSection;