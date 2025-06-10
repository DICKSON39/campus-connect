import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCreationModalComponent } from './post-creation-modal.component';

describe('PostCreationModalComponent', () => {
  let component: PostCreationModalComponent;
  let fixture: ComponentFixture<PostCreationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCreationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
