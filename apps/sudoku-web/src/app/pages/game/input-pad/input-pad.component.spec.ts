import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InputPadComponent } from './input-pad.component';

describe('InputPadComponent', () => {
  let fixture: ComponentFixture<InputPadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputPadComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(InputPadComponent);
    fixture.detectChanges();
  });

  it('renders 9 digit buttons and 1 erase button (10 total)', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(10);
  });

  it('emits the clicked digit via digitInput', () => {
    const spy = vi.fn();
    fixture.componentInstance.digitInput.subscribe(spy);

    const btn5 = fixture.debugElement.query(By.css('[aria-label="Place 5"]'));
    btn5.nativeElement.click();

    expect(spy).toHaveBeenCalledWith(5);
  });

  it('emits 0 via digitInput when the erase button is clicked', () => {
    const spy = vi.fn();
    fixture.componentInstance.digitInput.subscribe(spy);

    const eraseBtn = fixture.debugElement.query(By.css('[aria-label="Erase"]'));
    eraseBtn.nativeElement.click();

    expect(spy).toHaveBeenCalledWith(0);
  });

  it('emits each digit 1–9 correctly', () => {
    const emitted: number[] = [];
    fixture.componentInstance.digitInput.subscribe((v) => emitted.push(v));

    for (let d = 1; d <= 9; d++) {
      const btn = fixture.debugElement.query(By.css(`[aria-label="Place ${d}"]`));
      btn.nativeElement.click();
    }

    expect(emitted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
