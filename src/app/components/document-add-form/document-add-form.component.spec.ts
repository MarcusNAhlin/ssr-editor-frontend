import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAddFormComponent } from './document-add-form.component';

describe('DocumentAddFormComponent', () => {
  let component: DocumentAddFormComponent;
  let fixture: ComponentFixture<DocumentAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentAddFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
