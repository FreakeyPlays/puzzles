import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchComponent } from './switch.component';

describe('SwitchComponent', () => {
  let component: SwitchComponent;
  let fixture: ComponentFixture<SwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwitchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ariaLabel', 'Test switch');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have role="switch" on the button', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('role')).toBe('switch');
  });

  it('should set aria-label on the button', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Test switch');
  });

  it('should reflect checked state in aria-checked', async () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    fixture.componentRef.setInput('checked', false);
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('false');

    fixture.componentRef.setInput('checked', true);
    await fixture.whenStable();
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  it('should emit checkedChange with toggled value on click', async () => {
    fixture.componentRef.setInput('checked', false);
    await fixture.whenStable();

    const emitted: boolean[] = [];
    component.checkedChange.subscribe((v: boolean) => emitted.push(v));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(emitted).toEqual([true]);
  });
});
