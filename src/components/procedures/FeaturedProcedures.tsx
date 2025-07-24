import React from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Procedure } from '../../types';
import ProcedureCard from './ProcedureCard';

interface FeaturedProceduresProps {
  procedures: Procedure[];
}

export const FeaturedProcedures: React.FC<FeaturedProceduresProps> = ({ procedures }) => {
  const navigate = useNavigate();

  const handleProcedureClick = (procedureId: string) => {
    navigate(`/procedure/${procedureId}`);
  };

  return (
    <Grid container spacing={3}>
      {procedures.map((procedure) => (
        <Grid item xs={12} sm={6} md={3} key={procedure.id}>
          <ProcedureCard procedure={procedure} onClick={handleProcedureClick} />
        </Grid>
      ))}
    </Grid>
  );
};

FeaturedProcedures.displayName = 'FeaturedProcedures';
