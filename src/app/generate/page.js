'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, collection, getDoc, writeBatch } from 'firebase/firestore';
import {
    Container,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Helper function to compute font size
const computeFontSize = (text, maxWidth, minFontSize = 14, maxFontSize = 16) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.whiteSpace = 'nowrap';
    container.style.fontSize = `${maxFontSize}px`;
    container.textContent = text;
    document.body.appendChild(container);
    let fontSize = maxFontSize;
    
    while (container.scrollWidth > maxWidth && fontSize > minFontSize) {
        fontSize -= 1;
        container.style.fontSize = `${fontSize}px`;
    }
    
    document.body.removeChild(container);
    return fontSize;
};

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flipped, setFlipped] = useState({});
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const [flashcards, setFlashcards] = useState([]);

    const handleSubmit = async () => {
        fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text }),
        })
        .then((res) => res.json())
        .then((data) => {
            const flashcards = data.flashcards;
            if (Array.isArray(flashcards)) {
                setFlashcards(flashcards);
            } else if (flashcards) {
                setFlashcards([flashcards]);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name');
            return;
        }

        const batch = writeBatch(db);
        const userDocRef = doc(collection(db, 'users'), user.id);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || [];
            if (collections.find((f) => f.name === name)) {
                alert('Flashcard collection with the same name already exists.');
                return;
            } else {
                collections.push({ name });
                batch.set(userDocRef, { flashcards: collections }, { merge: true });
            }
        } else {
            batch.set(userDocRef, { flashcards: [{ name }] });
        }

        const colRef = collection(userDocRef, name);
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef);
            batch.set(cardDocRef, flashcard);
        });

        await batch.commit();
        handleClose();
        router.push('/flashcards');
    };

    return (
        <Container maxWidth='md'>
            <Box 
                sx={{
                    mt: 4, mb: 6, display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography variant='h4'>Generate FlashCards</Typography>
                <Paper sx={{ p: 4, width: '100%' }}>
                    <TextField 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        label="Enter Text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSubmit}
                        fullWidth
                    >
                        Submit
                    </Button>
                </Paper>     
            </Box>

            {flashcards.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant='h5'>
                        FlashcardsAI Preview
                    </Typography>
                    <Grid container spacing={3}>
                        {flashcards.map((flashcard, index) => {
                            const maxWidth = 300; // Set your box width here
                            const frontFontSize = computeFontSize(flashcard.front, maxWidth);
                            const backFontSize = computeFontSize(flashcard.back, maxWidth);

                            return (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea onClick={() => handleCardClick(index)}>
                                            <CardContent>
                                                <Box
                                                    sx={{
                                                        perspective: '1000px',
                                                        '& > div': {
                                                            transition: 'transform 0.6s',
                                                            transformStyle: 'preserve-3d',
                                                            position: 'relative',
                                                            width: '100%',
                                                            height: '200px',
                                                            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                            transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                        },
                                                        '& > div > div': {
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            backfaceVisibility: 'hidden',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            //overflow: 'hidden', // Prevent overflow
                                                            padding: 2,
                                                            boxSizing: 'border-box',
                                                        },
                                                        '& > div > div:nth-of-type(2)': {
                                                            transform: 'rotateY(180deg)',
                                                        }
                                                    }}
                                                >
                                                    <div>
                                                        <div>
                                                            <Typography
                                                                variant='h5'
                                                                component='div'
                                                                sx={{ fontSize: frontFontSize }}
                                                            >
                                                                {flashcard.front}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography
                                                                variant='h5'
                                                                component='div'
                                                                sx={{ fontSize: backFontSize }}
                                                            >
                                                                {flashcard.back}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button variant='contained' color='secondary' onClick={handleOpen}>
                            Save
                        </Button>
                    </Box>
                </Box>
            )}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a name for your flashcards collection
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin='dense'
                        label="Collection Name"
                        type="text"
                        fullWidth value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant='outlined'
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={saveFlashcards}>Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
