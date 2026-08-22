import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarCheck2,
  CreditCard,
  Hash,
  Landmark,
  Mail,
  MapPin,
  Pencil,
  PhoneCall,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { InfoField } from "@/components/shared/InfoField";
import { ErrorState } from "@/components/shared/ErrorState";
import { EditProfileDialog } from "@/components/employee/EditProfileDialog";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmployeeProfile } from "@/types";

const GENDER_LABEL: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

export default function EmployeeProfile() {
  const { user } = useAuth();
  const { profile, isLoading, error, refetch, updateProfile } = useProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (patch: Partial<EmployeeProfile>) => {
    setIsSaving(true);
    const ok = await updateProfile(patch);
    setIsSaving(false);
    return ok;
  };

  if (isLoading) return <ProfileSkeleton />;
  if (error)
    return (
      <ErrorState
        title="Couldn't load your profile"
        description={error}
        onRetry={refetch}
      />
    );
  if (!profile) return null;

  const displayName = user?.name ?? "Dayflow Employee";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-col items-start gap-5 py-6 sm:flex-row sm:items-center">
          <Avatar className="size-20 border-2 border-border">
            {profile.avatarUrl && (
              <AvatarImage src={profile.avatarUrl} alt={displayName} />
            )}
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {user?.email}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="gap-1">
                <BriefcaseBusiness className="size-3" />
                {profile.designation}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Building2 className="size-3" />
                {profile.department}
              </Badge>
              <Badge variant="secondary" className="gap-1 font-mono">
                <Hash className="size-3" />
                {profile.employeeId}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <ShieldCheck className="size-3" />
                Verified
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 sm:ml-auto"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-3.5" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <InfoField
              icon={PhoneCall}
              label="Phone"
              value={profile.phone}
            />
            <InfoField
              icon={CalendarDays}
              label="Date of Birth"
              value={formatDate(profile.dateOfBirth)}
            />
            <InfoField
              icon={UserRound}
              label="Gender"
              value={
                profile.gender ? GENDER_LABEL[profile.gender] : null
              }
            />
            <InfoField
              icon={PhoneCall}
              label="Emergency Contact"
              value={profile.emergencyContact}
            />
            <InfoField
              icon={MapPin}
              label="Address"
              value={profile.address}
              className="sm:col-span-2"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Managed by HR — contact admin to request changes
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoField
                icon={Building2}
                label="Department"
                value={profile.department}
              />
              <InfoField
                icon={BriefcaseBusiness}
                label="Designation"
                value={profile.designation}
              />
              <InfoField
                icon={Hash}
                label="Employee ID"
                value={profile.employeeId}
              />
              <InfoField
                icon={CalendarCheck2}
                label="Joined On"
                value={formatDate(profile.joinedAt)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Payslips are credited here</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoField
                icon={Landmark}
                label="Bank"
                value={profile.bankName}
              />
              <InfoField
                icon={CreditCard}
                label="Account Number"
                value={profile.bankAccountNo}
              />
              <InfoField
                icon={Hash}
                label="IFSC Code"
                value={profile.ifscCode}
                className="sm:col-span-2"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        saving={isSaving}
        onSave={handleSave}
      />
    </div>
  );
}
