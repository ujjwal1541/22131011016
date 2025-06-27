import React, { useState } from 'react';
import { Box, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import logger from './logger';

function StatisticsPage() {
  const [selectedClicks, setSelectedClicks] = useState(null);
  const links = JSON.parse(localStorage.getItem('shortLinks') || '[]');

  const handleShowClicks = (clicks) => {
    setSelectedClicks(clicks);
    logger.log('Viewed click details', clicks);
  };

  const handleClose = () => setSelectedClicks(null);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Shortened URL Statistics</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Short URL</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map(link => (
              <TableRow key={link.shortcode}>
                <TableCell>
                  <a href={`/${link.shortcode}`}>{window.location.origin}/{link.shortcode}</a>
                </TableCell>
                <TableCell>{new Date(link.createdAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(link.expiresAt).toLocaleString()}</TableCell>
                <TableCell>{link.clicks.length}</TableCell>
                <TableCell>
                  <Button onClick={() => handleShowClicks(link.clicks)} disabled={link.clicks.length === 0}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!selectedClicks} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Click Details</DialogTitle>
        <DialogContent>
          {selectedClicks && selectedClicks.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Geo (Country/City)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedClicks.map((click, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{click.referrer || 'Direct'}</TableCell>
                    <TableCell>{click.geo ? `${click.geo.country || ''} ${click.geo.city || ''}` : 'Unknown'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <Typography>No click data.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StatisticsPage; 