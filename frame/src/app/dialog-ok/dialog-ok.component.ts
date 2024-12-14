import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-dialog-ok',
  standalone: false,
  
  templateUrl: './dialog-ok.component.html',
  styleUrl: './dialog-ok.component.css'
})
export class DialogOkComponent {
  constructor(public dialogRef: MatDialogRef<DialogOkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
