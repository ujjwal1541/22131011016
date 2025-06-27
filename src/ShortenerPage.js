import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, Alert, Stack } from '@mui/material';
import logger from './logger';

const SHORTCODE_REGEX = /^[a-zA-Z0-9]{4,12}$/;
const URL_REGEX = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
const MAX_URLS = 5;
const DEFAULT_VALIDITY = 30; // minutes

function generateShortcode(existing) {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 8);
  } while (existing.has(code));
  return code;
}

function getNow() {
  return new Date().toISOString();
}

function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + minutes * 60000).toISOString();
}

function ShortenerPage() {
  const [inputs, setInputs] = useState([
    { url: '', validity: '', shortcode: '' },
  ]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // Load existing short links from localStorage
  const getLinks = () => JSON.parse(localStorage.getItem('shortLinks') || '[]');
  const saveLinks = (links) => localStorage.setItem('shortLinks', JSON.stringify(links));

  const handleInputChange = (idx, field, value) => {
    setInputs(inputs => {
      const newInputs = [...inputs];
      newInputs[idx][field] = value;
      return newInputs;
    });
  };

  const addInput = () => {
    if (inputs.length < MAX_URLS) setInputs([...inputs, { url: '', validity: '', shortcode: '' }]);
  };

  const removeInput = (idx) => {
    setInputs(inputs => inputs.filter((_, i) => i !== idx));
  };

  const validateInputs = () => {
    const existing = new Set(getLinks().map(l => l.shortcode));
    for (let i = 0; i < inputs.length; i++) {
      const { url, validity, shortcode } = inputs[i];
      if (!url.match(URL_REGEX)) return `Row ${i+1}: Invalid URL format.`;
      if (validity && (!/^[0-9]+$/.test(validity) || parseInt(validity) <= 0)) return `Row ${i+1}: Validity must be a positive integer.`;
      if (shortcode) {
        if (!SHORTCODE_REGEX.test(shortcode)) return `Row ${i+1}: Shortcode must be 4-12 alphanumeric characters.`;
        if (existing.has(shortcode)) return `Row ${i+1}: Shortcode '${shortcode}' already exists.`;
        existing.add(shortcode);
      }
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const err = validateInputs();
    if (err) {
      setError(err);
      logger.log('Validation error', err);
      return;
    }
    const now = getNow();
    const existingLinks = getLinks();
    const existingShortcodes = new Set(existingLinks.map(l => l.shortcode));
    const newLinks = inputs.map(({ url, validity, shortcode }) => {
      let code = shortcode;
      if (!code) code = generateShortcode(existingShortcodes);
      existingShortcodes.add(code);
      const createdAt = now;
      const expiresAt = addMinutes(now, validity ? parseInt(validity) : DEFAULT_VALIDITY);
      return {
        shortcode: code,
        url,
        createdAt,
        expiresAt,
        clicks: [],
      };
    });
    const allLinks = [...existingLinks, ...newLinks];
    saveLinks(allLinks);
    setResults(newLinks);
    logger.log('Shortened URLs created', newLinks);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Shorten URLs</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {inputs.map((input, idx) => (
            <Paper key={idx} sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField label="Long URL" fullWidth required value={input.url} onChange={e => handleInputChange(idx, 'url', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField label="Validity (min)" type="number" fullWidth value={input.validity} onChange={e => handleInputChange(idx, 'validity', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Custom Shortcode" fullWidth value={input.shortcode} onChange={e => handleInputChange(idx, 'shortcode', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={2}>
                  {inputs.length > 1 && <Button color="error" onClick={() => removeInput(idx)}>Remove</Button>}
                </Grid>
              </Grid>
            </Paper>
          ))}
          {inputs.length < MAX_URLS && <Button onClick={addInput}>Add another URL</Button>}
          <Button type="submit" variant="contained">Shorten</Button>
        </Stack>
      </form>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Shortened URLs</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {results.map(link => (
              <Paper key={link.shortcode} sx={{ p: 2 }}>
                <Typography>Short URL: <a href={`/${link.shortcode}`}>{window.location.origin}/{link.shortcode}</a></Typography>
                <Typography>Expires at: {new Date(link.expiresAt).toLocaleString()}</Typography>
                <Typography>Original: {link.url}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default ShortenerPage; 