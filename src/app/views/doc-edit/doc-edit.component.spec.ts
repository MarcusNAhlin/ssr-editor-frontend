import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DocEditComponent } from './doc-edit.component';

describe('DocEditComponent', () => {
  let component: DocEditComponent;
  let fixture: ComponentFixture<DocEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocEditComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DocEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('TC01 - should create', () => {
    expect(component).toBeTruthy();
  });
});
