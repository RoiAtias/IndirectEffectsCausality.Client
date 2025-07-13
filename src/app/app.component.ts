import { Component, OnInit } from '@angular/core';
import { UserSelectionService } from './user-selection.service'; // ייבוא השירות

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  steps = [
    { message: 'Dataset' },
    { message: 'Confounders' },
    { message: 'Treatment' },
    { message: 'Mediator' },
    { message: 'Outcome' },
    { message: 'Results' }
  ];
  
  stepIndex = 0;
  isHealth = false;


  selections = {
    step: '',
    fileName: '',
    confounders:  [] as string[],
    predictorX: '',
    mediatorY: '',
    selectMediatorModel: '',
    targetVariable: '',
    selectedTargetVariable: ''
  };

  constructor(private userSelectionService: UserSelectionService) {}

  ngOnInit(): void {
    this.selections = this.userSelectionService.getAllSelections();
  }

  getStepChoice(stepMessage: string): string | null {
    const selections = this.selections; 
    switch (stepMessage) {
      case 'Step':
        return selections.step ? `${selections.step}` : null;
      case 'Dataset':
        return selections.fileName ? `${selections.fileName}` : null;
      case 'Confounders':
        return selections.confounders.length ? `${selections.confounders.join(', ')}` : null;
      case 'Treatment':
        return selections.predictorX ? `${selections.predictorX}` : null;
      case 'Mediator':
        return selections.mediatorY ? `${selections.mediatorY}, Model: ${selections.selectMediatorModel}` : null;
      case 'Outcome':
        return selections.targetVariable ? `${selections.targetVariable}, Model: ${selections.selectedTargetVariable}` : null;
      default:
        return null;
    }
  }

  onChangeHealth(loading: boolean) {
    if (!loading) {
      this.isHealth = true;
    }
  }
}
