'use client'

import Image from "next/image";
import getStripe from './utils/get-stripe';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Container, AppBar, Toolbar, Typography, Button, Box, Grid } from '@mui/material';
import {useRouter} from 'next/navigation';
import Head from 'next/head';

export default function Home() {

  const router = useRouter()

  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    })
    const checkoutSessionJson = await checkoutSession.json()
  
    const stripe = await getStripe()
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })
  
    if (error) {
      console.warn(error.message)
    }
  }

  const handleGetStarted = () => {
     router.push('/generate')
  }

  return (
    <Container maxWidth="100vw">
      <Head>
        <title>FlashCards AI</title>
        <meta name="description" content="Create flashcards from your text" />
      </Head>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>FlashCards AI</Typography>

          <SignedOut>
            <Button color="inherit" href='/sign-up'>Sign Up</Button>
            <Button color="inherit" href='/sign-in'>Login</Button>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2" gutterBottom>Welcome to FlashCards AI</Typography>
        <Typography variant="h5" gutterBottom>
          {' '}
          The easiest way to generate flashcards with just a text prompt
        </Typography>
        <Button variant='contained' color="primary" sx={{ mt: 2 }} onClick={handleGetStarted}>
          Get Started
        </Button>
      </Box>

      <Box sx={{ my: 6 }}>
        <Typography variant='h4' gutterBottom>Features</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom>Easy Text Input</Typography>
            <Typography>
              Simply input the text and let FlashCards appear with the Flash.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom>Smart FlashCards</Typography>
            <Typography>
              Watch AI cracking text into FlashCards.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom>Accessible Anywhere</Typography>
            <Typography>
              Access FlashCards from any device.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{my:6, textAlign:'center'}}>
      <Typography variant='h4' gutterBottom>Pricing</Typography>
      <Grid container spacing={4}>
          <Grid item xs={4} md={6}>
            <Box sx={{
              p:3,
              border:'1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
            }}>
            <Typography variant='h5' gutterBottom>Basic</Typography>
            <Typography variant='h6' gutterBottom>$5 / month</Typography>
            <Typography>
              {' '}
              Access to basic flashcard features and limited storage.
            </Typography>
            <Button variant='contained' color='primary' sx={{mt:2}}>
              Choose Basic
            </Button>
            </Box>
          </Grid>
          <Grid item xs={4} md={6}>
          <Box sx={{
              p:3,
              border:'1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
            }}>
            <Typography variant='h5' gutterBottom>Pro</Typography>
            <Typography variant='h6' gutterBottom>$10 / month</Typography>
            <Typography>
              {' '}
              Unlimited access to Flashcards and storage with priority support.
            </Typography>
            <Button variant='contained' color='primary' sx={{mt:2}} onClick={handleSubmit}
            >
              Choose Pro
            </Button>
            </Box>
            </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
