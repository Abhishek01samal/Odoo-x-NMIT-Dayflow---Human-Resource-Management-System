import { useState, type ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/shared/LoadingButton";
import type { EmployeeProfile } from "@/types";

type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: EmployeeProfile;
  saving: boolean;
  onSave: (patch: Partial<EmployeeProfile>) => Promise<boolean>;
};

type EditProfileFormProps = {
  profile: EmployeeProfile;
  saving: boolean;
  onSave: (patch: Partial<EmployeeProfile>) => Promise<boolean>;
  onCancel: () => void;
};

const inputCls =
  "flex h-9 w-full rounded-lg border border-border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";

function EditProfileForm({
  profile,
  saving,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : ""
  );
  const [gender, setGender] = useState<string>(profile.gender ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [emergencyContact, setEmergencyContact] = useState(
    profile.emergencyContact ?? ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({
      phone: phone.trim(),
      ...(dateOfBirth ? { dateOfBirth } : {}),
      ...(gender ? { gender: gender as EmployeeProfile["gender"] } : {}),
      address: address.trim(),
      emergencyContact: emergencyContact.trim(),
    });
    if (ok) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Phone</Label>
          <Input
            id="edit-phone"
            value={phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPhone(e.target.value)
            }
            placeholder="+91 98765 43210"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-dob">Date of Birth</Label>
          <Input
            id="edit-dob"
            type="date"
            value={dateOfBirth}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDateOfBirth(e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-gender">Gender</Label>
          <select
            id="edit-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={inputCls}
          >
            <option value="">Select…</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-emergency">Emergency Contact</Label>
          <Input
            id="edit-emergency"
            value={emergencyContact}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmergencyContact(e.target.value)
            }
            placeholder="+91 91234 56780"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-address">Address</Label>
          <textarea
            id="edit-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className={`${inputCls} h-auto min-h-[76px] py-2`}
            placeholder="Street, area, city, PIN"
          />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={saving} loadingText="Saving...">
          Save Changes
        </LoadingButton>
      </DialogFooter>
    </form>
  );
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  saving,
  onSave,
}: EditProfileDialogProps) {
  if (!open) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <span hidden />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
          <DialogDescription>
            Update your contact details. Job and bank details are managed by
            HR.
          </DialogDescription>
        </DialogHeader>
        <EditProfileForm
          profile={profile}
          saving={saving}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}


