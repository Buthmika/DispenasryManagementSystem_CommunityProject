import { Component, inject } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.html',
  styleUrl: './dialog.css'
})
export class DialogComponent {
  readonly dialogService = inject(DialogService);

  close(result: boolean): void {
    this.dialogService.close(result);
  }
}
