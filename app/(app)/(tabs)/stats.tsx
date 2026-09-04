import React from 'react';
import { ComingSoon } from '../../../components/shared/ComingSoon';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../../components/shared/ScreenHeader';

export default function StatsScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Statistiche" title="Numeri della squadra" showBack={false} />
      <ComingSoon milestone="M3 (presenze/statistiche live)" />
    </ScreenContainer>
  );
}
