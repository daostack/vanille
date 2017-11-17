export interface EventConfig {
  message: string;
  action: () => void;
  actionText: string;
  style: string;
  duration: Number; // in milliseconds, default 3000, 0 for never
}
