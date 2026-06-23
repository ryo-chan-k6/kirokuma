import type { PasscodeRepository, PasscodeSettings } from './repository';

export const PASSCODE_MIN_LENGTH = 4;
export const PASSCODE_MAX_LENGTH = 8;

export function normalizePasscode(input: string): string {
  return input.trim();
}

export function validatePasscode(input: string): { success: true; passcode: string } | { success: false; message: string } {
  const passcode = normalizePasscode(input);

  if (!/^\d+$/.test(passcode)) {
    return { success: false, message: 'パスコードは数字だけで入力してください。' };
  }

  if (passcode.length < PASSCODE_MIN_LENGTH || passcode.length > PASSCODE_MAX_LENGTH) {
    return { success: false, message: 'パスコードは4〜8桁で入力してください。' };
  }

  return { success: true, passcode };
}

export function isPasscodeEnabled(settings: PasscodeSettings): boolean {
  return settings.enabled && typeof settings.passcode === 'string' && settings.passcode.length > 0;
}

export function verifyPasscode(settings: PasscodeSettings, input: string): boolean {
  return isPasscodeEnabled(settings) && normalizePasscode(input) === settings.passcode;
}

export async function setPasscode(repository: PasscodeRepository, input: string): Promise<PasscodeSettings> {
  const validation = validatePasscode(input);
  if (!validation.success) {
    throw new Error(validation.message);
  }

  const settings: PasscodeSettings = { enabled: true, passcode: validation.passcode };
  await repository.save(settings);
  return settings;
}

export async function disablePasscode(repository: PasscodeRepository): Promise<PasscodeSettings> {
  const settings: PasscodeSettings = { enabled: false };
  await repository.clear();
  return settings;
}
