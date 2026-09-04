import React from 'react';
import { ComingSoon } from '../../components/shared/ComingSoon';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';

export default function TrainingArchiveScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Archivio allenamenti" title="Schemi salvati" />
      <ComingSoon milestone="M5 (archivio schemi)" />
    </ScreenContainer>
  );
}
