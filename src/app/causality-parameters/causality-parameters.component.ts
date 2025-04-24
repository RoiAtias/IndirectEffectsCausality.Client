import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IndirectEffectsService } from '../indirect-effects.service';
import { MatTableDataSource } from '@angular/material/table';
import { UserSelectionService } from '../user-selection.service';

@Component({
  selector: 'app-causality-parameters',
  templateUrl: './causality-parameters.component.html',
  styleUrls: ['./causality-parameters.component.css'],
})
export class CausalityParametersComponent {

  stepIndex = 0;
  selectedSteps = [];

  steps = [
    { message: 'Upload Dataset' },
    { message: 'Confounders Selection' },
    { message: 'Treatment' },
    { message: 'Mediator' },
    { message: 'Outcome' },
    { message: 'Results' }
  ];
  fileName = '';
  isCsvFile: boolean = true;
  selectedFile: File | null = null;
  responseData: MediationResults | null = null;
  confounderOptions = [];
  predictorOptions = [];
  mediatorOptions = [];
  targetOptions = [];
  isLoading: boolean = false;


  displayedColumns: string[] = ['Effect', 'Estiamtor','CI_LOWER','CI_UPPER'];
  dataSource = new MatTableDataSource<any>([]);

  // Test
  // confounders : string [] = ['Age', 'Sex'];
  // predictorX: string = 'Smoker';
  // mediatorY: string = 'overweight';
  // selectMediatorModel: string = 'logistic'
  // targetVariable: string = 'HeartDiseaseorAttack';
  // slectedTargetVariable: string = 'logistic';


  
  confounders: string[] = [];
  predictorX: string = '';
  mediatorY: string = '';
  targetVariable: string = '';
  selectMediatorModel: string = '';
  slectedTargetVariable: string = '';


  nntSummary = '';


  constructor(private indirectEffectsService: IndirectEffectsService,
              private userSelectionService: UserSelectionService) { }

  nextStep() {
    this.updateUserSelections();
    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex++;
    }
    if (this.stepIndex === this.steps.length - 1) {
      this.sendResultsToServer();
    }
  }

  previousStep() {
    this.responseData = null;
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
          this.responseData = response.data;

          if(this.responseData != null) {
            this.nntSummary = this.generateNNTSummary(this.responseData);
          }

          this.isLoading = false;
          this.dataSource.data = [
            { Effect: 'INNT', Estiamtor: response.data.innt, CI_LOWER : response.data.innt_confidence_interval_lower, CI_UPPER : response.data.innt_confidence_interval_upper },
            { Effect: 'DNNT', Estiamtor: response.data.dnnt, CI_LOWER: response.data.dnnt_confidence_interval_lower, CI_UPPER : response.data.dnnt_confidence_interval_upper },
            { Effect: 'NNT', Estiamtor: response.data.nnt, CI_LOWER : response.data.nnt_confidence_interval_lower, CI_UPPER : response.data.nnt_confidence_interval_upper }
          ];
        },
        error => {
          console.error('Error sending results:', error);
        }
      );
    }
  }

  exportToCSV(): void {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Effect,Estiamtor,CI\n';

    this.dataSource.data.forEach(row => {
      debugger;
      csvContent += `${row.Effect},${row.Estiamtor},${row.CI}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  updateUserSelections() {
    this.userSelectionService.setSelection('fileName', this.fileName);
    this.userSelectionService.setSelection('confounders', this.confounders);
    this.userSelectionService.setSelection('predictorX', this.predictorX);
    this.userSelectionService.setSelection('mediatorY', this.mediatorY);
    this.userSelectionService.setSelection('targetVariable', this.targetVariable);
    this.userSelectionService.setSelection('selectMediatorModel', this.selectMediatorModel);
    this.userSelectionService.setSelection('selectedTargetVariable', this.slectedTargetVariable);
  }

  interpretEffect(value: number): string {
    if (value < 5) return "a strong effect";
    if (value <= 15) return "a moderate effect";
    return "a weak effect";
  }
  
  generateNNTSummary(result: MediationResults): string {
    const confoundersText = this.confounders && this.confounders.length
      ? ` while controlling for ${this.confounders.map(c => `<strong>${c}</strong>`).join(', ')}`
      : "";
  
    return `
  Analyzing the effect of <strong>${this.predictorX}</strong> on <strong>${this.targetVariable}</strong>${confoundersText}, with <strong>${this.mediatorY}</strong> as a mediator
  
  <span class="interpretation-highlight">Interpretation:</span>

  🔹 On average, ${result.nnt.toFixed(2)} individuals need to be exposed to <strong>${this.predictorX}</strong> in order to observe one additional case of <strong>${this.targetVariable}</strong> compared to non-exposed individuals.
  
  🔹 On average, ${result.innt.toFixed(2)} individuals need to be exposed to <strong>${this.predictorX}</strong> to observe one additional case of <strong>${this.targetVariable}</strong> that is attributable to the mediated (indirect) effect of <strong>${this.predictorX}</strong> through <strong>${this.mediatorY}</strong>.
  
  🔹 On average, ${result.dnnt.toFixed(2)} individuals need to be exposed to <strong>${this.predictorX}</strong> to observe one additional case of <strong>${this.targetVariable}</strong> that is caused directly by <strong>${this.predictorX}</strong>, while holding <strong>${this.mediatorY}</strong> fixed at the level it would have attained under <strong>${this.predictorX}</strong>.
  `.trim();
  }

  getEffectTooltip(effect: string): string {
    switch (effect) {
      case 'INNT':
        return 'Indirect effect NNT';
      case 'DNNT':
        return 'Direct effect NNT';
      case 'NNT':
        return 'Total Effect NNT';
      default:
        return '';
    }
  }
}
  
export interface MediationResults {
  indirect_effect: number;
  total_effect: number;
  direct_effect: number;
  innt: number;
  dnnt: number;
  nnt: number;
  nnt_confidence_interval_lower: number,
  nnt_confidence_interval_upper: number,
  innt_confidence_interval_lower: number,
  innt_confidence_interval_upper: number,
  dnnt_confidence_interval_lower: number,
  dnnt_confidence_interval_upper: number,
}

