import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CausalityParametersComponent } from './causality-parameters.component';

describe('CausalityParametersComponent', () => {
  let component: CausalityParametersComponent;
  let fixture: ComponentFixture<CausalityParametersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CausalityParametersComponent]
    });
    fixture = TestBed.createComponent(CausalityParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
