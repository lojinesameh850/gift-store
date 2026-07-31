import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { customerService, customerProfile, shippingAddress } from '../../services/customerService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profilePage.html',
  styleUrl: './profilePage.css'
})
export class profileComponent implements OnInit {
  profileForm!: FormGroup;
  addresses: shippingAddress[] = [];

  // Separate display properties to stop "real-time" header updates while typing
  displayName = '';
  userInitials = '';

  showAddressModal = false;
  editingAddressId: string | null = null;
  addressForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: customerService
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
        // Set initial form values
        this.profileForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone
        });

        // Set static header displays (won't change until save)
        this.updateHeaderDisplay(data.firstName, data.lastName);

        // Populate addresses array directly from backend response
        this.addresses = data.shippingAddresses || [];
      },
      error: (err) => console.error('Error loading profile:', err)
    });
  }

  private updateHeaderDisplay(first: string, last: string): void {
    this.displayName = `${first} ${last}`.trim();
    this.userInitials = `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  }

  // --- 1. Fix Profile Info Real-Time Typing ---
  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    this.customerService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (updatedProfile: customerProfile) => {
        // Only update the header display AFTER successful save
        this.updateHeaderDisplay(updatedProfile.firstName, updatedProfile.lastName);
        alert('Profile changes saved successfully!');
        window.location.reload();
      },
      error: (err) => {
        console.error('Failed to save profile:', err);
        alert('Failed to save profile changes.');
      }
    });
  }

  // --- 2. Fix Address Updates Requiring Reload ---
  private saveAddressesToBackend(updatedAddresses: shippingAddress[]): void {
    this.customerService.updateProfile({ shippingAddresses: updatedAddresses }).subscribe({
      next: (updatedProfile: customerProfile) => {
        // Re-assign addresses directly from server response so UI immediately reflects changes
        this.addresses = updatedProfile.shippingAddresses || [];
        window.location.reload();
      },
      error: (err) => {
        console.error('Failed to update addresses:', err);
        // Optional fallback: re-fetch whole profile if update response is partial
        this.loadProfile();
      }
    });
  }

  // --- Address Modal Controls ---
  setDefaultAddress(targetAddr: shippingAddress): void {
    if (targetAddr.isDefault) return;
    const updated = this.addresses.map(a => ({ ...a, isDefault: a._id === targetAddr._id }));
    this.saveAddressesToBackend(updated);
  }

  openAddModal(): void {
    this.editingAddressId = null;
    this.addressForm.reset({ isDefault: this.addresses.length === 0 });
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
    let updatedList = [...this.addresses];

    if (formVal.isDefault) {
      updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
    }

    if (this.editingAddressId) {
      updatedList = updatedList.map(a =>
        a._id === this.editingAddressId ? { ...formVal, _id: this.editingAddressId } : a
      );
    } else {
      updatedList.push(formVal);
    }

    this.saveAddressesToBackend(updatedList);
    this.closeAddressModal();
  }

  onDeleteAddress(id?: string): void {
    // 1. Guard check for missing ID
    if (!id) {
      console.error('Cannot delete address: Missing address ID');
      return;
    }

    // 2. User confirmation
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    // 3. Filter out the address to delete
    const updatedList = this.addresses.filter(a => a._id !== id);

    // 4. Send the updated array to the backend (which handles window.location.reload())
    this.saveAddressesToBackend(updatedList);
  }

  onLogout(): void {
    console.log('Logging out...');
  }
}
