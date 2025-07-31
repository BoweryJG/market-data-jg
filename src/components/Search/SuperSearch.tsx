import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import braveSearchService from '../../services/braveSearchService';
import { logger } from '../../services/logging/logger';


interface SuperSearchProps {
  open: boolean;
  onClose: () => void;
}

const SuperSearch: React.FC<SuperSearchProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await braveSearchService.search(query);
      setResults(data || []);
    } catch (err) {
      logger.error('Brave search failed', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Super Search
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end" disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ mt: 2 }}>
          <List>
            {results.map((item, idx) => (
              <ListItem key={idx} component="a" href={item.url} target="_blank" divider button>
                <ListItemText primary={item.title} secondary={item.description} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

SuperSearch.displayName = 'SuperSearch';

export default SuperSearch;
