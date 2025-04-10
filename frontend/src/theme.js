import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2'
    },
    background: {
      default: '#121212',
      paper: '#1e1e2f'
    },
    text: {
      primary: '#ffffff'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    button: {
      textTransform: 'none'
    }
  }
});

export default theme;