import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CausalityParametersComponent } from './causality-parameters/causality-parameters.component';

const routes: Routes = [
  { path: '', component: CausalityParametersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }