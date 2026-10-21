import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  Tooltip,
  Fab,
  Collapse,
  Stack
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  MusicNote,
  Close,
  SkipNext,
  SkipPrevious
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 100,
  right: 20,
  zIndex: 1000,
  padding: theme.spacing(2),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(94, 53, 177, 0.15)',
  backdropFilter: 'blur(10px)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(94, 53, 177, 0.1)',
  minWidth: 300,
  maxWidth: 350,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(94, 53, 177, 0.2)',
    border: '1px solid rgba(94, 53, 177, 0.2)',
  }
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 100,
  right: 40,
  zIndex: 100,
  background: 'linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)',
  color: 'white',
  boxShadow: '0 4px 20px rgba(94, 53, 177, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #4527a0 0%, #311b92 100%)',
    transform: 'scale(1.05)',
    boxShadow: '0 6px 25px rgba(94, 53, 177, 0.4)',
  },
  transition: 'all 0.3s ease',
}));

const MusicPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlayBlocked, setIsAutoPlayBlocked] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef(null);

  // Song list from radio directory
  const songs = [
    {
      title: 'Mon Majhi Khobordar',
      artist: 'Bangla Folk Song',
      src: '/radio/mon_majhi_khobordar.mp3'
    },
    {
      title: 'Mon Amar Dehokhori',
      artist: 'Bangla Folk Song',
      src: '/radio/mon_amar_dehokhori.mp3'
    }
  ];

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Ensure proper volume and unmute before playing
        audioRef.current.volume = volume / 100;
        audioRef.current.muted = false;
        setIsMuted(false);
        
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Play failed:', error);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (newValue === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      // Try to auto-play when metadata is loaded with multiple strategies
      if (!isPlaying && !isAutoPlayBlocked) {
        // Strategy 1: Try with muted first
        audioRef.current.muted = true;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsAutoPlayBlocked(false);
          // Unmute after successful play
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.muted = false;
              setIsMuted(false);
            }
          }, 100);
        }).catch((error) => {
          console.log('Auto-play prevented on metadata load:', error);
          // Strategy 2: Try without muting
          audioRef.current.muted = false;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            setIsAutoPlayBlocked(false);
          }).catch((fallbackError) => {
            console.log('Fallback auto-play also prevented on metadata load:', fallbackError);
            setIsAutoPlayBlocked(true);
          });
        });
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Auto-play next song if available
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 1000);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleNext = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // Auto-play on component mount with multiple attempts
  useEffect(() => {
    // Check if browser supports autoplay
    const checkAutoplaySupport = async () => {
      try {
        const audio = new Audio();
        audio.muted = true;
        await audio.play();
        audio.pause();
        return true;
      } catch (error) {
        console.log('Browser does not support autoplay:', error);
        return false;
      }
    };

    const initializeAutoplay = async () => {
      const supportsAutoplay = await checkAutoplaySupport();
      if (!supportsAutoplay) {
        setIsAutoPlayBlocked(true);
      }
    };

    initializeAutoplay();
         const attemptAutoPlay = () => {
       if (audioRef.current) {
         // Strategy 1: Try with muted audio first (most likely to succeed)
         audioRef.current.muted = true;
         audioRef.current.play().then(() => {
           setIsPlaying(true);
           setIsAutoPlayBlocked(false);
           // Unmute and restore volume after successful play
           setTimeout(() => {
             if (audioRef.current) {
               audioRef.current.muted = false;
               audioRef.current.volume = volume / 100;
               setIsMuted(false);
             }
           }, 100);
         }).catch((error) => {
           console.log('Muted auto-play prevented:', error);
           // Strategy 2: Try without muting but with proper volume
           audioRef.current.muted = false;
           audioRef.current.volume = volume / 100;
           audioRef.current.play().then(() => {
             setIsPlaying(true);
             setIsAutoPlayBlocked(false);
           }).catch((fallbackError) => {
             console.log('Unmuted auto-play also prevented:', fallbackError);
             // Strategy 3: Try with very low volume
             audioRef.current.volume = 0.01;
             audioRef.current.play().then(() => {
               setIsPlaying(true);
               setIsAutoPlayBlocked(false);
               // Restore volume immediately
               setTimeout(() => {
                 if (audioRef.current) {
                   audioRef.current.volume = volume / 100;
                 }
               }, 50);
             }).catch((volumeError) => {
               console.log('Low volume auto-play also prevented:', volumeError);
               // Restore volume even if auto-play fails
               if (audioRef.current) {
                 audioRef.current.volume = volume / 100;
               }
               setIsAutoPlayBlocked(true);
             });
           });
         });
       }
     };

    // Multiple auto-play attempts with different strategies and timing
    const attempts = [
      () => attemptAutoPlay(), // Immediate attempt
      () => setTimeout(attemptAutoPlay, 100), // After 100ms
      () => setTimeout(attemptAutoPlay, 500), // After 500ms
      () => setTimeout(attemptAutoPlay, 1000), // After 1 second
      () => setTimeout(attemptAutoPlay, 2000), // After 2 seconds
      () => setTimeout(attemptAutoPlay, 3000), // After 3 seconds
      () => setTimeout(attemptAutoPlay, 5000), // After 5 seconds
    ];

    // Execute all attempts
    attempts.forEach(attempt => attempt());

         // Add user interaction listener as fallback
     const enableAudioOnInteraction = () => {
       if (audioRef.current && !isPlaying) {
         setHasUserInteracted(true);
         // Ensure proper volume and unmute before trying to play
         audioRef.current.volume = volume / 100;
         audioRef.current.muted = false;
         setIsMuted(false);
         
         // Try multiple strategies on user interaction
         const tryPlay = () => {
           audioRef.current.play().then(() => {
             setIsPlaying(true);
             setIsAutoPlayBlocked(false);
           }).catch((error) => {
             console.log('User interaction play failed:', error);
             // Try with muted
             audioRef.current.muted = true;
             audioRef.current.play().then(() => {
               setIsPlaying(true);
               setIsAutoPlayBlocked(false);
               setTimeout(() => {
                 if (audioRef.current) {
                   audioRef.current.muted = false;
                   audioRef.current.volume = volume / 100;
                   setIsMuted(false);
                 }
               }, 100);
             }).catch((mutedError) => {
               console.log('Muted user interaction also failed:', mutedError);
               // Restore volume even if play fails
               if (audioRef.current) {
                 audioRef.current.volume = volume / 100;
               }
             });
           });
         };
         tryPlay();
       }
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
      document.removeEventListener('scroll', enableAudioOnInteraction);
      document.removeEventListener('mousemove', enableAudioOnInteraction);
    };

    // Add multiple event listeners for user interaction
    document.addEventListener('click', enableAudioOnInteraction);
    document.addEventListener('touchstart', enableAudioOnInteraction);
    document.addEventListener('keydown', enableAudioOnInteraction);
    document.addEventListener('scroll', enableAudioOnInteraction);
    document.addEventListener('mousemove', enableAudioOnInteraction);

    // Add window focus and visibility change listeners
    const handleWindowFocus = () => {
      if (audioRef.current && !isPlaying && !isAutoPlayBlocked) {
        attemptAutoPlay();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && audioRef.current && !isPlaying && !isAutoPlayBlocked) {
        attemptAutoPlay();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
      document.removeEventListener('scroll', enableAudioOnInteraction);
      document.removeEventListener('mousemove', enableAudioOnInteraction);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Remove isPlaying dependency to prevent re-running

  // Handle song change
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.load();
      // Only auto-play if it was already playing before
      if (wasPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Auto-play prevented on song change:', error);
          setIsAutoPlayBlocked(true);
        });
      }
    }
  }, [currentSongIndex]); // Remove isPlaying dependency to prevent reloading on pause

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentSong.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
        autoPlay
        muted
        playsInline
      />

             {/* Collapsed state - just the FAB */}
       {!isExpanded && (
         <Tooltip title={isAutoPlayBlocked ? "Click to enable music" : "Grameen Radio"} placement="left">
           <StyledFab
             size="medium"
             onClick={() => setIsExpanded(true)}
             color="primary"
             sx={{
               ...(isAutoPlayBlocked && {
                 animation: 'pulse 2s infinite',
                 '@keyframes pulse': {
                   '0%': {
                     boxShadow: '0 4px 20px rgba(94, 53, 177, 0.3)',
                   },
                   '50%': {
                     boxShadow: '0 4px 25px rgba(94, 53, 177, 0.5)',
                   },
                   '100%': {
                     boxShadow: '0 4px 20px rgba(94, 53, 177, 0.3)',
                   },
                 }
               })
             }}
           >
             <MusicNote />
             {isAutoPlayBlocked && (
               <Box
                 sx={{
                   position: 'absolute',
                   top: -2,
                   right: -2,
                   width: 12,
                   height: 12,
                   backgroundColor: '#ff6b6b',
                   borderRadius: '50%',
                   border: '2px solid white',
                   animation: 'blink 1.5s infinite',
                   '@keyframes blink': {
                     '0%, 50%': { opacity: 1 },
                     '51%, 100%': { opacity: 0.3 },
                   }
                 }}
               />
             )}
           </StyledFab>
         </Tooltip>
       )}

      {/* Expanded state - full player */}
      <Collapse in={isExpanded} timeout={300}>
        <StyledPaper elevation={8}>
                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
             <Typography variant="h6" sx={{ fontWeight: 600, color: '#5e35b1' }}>
               🎵 Grameen Radio
             </Typography>
             <IconButton
               size="small"
               onClick={() => setIsExpanded(false)}
               sx={{ 
                 color: '#5e35b1',
                 '&:hover': {
                   backgroundColor: 'rgba(94, 53, 177, 0.1)'
                 }
               }}
             >
               <Close />
             </IconButton>
                      </Box>

           {/* Auto-play blocked notification */}
           {isAutoPlayBlocked && (
             <Box sx={{ 
               mb: 2, 
               p: 1.5, 
               backgroundColor: 'rgba(255, 107, 107, 0.1)', 
               border: '1px solid rgba(255, 107, 107, 0.3)',
               borderRadius: 1,
               textAlign: 'center'
             }}>
               <Typography variant="caption" sx={{ color: '#ff6b6b', fontWeight: 500 }}>
                 🔇 Click anywhere on the page to enable music
               </Typography>
             </Box>
           )}

           {/* Song Info */}
           <Box sx={{ mb: 2 }}>
             <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#5e35b1', mb: 0.5 }}>
               {currentSong.title}
             </Typography>
             <Typography variant="body2" sx={{ color: '#666666' }}>
               {currentSong.artist}
             </Typography>
           </Box>

                     {/* Progress Bar */}
           <Box sx={{ mb: 2 }}>
             <Slider
               value={currentTime}
               max={duration}
               onChange={handleSeek}
               sx={{
                 '& .MuiSlider-thumb': {
                   width: 14,
                   height: 14,
                   backgroundColor: '#5e35b1',
                   border: '2px solid #ffffff',
                   boxShadow: '0 2px 8px rgba(94, 53, 177, 0.3)',
                 },
                 '& .MuiSlider-track': {
                   height: 4,
                   backgroundColor: '#5e35b1',
                 },
                 '& .MuiSlider-rail': {
                   height: 4,
                   backgroundColor: '#e0e0e0',
                 },
                 '& .MuiSlider-thumb:hover': {
                   boxShadow: '0 4px 12px rgba(94, 53, 177, 0.4)',
                 }
               }}
             />
             <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
               <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                 {formatTime(currentTime)}
               </Typography>
               <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                 {formatTime(duration)}
               </Typography>
             </Box>
           </Box>

                     {/* Controls */}
           <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
             <IconButton
               onClick={handlePrevious}
               disabled={currentSongIndex === 0}
               sx={{ 
                 color: currentSongIndex === 0 ? '#cccccc' : '#5e35b1',
                 '&:hover': {
                   backgroundColor: currentSongIndex === 0 ? 'transparent' : 'rgba(94, 53, 177, 0.1)'
                 }
               }}
             >
               <SkipPrevious />
             </IconButton>

             <IconButton
               onClick={handlePlayPause}
               sx={{
                 background: 'linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)',
                 color: 'white',
                 boxShadow: '0 4px 15px rgba(94, 53, 177, 0.3)',
                 '&:hover': {
                   background: 'linear-gradient(135deg, #4527a0 0%, #311b92 100%)',
                   boxShadow: '0 6px 20px rgba(94, 53, 177, 0.4)',
                 },
                 width: 48,
                 height: 48,
               }}
             >
               {isPlaying ? <Pause /> : <PlayArrow />}
             </IconButton>

             <IconButton
               onClick={handleNext}
               disabled={currentSongIndex === songs.length - 1}
               sx={{ 
                 color: currentSongIndex === songs.length - 1 ? '#cccccc' : '#5e35b1',
                 '&:hover': {
                   backgroundColor: currentSongIndex === songs.length - 1 ? 'transparent' : 'rgba(94, 53, 177, 0.1)'
                 }
               }}
             >
               <SkipNext />
             </IconButton>

             <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
               <IconButton
                 size="small"
                 onClick={handleMuteToggle}
                 sx={{ 
                   color: isMuted ? '#ff6b6b' : '#5e35b1',
                   '&:hover': {
                     backgroundColor: 'rgba(94, 53, 177, 0.1)'
                   }
                 }}
               >
                 {isMuted ? <VolumeOff /> : <VolumeUp />}
               </IconButton>
               <Slider
                 value={isMuted ? 0 : volume}
                 onChange={handleVolumeChange}
                 sx={{
                   '& .MuiSlider-thumb': {
                     width: 10,
                     height: 10,
                     backgroundColor: '#5e35b1',
                     border: '2px solid #ffffff',
                     boxShadow: '0 2px 6px rgba(94, 53, 177, 0.3)',
                   },
                   '& .MuiSlider-track': {
                     height: 3,
                     backgroundColor: '#5e35b1',
                   },
                   '& .MuiSlider-rail': {
                     height: 3,
                     backgroundColor: '#e0e0e0',
                   },
                   '& .MuiSlider-thumb:hover': {
                     boxShadow: '0 3px 10px rgba(94, 53, 177, 0.4)',
                   }
                 }}
               />
             </Box>
           </Stack>

                     {/* Song Counter */}
           <Typography variant="caption" sx={{ 
             color: '#5e35b1', 
             textAlign: 'center', 
             display: 'block',
             fontWeight: 600,
             backgroundColor: 'rgba(94, 53, 177, 0.1)',
             padding: '4px 8px',
             borderRadius: '12px',
             fontSize: '0.75rem'
           }}>
             {currentSongIndex + 1} of {songs.length}
           </Typography>
        </StyledPaper>
      </Collapse>
    </>
  );
};

export default MusicPlayer;
