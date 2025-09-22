import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DocumentCardComponent } from './document-card.component';

const mockDocument = {
  _id: '123',
  title: 'Test Document Title',
  content: 'Test document content.'
};

describe('DocumentCardComponent', () => {
  let component: DocumentCardComponent;
  let fixture: ComponentFixture<DocumentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentCardComponent);
    component = fixture.componentInstance;
  });

  it('TC01 - should create', () => {
    expect(component).toBeTruthy();
  });

  it('TC02 - should display document title if provided', () => {
    component.document = mockDocument;
    fixture.detectChanges();

    const cardElement = fixture.nativeElement as HTMLElement;

    expect(cardElement.querySelector('h3')?.textContent).toContain('Test Document');
  });

  it('TC03 - should display doc ID if title is not provided', () => {
    const docWithNoTitle = { ...mockDocument, title: '' };

    component.document = docWithNoTitle;
    fixture.detectChanges();

    const cardElement = fixture.nativeElement as HTMLElement;

    expect(cardElement.querySelector('h3')?.textContent).toContain('ID: 123');
  });

  it('TC04 - should not render if no document', () => {
    fixture.detectChanges();
    const cardElement = fixture.nativeElement as HTMLElement;

    expect(cardElement.querySelector('.document')).toBeNull();
  });

  it('TC05 - should have a link to the document edit page', () => {
    component.document = mockDocument;
    fixture.detectChanges();

    const cardElement = fixture.nativeElement as HTMLElement;
    const link = cardElement.querySelector('a');

    expect(link?.getAttribute('href')).toBe('/doc/123');
    expect(link?.hasAttribute('disabled')).toBe(false);
  });
});
