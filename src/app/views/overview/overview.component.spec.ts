import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { OverviewComponent } from './overview.component';
import { ApiService } from '../../services/api.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let apiService: ApiService;

  const mockDocuments = [
    { _id: '1', title: 'Doc 1', content: 'Content 1' },
    { _id: '2', title: 'Doc 2', content: 'Content 2' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('TC01 - should create', () => {
    expect(component).toBeTruthy();
  });

  it('TC02 - should call getDocuments on init', () => {
    const getDocumentsSpy = spyOn(component, 'getDocuments').and.callThrough();

    component.ngOnInit();

    expect(getDocumentsSpy).toHaveBeenCalled();
  });

  it('TC03 - should fetch documents successfully', () => {
    spyOn(apiService, 'getDocuments').and.returnValue(of(mockDocuments));

    component.getDocuments();

    expect(component.loading).toBe(false);
    expect(component.documents).toEqual(mockDocuments);
    expect(component.error).toBeUndefined();
  });

  it('TC04 - should handle error when fetching documents', () => {
    spyOn(apiService, 'getDocuments').and.returnValue(throwError(() => new Error('Failed to fetch')));

    component.getDocuments();

    expect(component.loading).toBe(false);
    expect(component.documents.length).toBe(0);
    expect(component.error).toBe('Failed to fetch documents');
  });

  it('TC05 - should update loading state with onLoadingChange', () => {
    component.onLoadingChange(true);
    expect(component.loading).toBe(true);

    component.onLoadingChange(false);
    expect(component.loading).toBe(false);
  });

  it('TC06 - should update error state with onErrorChange', () => {
    const errorMessage = 'A new error';
    component.onErrorChange(errorMessage);

    expect(component.error).toBe(errorMessage);
  });
});
