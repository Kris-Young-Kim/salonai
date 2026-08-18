export type FacingMode = 'user' | 'environment';

export type TimerMode = 0 | 3 | 5;

export type GuideMode = 'standard' | 'minimal' | 'grid' | 'off';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface CapturedImage {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  mirrored: boolean;
  capturedAt: Date;
}

export interface CustomerQuickMeta {
  name: string;
  gender: 'female' | 'male' | 'unisex';
  hairLength?: 'short' | 'medium' | 'long';
}

export interface CameraState {
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
  facingMode: FacingMode;
  availableDevices: CameraDevice[];
  currentDeviceId: string | null;
  isMirrored: boolean;
}
