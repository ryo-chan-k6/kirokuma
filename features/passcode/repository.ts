export type PasscodeSettings = {
  enabled: boolean;
  passcode?: string;
};

export type PasscodeRepository = {
  load(): Promise<PasscodeSettings>;
  save(settings: PasscodeSettings): Promise<void>;
  clear(): Promise<void>;
};
