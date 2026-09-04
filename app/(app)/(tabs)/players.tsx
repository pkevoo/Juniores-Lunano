import React from 'react';
import { ComingSoon } from '../../../components/shared/ComingSoon';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../../components/shared/ScreenHeader';

export default function PlayersScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Lista giocatori" title="Rosa Juniores" showBack={false} />
      <ComingSoon milestone="M2 (gestione rosa completa)" />
    </ScreenContainer>
  );
}
