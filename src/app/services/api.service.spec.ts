import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Document } from '../types/document';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  const apiURL = environment.API_URL;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService
      ]
    });
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('TC01 - should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDocuments', () => {
    it('TC02 - should return array of documents on success', () => {
      const mockDocuments: Document[] = [
        { _id: '1', title: 'Doc 1', content: 'Content 1' },
        { _id: '2', title: 'Doc 2', content: 'Content 2' }
      ];

      service.getDocuments().subscribe(documents => {
        expect(documents).toEqual(mockDocuments);
      });


      const req = httpTestingController.expectOne(`${apiURL}/docs`);
      expect(req.request.method).toEqual('GET');

      req.flush(mockDocuments);
    });

    it('TC03 - should handle errors', () => {
      service.getDocuments().subscribe({
        next: () => fail('should have made failure'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });
      const req = httpTestingController.expectOne(`${apiURL}/docs`);

      req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
    });

    it('TC03.1 - should handle client-side/network errors', () => {
      spyOn(console, 'error');

      service.getDocuments().subscribe({
        next: () => fail('should have failed with a client-side error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toContain('Something bad happened; please try again later.');
        }
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs`);

      // simulate client-side error
      const errorEvent = new ProgressEvent('error');
      req.error(errorEvent);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getDocument', () => {
    it ('TC04 - should return document on success', () => {
      const mockDocument = { _id: '1', title: 'Doc 1', content: 'Content 1' };

      service.getDocument('1').subscribe(document => {
        expect(document).toEqual(mockDocument);
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs/1`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockDocument);
    });

    it('TC05 - should handle errors', () => {
      service.getDocument('1').subscribe({
        next: () => fail('should have made failure'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });
      const req = httpTestingController.expectOne(`${apiURL}/docs/1`);

      req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('addDocument', () => {
    it('TC06 - should return created document on success', () => {
      const newDocument: Document = { title: 'New Doc', content: 'New Content' };
      const mockDocument: Document = { _id: '3', ...newDocument };

      service.addDocument(newDocument).subscribe(document => {
        expect(document).toEqual(mockDocument);
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs/add`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newDocument);

      req.flush(mockDocument);
    });

    it('TC07 - should handle errors', () => {
      const newDocument: Document = { title: 'New Doc', content: 'New Content' };

      service.addDocument(newDocument).subscribe({
        next: () => fail('should have made failure'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs/add`);
      expect(req.request.method).toEqual('POST');

      req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('editDocument', () => {
    it('TC08 - should return updated document on success', () => {
      const updatedDocument: Document = { _id: '1', title: 'Updated Doc', content: 'Updated Content' };

      service.editDocument(updatedDocument).subscribe(document => {
        expect(document).toEqual(updatedDocument);
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs/update`);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(updatedDocument);

      req.flush(updatedDocument);
    });

    it('TC09 - should handle errors', () => {
      const updatedDocument: Document = { _id: '1', title: 'Updated Doc', content: 'Updated Content' };

      service.editDocument(updatedDocument).subscribe({
        next: () => fail('should have made failure'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs/update`);
      expect(req.request.method).toEqual('PUT');

      req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('deleteDocument', () => {
    it('TC10 - should return deleted document on success', () => {
      const mockDocument = { _id: '1', title: 'Doc 1', content: 'Content 1' };

      service.deleteDocument('1').subscribe(document => {
        expect(document).toEqual(mockDocument);
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs/1`);
      expect(req.request.method).toEqual('DELETE');

      req.flush(mockDocument);
    });

    it('TC11 - should handle errors', () => {
      service.deleteDocument('1').subscribe({
        next: () => fail('should have made failure'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpTestingController.expectOne(`${apiURL}/docs/1`);
      expect(req.request.method).toEqual('DELETE');

      req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
    });
  });
});
