import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { Procedure } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProcedureCardProps {
  procedure: Procedure;
  onClick?: (id: string) => void;
}

export const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure, onClick }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      },
    }}
    onClick={() => onClick && onClick(procedure.id)}
  >
    <CardMedia
      component="img"
      height="150"
      image={procedure.imageUrl || 'https://via.placeholder.com/300x150?text=Procedure'}
      alt={procedure.name}
      sx={{ objectFit: 'cover' }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '40%',
        background:
          'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
      }}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography gutterBottom variant="h6" component="div">
        {procedure.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {procedure.description.length > 80
          ? `${procedure.description.substring(0, 80)}...`
          : procedure.description}
      </Typography>
      <Box mt="auto" display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          {formatCurrency(procedure.averageCost)}
        </Typography>
        <Chip
          label={`${procedure.growthRate > 0 ? '+' : ''}${procedure.growthRate}%`}
          color={procedure.growthRate > 0 ? 'success' : 'error'}
          size="small"
        />
      </Box>
    </CardContent>
  </Card>
);

ProcedureCard.displayName = 'ProcedureCard';

export default ProcedureCard;
