import React from 'react';
import { ComingSoon } from '../../../components/shared/ComingSoon';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../../components/shared/ScreenHeader';

export default function CalendarScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Calendario partite" title="Partite" showBack={false} />
      <ComingSoon milestone="M2 (calendario partite completo)" />
    </ScreenContainer>
  );
}
