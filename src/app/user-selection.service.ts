import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserSelectionService {

  private selections = {
    step: '',
    fileName: '',
    confounders: [] as string[],
    predictorX: '',
    mediatorY: '',
    targetVariable: '',
    selectMediatorModel: '',
    selectedTargetVariable: ''
  };

  setSelection(key: keyof typeof this.selections, value: any) {
    this.selections[key] = value;
  }

  getSelection(key: keyof typeof this.selections): any {
    return this.selections[key];
  }

  getAllSelections() {
    return this.selections;
  }
}
