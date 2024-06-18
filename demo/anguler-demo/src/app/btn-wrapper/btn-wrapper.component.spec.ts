import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnWrapperComponent } from './btn-wrapper.component';

describe('BtnWrapperComponent', () => {
  let component: BtnWrapperComponent;
  let fixture: ComponentFixture<BtnWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
