import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IndirectEffectsService } from '../indirect-effects.service';

@Component({
  selector: 'app-causality-parameters',
  templateUrl: './causality-parameters.component.html',
  styleUrls: ['./causality-parameters.component.css']
})
export class CausalityParametersComponent {

  stepIndex = 0;

  steps = [
    { message: 'Upload Dataset' },
    { message: 'Confounders Selection' },
    { message: 'Predictor (X)' },
    { message: 'Mediator (Y)' },
    { message: 'Target Variable' },
    { message: 'Results' }
  ];

  confounders: string[] = [];
  predictorX: string = '';
  mediatorY: string = '';
  targetVariable: string = '';
  fileName = '';
  isCsvFile: boolean = true;
  selectedFile: File | null = null; // משתנה לשמירת הקובץ
  responseData: MediationResults | undefined;  // סוג המודל
  confounderOptions = [];
  predictorOptions = [];
  mediatorOptions = [];
  targetOptions = [];
  isLoading: boolean = false; 
  selectMediatorModel: string = '';
  slectedTargetVariable: string= '';

  constructor(private indirectEffectsService: IndirectEffectsService) { }

  nextStep() {
    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex++;
    }
    if (this.stepIndex === this.steps.length - 1) {
      this.sendResultsToServer();
    }
  }

  previousStep() {
    if (this.stepIndex > 0) {
      this.stepIndex--;
    }
  }

  handleFileInputChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
      this.isCsvFile = file.name.endsWith('.csv');
      if (this.isCsvFile) {
        this.uploadFile(file);
      } else {
        alert('Only CSV files are allowed.');
      }
    }
  }

  private uploadFile(file: File) {
    this.indirectEffectsService.uploadFile(file).subscribe(
      response => {
        console.log('File uploaded successfully:', response);

        this.confounderOptions = response.data?.Confounders || [];
        this.predictorOptions = response.data?.Predictor || [];
        this.mediatorOptions = response.data?.Mediator || [];
        this.targetOptions = response.data?.Target_Variable || [];
      },
      error => {
        console.error('Error uploading file:', error);
      }
    );
  }

  private sendResultsToServer() {
    this.isLoading = true;
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      formData.append('confounders', JSON.stringify(this.confounders));
      formData.append('predictorX', this.predictorX);
      formData.append('mediatorY', this.mediatorY);
      formData.append('targetVariable', this.targetVariable);
      formData.append('mediatorModel', this.selectMediatorModel);
      formData.append('targetModel', this.slectedTargetVariable);

      this.indirectEffectsService.sendResults(formData).subscribe(
        response => {
          debugger;
          this.responseData = response.data;
          this.isLoading = false;
          console.log('Results successfully sent:', response);
        },
        error => {
          console.error('Error sending results:', error);
        }
      );
    }
  }
}

export interface MediationResults {
  total_effect: number;
  effect_of_smoker_on_overweight: number;
  direct_effect: number;
  effect_of_overweight_on_heart_disease: number;
  indirect_effect: number;
  indirect_effect_ci: [number, number];  
  direct_effect_ci: [number, number];   
  total_effect_ci: [number, number];     
  nnt: any,
  nnt_confidence_interval: any
}

