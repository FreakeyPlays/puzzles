import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { VisibilityService } from './visibility.service';

describe('VisibilityService', () => {
  let service: VisibilityService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisibilityService);
    doc = TestBed.inject(DOCUMENT);
  });

  it('initializes isVisible to true when document is not hidden', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const doc = TestBed.inject(DOCUMENT);
    Object.defineProperty(doc, 'hidden', { value: false, configurable: true });
    const service = TestBed.inject(VisibilityService);
    expect(service.isVisible()).toBe(true);
  });

  it('sets isVisible to false when visibilitychange fires and document is hidden', () => {
    Object.defineProperty(doc, 'hidden', { value: true, configurable: true });
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(service.isVisible()).toBe(false);
  });

  it('restores isVisible to true when page becomes visible again', () => {
    Object.defineProperty(doc, 'hidden', { value: true, configurable: true });
    doc.dispatchEvent(new Event('visibilitychange'));

    Object.defineProperty(doc, 'hidden', { value: false, configurable: true });
    doc.dispatchEvent(new Event('visibilitychange'));

    expect(service.isVisible()).toBe(true);
  });
});
