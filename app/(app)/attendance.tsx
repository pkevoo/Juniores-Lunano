import React from 'react';
import { ComingSoon } from '../../components/shared/ComingSoon';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';

export default function AttendanceScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Presenze & assenze" title="Calendario" />
      <ComingSoon milestone="M3 (registro presenze reale)" />
    </ScreenContainer>
  );
}
