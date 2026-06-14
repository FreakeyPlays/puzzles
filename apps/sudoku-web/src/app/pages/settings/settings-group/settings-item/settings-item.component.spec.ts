import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsItemComponent } from './settings-item.component';

describe('SettingsItemComponent', () => {
  let component: SettingsItemComponent;
  let fixture: ComponentFixture<SettingsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsItemComponent);
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
