import { AppBar, Toolbar, Container, Typography, Button, Link, Box } from '@mui/material';
import { SignUp } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <Container maxWidth="sm">
      <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FlashcardsAI
          </Typography>
          <Button color="inherit">
            <Link href="/sign-in" underline="none" color="inherit">
              Login
            </Link>
          </Button>
          <Button color="inherit">
            <Link href="/sign-up" underline="none" color="inherit">
              Sign Up
            </Link>
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <SignUp />
      </Box>
    </Container>
  );
}
