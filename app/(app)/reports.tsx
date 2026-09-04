import React from 'react';
import { ComingSoon } from '../../components/shared/ComingSoon';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';

export default function ReportsScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Report" title="Esporta dati" />
      <ComingSoon milestone="M4 (esportazione CSV)" />
    </ScreenContainer>
  );
}
