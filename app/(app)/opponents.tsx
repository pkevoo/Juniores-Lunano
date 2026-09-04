import React from 'react';
import { ComingSoon } from '../../components/shared/ComingSoon';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';

export default function OpponentsScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Appunti squadre avversarie" title="Scouting avversarie" />
      <ComingSoon milestone="M2 (note avversarie complete)" />
    </ScreenContainer>
  );
}
