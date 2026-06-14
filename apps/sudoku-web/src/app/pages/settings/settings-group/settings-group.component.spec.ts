import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsGroupComponent } from './settings-group.component';

describe('SettingsGroupComponent', () => {
  let component: SettingsGroupComponent;
  let fixture: ComponentFixture<SettingsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsGroupComponent);
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

  it('should render the card container for projected items', () => {
    const card: HTMLElement = fixture.nativeElement.querySelector('.rounded-2xl');
    expect(card).toBeTruthy();
  });
});
