import React from 'react';
import { ComingSoon } from '../../components/shared/ComingSoon';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';

export default function TacticalBoardScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Lavagna tattica" title="Schema" />
      <ComingSoon milestone="M5 (lavagna tattica completa)" />
    </ScreenContainer>
  );
}
