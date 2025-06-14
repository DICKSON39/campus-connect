import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdituserComponent } from './edituser-component';

describe('EdituserComponent', () => {
  let component: EdituserComponent;
  let fixture: ComponentFixture<EdituserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdituserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdituserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
