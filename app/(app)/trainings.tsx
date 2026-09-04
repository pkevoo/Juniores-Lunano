import React from 'react';
import { ComingSoon } from '../../components/shared/ComingSoon';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';

export default function TrainingsScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Allenamenti" title="Programma settimanale" />
      <ComingSoon milestone="M2 (gestione allenamenti completa)" />
    </ScreenContainer>
  );
}
