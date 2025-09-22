import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DocumentAddFormComponent } from './document-add-form.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

describe('DocumentAddFormComponent', () => {
  let component: DocumentAddFormComponent;
  let fixture: ComponentFixture<DocumentAddFormComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['addDocument']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DocumentAddFormComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('TC01 - should create', () => {
    expect(component).toBeTruthy();
  });

  it('TC02 - should have an empty title on start', () => {
    expect(component.title).toBe('');
  });

  it('TC03 - should be bound title input to title value', async () => {
    const inputElement = fixture.debugElement.query(By.css('.add-input')).nativeElement;
    const newTitle = 'Test title';

    inputElement.value = newTitle;
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    await fixture.whenStable();

    expect(component.title).toBe(newTitle);
  });

  it('TC04 - should navigate to the new document on success', () => {
    component.title = 'Test title';

    const newDoc = { _id: '123', title: component.title, content: ' ' };

    mockApiService.addDocument.and.returnValue(of(newDoc));

    component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/doc/123']);
  });

  it('TC05 - should throw error on API failure', () => {
    component.title = 'New Doc';
    spyOn(component.errorChange, 'emit');

    mockApiService.addDocument.and.returnValue(throwError(() => new Error('API Error')));

    component.onSubmit();

    expect(component.errorChange.emit).toHaveBeenCalledWith('Failed to add new document');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('TC06 - should not redirect when error on API failure', () => {
    component.title = 'New Doc';
    spyOn(component.errorChange, 'emit');

    mockApiService.addDocument.and.returnValue(throwError(() => new Error('API Error')));

    component.onSubmit();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('TC07 - should emit loadingChange true when loading', () => {
    const newDoc = { _id: '123', title: component.title, content: ' ' };

    spyOn(component.loadingChange, 'emit');
    mockApiService.addDocument.and.returnValue(of(newDoc));

    component.onSubmit();

    expect(component.loadingChange.emit).toHaveBeenCalledWith(true);
  });

  it('TC08 - should emit loadingChange false when stop loading', () => {
    const newDoc = { _id: '123', title: component.title, content: ' ' };

    spyOn(component.loadingChange, 'emit');
    mockApiService.addDocument.and.returnValue(of(newDoc));

    component.onSubmit();

    expect(component.loadingChange.emit).toHaveBeenCalledWith(false);
  });
});
