import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import footerBn from '../i18n/bn/footer';
import footerEn from '../i18n/en/footer';
import footerNp from '../i18n/np/footer';
import footerPk from '../i18n/pk/footer';
import footerDe from '../i18n/de/footer';
import footerBt from '../i18n/bt/footer';
import footerSl from '../i18n/sl/footer';
import footerAf from '../i18n/af/footer';
import footerCn from '../i18n/cn/footer';
import { useEffect, useState } from 'react';

const Footer = () => {
  const storedLang = typeof window !== 'undefined' ? (localStorage.getItem('preferredLanguage') || 'bn') : 'bn';
  const t = storedLang === 'en' ? footerEn : 
            storedLang === 'np' ? footerNp : 
            storedLang === 'pk' ? footerPk : 
            storedLang === 'bt' ? footerBt : 
            storedLang === 'de' ? footerDe : 
            storedLang === 'sl' ? footerSl : 
            storedLang === 'af' ? footerAf : 
            storedLang === 'cn' ? footerCn : 
            footerBn;

  const footerLinks = {
    company: [
      { title: t.links.about, path: '/about' },
      { title: t.links.career, path: '/career' },
      { title: t.links.contact, path: '/contact' },
      { title: t.links.help, path: '/help' }
    ],
    business: [
      { title: t.links.becomeSeller, path: '/become-seller' },
      { title: t.links.businessAccount, path: '/business' },
      { title: t.links.marketplacePolicy, path: '/marketplace-policy' }
    ],
    support: [
      { title: t.links.deliveryPolicy, path: '/delivery-policy' },
      { title: t.links.returnPolicy, path: '/return-policy' },
      { title: t.links.privacyPolicy, path: '/privacy-policy' }
    ]
  };

  const socialLinks = [
    { icon: <FacebookIcon />, url: 'https://facebook.com/grameenbazar' },
    { icon: <TwitterIcon />, url: 'https://twitter.com/grameenbazar' },
    { icon: <InstagramIcon />, url: 'https://instagram.com/grameenbazar' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com/company/grameenbazar' }
  ];

  const contactInfo = [
    { icon: <PhoneIcon />, text: '+880 1234 567890' },
    { icon: <EmailIcon />, text: 'info@grameenbazar.com' },
    { icon: <LocationIcon />, text: t.contact.address }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t.company}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t.description}
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              {t.links.company}
            </Typography>
            <Stack spacing={1}>
              {footerLinks.company.map((link, index) => (
                <MuiLink
                  key={index}
                  component={Link}
                  to={link.path}
                  color="inherit"
                  underline="hover"
                  sx={{ 
                    '&:hover': { 
                      color: '#ffd54f'
                    }
                  }}
                >
                  {link.title}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              {t.links.business}
            </Typography>
            <Stack spacing={1}>
              {footerLinks.business.map((link, index) => (
                <MuiLink
                  key={index}
                  component={Link}
                  to={link.path}
                  color="inherit"
                  underline="hover"
                  sx={{ 
                    '&:hover': { 
                      color: '#ffd54f'
                    }
                  }}
                >
                  {link.title}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              {t.links.support}
            </Typography>
            <Stack spacing={1}>
              {footerLinks.support.map((link, index) => (
                <MuiLink
                  key={index}
                  component={Link}
                  to={link.path}
                  color="inherit"
                  underline="hover"
                  sx={{ 
                    '&:hover': { 
                      color: '#ffd54f'
                    }
                  }}
                >
                  {link.title}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              {t.contact.heading}
            </Typography>
            <Stack spacing={2}>
              {contactInfo.map((info, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {info.icon}
                  <Typography variant="body2">
                    {info.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Copyright */}
        <Typography variant="body2" align="center" sx={{ pt: 2 }}>
          {t.copyright(new Date().getFullYear())}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
