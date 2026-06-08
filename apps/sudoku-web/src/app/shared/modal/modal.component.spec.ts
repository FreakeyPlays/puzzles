import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;

  let showModalMock: ReturnType<typeof vi.fn>;
  let closeMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    showModalMock = vi.fn();
    closeMock = vi.fn();
    // jsdom does not implement showModal/close; define them so the directive and component work
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      value: showModalMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      value: closeMock,
      configurable: true,
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialDifficulty', 'medium');
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('renders a button for each difficulty', () => {
      const buttons = fixture.debugElement.queryAll(By.css('[role="radio"]'));
      expect(buttons.length).toBe(4);
    });

    it('marks the initial difficulty as aria-checked', () => {
      const checkedBtn = fixture.debugElement
        .queryAll(By.css('[role="radio"]'))
        .find((b) => b.nativeElement.getAttribute('aria-checked') === 'true');
      expect(checkedBtn?.nativeElement.textContent.trim()).toBe('medium');
    });
  });

  describe('difficulty selection', () => {
    it('updates selected when a difficulty button is clicked', () => {
      const hardBtn = fixture.debugElement
        .queryAll(By.css('[role="radio"]'))
        .find((b) => b.nativeElement.textContent.trim() === 'hard');
      hardBtn!.nativeElement.click();
      expect(component['selected']()).toBe('hard');
    });

    it('updates aria-checked to the newly selected difficulty', () => {
      component.onSelect('easy');
      fixture.detectChanges();
      const easyBtn = fixture.debugElement
        .queryAll(By.css('[role="radio"]'))
        .find((b) => b.nativeElement.textContent.trim() === 'easy');
      expect(easyBtn?.nativeElement.getAttribute('aria-checked')).toBe('true');
    });

    it('reflects initialDifficulty changes via linkedSignal', () => {
      fixture.componentRef.setInput('initialDifficulty', 'extreme');
      fixture.detectChanges();
      expect(component['selected']()).toBe('extreme');
    });
  });

  describe('cancel', () => {
    it('emits cancelModal and closes the dialog', () => {
      const spy = vi.fn();
      component.cancelModal.subscribe(spy);
      component.onCancel();
      expect(spy).toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();
    });

    it('handles the native dialog cancel event without closing twice', () => {
      const spy = vi.fn();
      component.cancelModal.subscribe(spy);
      const event = new Event('cancel', { cancelable: true });
      component.onDialogCancel(event);
      expect(event.defaultPrevented).toBe(true);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('emits confirmModal with the currently selected difficulty', () => {
      const spy = vi.fn();
      component.confirmModal.subscribe(spy);
      component.onSelect('hard');
      component.onConfirm();
      expect(spy).toHaveBeenCalledWith('hard');
    });

    it('closes the dialog on confirm', () => {
      component.onConfirm();
      expect(closeMock).toHaveBeenCalled();
    });
  });
});
