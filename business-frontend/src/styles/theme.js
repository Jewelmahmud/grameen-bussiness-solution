import { createTheme } from '@mui/material/styles';

// Create theme with SolaimanLipi font support
export const theme = createTheme({
  typography: {
    fontFamily: [
      'SolaimanLipi',
      'Fira Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 500,
    },
    caption: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    overline: {
      fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Fira Sans, SolaimanLipi, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      },
    },
  },
});

export default theme; 