import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareDocDialogComponent } from './share-doc-dialog.component';

describe('ShareDocDialogComponent', () => {
  let component: ShareDocDialogComponent;
  let fixture: ComponentFixture<ShareDocDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareDocDialogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ShareDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
