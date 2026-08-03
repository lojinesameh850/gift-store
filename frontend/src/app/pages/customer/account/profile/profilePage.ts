import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { customerService, customerProfile, shippingAddress } from '../../../../services/customer/customerService';
import { notificationService } from '../../../../services/notificationService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profilePage.html',
  styleUrl: './profilePage.css'
})
export class profileComponent implements OnInit {
  profileForm!: FormGroup;
  addresses = signal<shippingAddress[]>([]);

  // Header display, derived from signals instead of manually re-synced after
  // every save - updateHeaderDisplay() no longer needs to exist as a
  // separate step you have to remember to call.
  private firstName = signal('');
  private lastName = signal('');
  displayName = computed(() => `${this.firstName()} ${this.lastName()}`.trim());
  userInitials = computed(() =>
    `${this.firstName()?.[0] || ''}${this.lastName()?.[0] || ''}`.toUpperCase()
  );

  showAddressModal = false;
  editingAddressId: string | null = null;
  addressForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: customerService,
    private notifications: notificationService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['']
    });

    this.addressForm = this.fb.group({
      city: ['', Validators.required],
      building: ['', Validators.required],
      street: ['', Validators.required],
      apartment: [''],
      zipCode: [''],
      isDefault: [false]
    });
  }

  loadProfile(): void {
    this.customerService.getProfile().subscribe({
      next: (data: customerProfile) => {
        this.profileForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone
        });

        this.firstName.set(data.firstName);
        this.lastName.set(data.lastName);
        this.addresses.set(data.shippingAddresses || []);
      },
      error: (err) => console.error('Error loading profile:', err)
    });
  }

  // --- 1. Profile Info ---
  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    this.customerService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (updatedProfile: customerProfile) => {
        // Header derives from these signals automatically - no reload needed.
        this.firstName.set(updatedProfile.firstName);
        this.lastName.set(updatedProfile.lastName);
        this.notifications.showSuccess('Profile changes saved successfully');
      },
      error: (err) => {
        console.error('Failed to save profile:', err);
      }
    });
  }

  // --- 2. Address Updates ---
  private saveAddressesToBackend(updatedAddresses: shippingAddress[]): void {
    this.customerService.updateProfile({ shippingAddresses: updatedAddresses }).subscribe({
      next: (updatedProfile: customerProfile) => {
        // Re-assign directly from the server response - single source of
        // truth, no reload required to "pick up" the change.
        this.addresses.set(updatedProfile.shippingAddresses || []);
      },
      error: (err) => {
        console.error('Failed to update addresses:', err);
        // Fallback: re-fetch whole profile if the update response was partial.
        this.loadProfile();
      }
    });
  }

  // --- Address Modal Controls ---
  setDefaultAddress(targetAddr: shippingAddress): void {
    if (targetAddr.isDefault) return;
    const updated = this.addresses().map((a) => ({ ...a, isDefault: a._id === targetAddr._id }));
    this.saveAddressesToBackend(updated);
  }

  openAddModal(): void {
    this.editingAddressId = null;
    this.addressForm.reset({ isDefault: this.addresses().length === 0 });
    this.showAddressModal = true;
  }

  openEditModal(addr: shippingAddress): void {
    this.editingAddressId = addr._id || null;
    this.addressForm.patchValue(addr);
    this.showAddressModal = true;
  }

  closeAddressModal(): void {
    this.showAddressModal = false;
    this.editingAddressId = null;
  }

  onSaveAddress(): void {
    if (this.addressForm.invalid) return;

    const formVal = this.addressForm.value;
    let updatedList = [...this.addresses()];

    if (formVal.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    if (this.editingAddressId) {
      updatedList = updatedList.map((a) =>
        a._id === this.editingAddressId ? { ...formVal, _id: this.editingAddressId } : a
      );
    } else {
      updatedList.push(formVal);
    }

    this.saveAddressesToBackend(updatedList);
    this.closeAddressModal();
  }

  onDeleteAddress(id?: string): void {
    if (!id) {
      console.error('Cannot delete address: Missing address ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    const updatedList = this.addresses().filter((a) => a._id !== id);
    this.saveAddressesToBackend(updatedList);
  }

  onLogout(): void {
    console.log('Logging out...');
  }
}
