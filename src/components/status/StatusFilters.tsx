'use client';

import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  categories: string[];
  onCategoryChange: (value: string) => void;
}

export default function StatusFilters({
  query,
  onQueryChange,
  category,
  categories,
  onCategoryChange,
}: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      <TextField
        size="small"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search services"
        aria-label="Search services"
        sx={{ flex: '1 1 240px' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        size="small"
        select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
        sx={{ flex: '0 1 220px', minWidth: 160 }}
      >
        <MenuItem value="all">All categories</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
