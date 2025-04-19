import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Chip,
  Stack,
  useTheme,
  alpha,
  createTheme,
  ThemeProvider,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchUserBarData, getRecommendations, Bottle, BarData, RecommendationWithReason } from './services';
import { allBottles } from './bottlesDataset';

// Custom theme to match BAXUS style
const theme = createTheme({
  palette: {
    primary: {
      main: '#2A4B45',
      light: '#3C665E',
      dark: '#1C332F',
    },
    secondary: {
      main: '#C17F59',
      light: '#D4997A',
      dark: '#A66B4A',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [barData, setBarData] = useState<BarData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationWithReason[]>([]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userData = await fetchUserBarData(username);
      setBarData(userData);
      const recommendedBottles = await getRecommendations(userData.bottles, allBottles);
      setRecommendations(recommendedBottles);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const BottleCard = ({ bottle, reason }: { bottle: Bottle; reason?: string }) => (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      border: '1px solid #E0E0E0',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        borderColor: theme.palette.primary.light,
      }
    }}>
      <Box sx={{ 
        position: 'relative',
        backgroundColor: '#F8F8F8',
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 280
      }}>
        <CardMedia
          component="img"
          image={bottle.image_url}
          alt={bottle.name}
          sx={{ 
            objectFit: 'contain',
            maxHeight: '100%',
            width: 'auto',
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 500,
            fontSize: '1.1rem',
            minHeight: '2.5em',
            lineHeight: 1.2
          }}
        >
          {bottle.name}
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={bottle.spirit_type} 
              size="small" 
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 500
              }}
            />
            <Chip 
              label={`${bottle.proof}°`} 
              size="small" 
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                fontWeight: 500
              }}
            />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
                mb: 1
              }}
            >
              ${bottle.avg_msrp}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Market Price: ${bottle.fair_price}
            </Typography>
          </Box>
          {reason && (
            <Box sx={{ 
              mt: 2, 
              p: 1.5, 
              backgroundColor: alpha(theme.palette.secondary.main, 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontStyle: 'italic',
                  fontSize: '0.875rem'
                }}
              >
                {reason}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            mb: 6,
            textAlign: 'left',
            maxWidth: 600
          }}>
            <Typography variant="h1" gutterBottom color="primary">
              Welcome to Bob's Bar
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4 }}>
              Get recommendations for your collection.
            </Typography>
          </Box>
          
          <Box sx={{ 
            mb: 6,
            display: 'flex',
            gap: 2,
            alignItems: 'center'
          }}>
            <TextField
              placeholder="Enter Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                maxWidth: 600,
                backgroundColor: 'background.paper',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E0E0E0',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={loading}
              size="large"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
            </Button>
          </Box>

          {barData && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
                Your Collection
              </Typography>
              <Grid container spacing={3}>
                {barData.bottles.map((bottle, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <BottleCard bottle={bottle} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {recommendations.length > 0 && (
            <Box>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
                Recommended For You
              </Typography>
              <Grid container spacing={3}>
                {recommendations.map((rec, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <BottleCard bottle={rec.bottle} reason={rec.reason} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
