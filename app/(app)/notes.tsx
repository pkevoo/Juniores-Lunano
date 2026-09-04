import React from 'react';
import { ComingSoon } from '../../components/shared/ComingSoon';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';

export default function NotesScreen() {
  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Note" title="Appunti" />
      <ComingSoon milestone="M2 (note complete)" />
    </ScreenContainer>
  );
}
