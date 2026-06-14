import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsOptionComponent } from './settings-option.component';

describe('SettingsOptionComponent', () => {
  let component: SettingsOptionComponent;
  let fixture: ComponentFixture<SettingsOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsOptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsOptionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Vibrations');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(title.textContent?.trim()).toBe('Vibrations');
  });

  it('should display the description when provided', async () => {
    fixture.componentRef.setInput('description', 'Haptic feedback on moves');
    await fixture.whenStable();
    const paragraphs: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('p');
    expect(paragraphs[1].textContent?.trim()).toBe('Haptic feedback on moves');
  });

  it('should not render the description element when not provided', () => {
    const paragraphs: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('p');
    expect(paragraphs.length).toBe(1);
  });
});
