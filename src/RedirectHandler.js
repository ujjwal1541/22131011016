import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import logger from './logger';

function RedirectHandler() {
  const { shortcode } = useParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const links = JSON.parse(localStorage.getItem('shortLinks') || '[]');
    const link = links.find(l => l.shortcode === shortcode);
    if (!link) {
      setStatus('error');
      setError('Short URL not found.');
      logger.log('Shortcode not found', shortcode);
      return;
    }
    if (new Date(link.expiresAt) < new Date()) {
      setStatus('error');
      setError('Short URL has expired.');
      logger.log('Shortcode expired', shortcode);
      return;
    }
    // Get geo info
    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(geo => {
        const click = {
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          geo: { country: geo.country_name, city: geo.city },
        };
        link.clicks.push(click);
        localStorage.setItem('shortLinks', JSON.stringify(links));
        logger.log('Short URL clicked', { shortcode, click });
        window.location.href = link.url;
      })
      .catch(() => {
        // If geo fails, still log click
        const click = {
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          geo: null,
        };
        link.clicks.push(click);
        localStorage.setItem('shortLinks', JSON.stringify(links));
        logger.log('Short URL clicked (no geo)', { shortcode, click });
        window.location.href = link.url;
      });
  }, [shortcode]);

  if (status === 'loading') {
    return <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /><Typography>Redirecting...</Typography></Box>;
  }
  return <Box sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Box>;
}

export default RedirectHandler; 