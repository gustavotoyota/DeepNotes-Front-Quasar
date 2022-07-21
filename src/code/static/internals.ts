export interface DeepNotesInternals {
  showRecoveryCodeDialog: (recoveryCode: string) => void;
  showUserSettingsDialog: () => any;
}

export const internals: DeepNotesInternals = {} as any;
