import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAreaComponent } from './settings-area.component';

describe('SettingsAreaComponent', () => {
  let component: SettingsAreaComponent;
  let fixture: ComponentFixture<SettingsAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsAreaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsAreaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Feedback');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title in the heading', () => {
    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(heading.textContent?.trim()).toBe('Feedback');
  });

  it('should render the card container for projected options', () => {
    const card: HTMLElement = fixture.nativeElement.querySelector('.rounded-2xl');
    expect(card).toBeTruthy();
  });
});
