import { Injectable, signal } from '@angular/core';

export type DialogType = 'success' | 'error' | 'warning' | 'info';

export interface DialogState {
  title: string;
  message: string;
  type: DialogType;
  confirm: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly dialog = signal<DialogState | null>(null);
  private pendingConfirmation: ((result: boolean) => void) | null = null;

  show(message: string, type: DialogType = 'info', title?: string): void {
    this.resolvePending(false);
    this.dialog.set({
      title: title || this.getTitle(type),
      message: this.cleanMessage(message),
      type,
      confirm: false
    });
  }

  confirmAction(message: string, title = 'Please confirm'): Promise<boolean> {
    this.resolvePending(false);
    return new Promise<boolean>((resolve) => {
      this.pendingConfirmation = resolve;
      this.dialog.set({
        title,
        message: this.cleanMessage(message),
        type: 'warning',
        confirm: true
      });
    });
  }

  close(result: boolean): void {
    this.resolvePending(result);
    this.dialog.set(null);
  }

  private resolvePending(result: boolean): void {
    this.pendingConfirmation?.(result);
    this.pendingConfirmation = null;
  }

  private cleanMessage(message: string): string {
    return message.replace(/^[^\w]*(Error|Success|Unexpected Error|Failed|✅|❌)[:\s]*/i, '').trim();
  }

  private getTitle(type: DialogType): string {
    return type === 'success' ? 'Success' : type === 'error' ? 'Something went wrong' : type === 'warning' ? 'Heads up' : 'Notice';
  }
}
