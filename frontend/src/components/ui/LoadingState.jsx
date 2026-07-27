import { Box, CircularProgress, Typography, Card, CardContent } from '@mui/material'

const LoadingState = ({ message = 'Memuat data...', fullScreen = false }) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
        minHeight: fullScreen ? '100vh' : '200px'
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round'
          }
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
    </Box>
  )

  if (fullScreen) {
    return content
  }

  return (
    <Card sx={{ bgcolor: 'background.paper' }}>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default LoadingState