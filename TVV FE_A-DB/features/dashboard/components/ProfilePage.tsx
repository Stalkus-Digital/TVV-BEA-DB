"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { AuthField } from "@/features/auth";
import { useAuth } from "@/features/auth";
import { changePasswordSchema, profileSchema, type ChangePasswordFormValues, type ProfileFormValues } from "../schemas";
import { useChangePasswordMutation, useUpdateProfileMutation } from "../hooks/useProfileMutations";
import { DashboardShell } from "./DashboardShell";

export function ProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfileMutation();
  const changePassword = useChangePasswordMutation();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    profileForm.reset({ name: user?.name ?? "", phone: user?.phone ?? "" });
  }, [user, profileForm]);

  return (
    <DashboardShell>
      <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-tight text-ink">
        Profile
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        Update your contact details and password.
      </p>

      <form
        className="mt-10 max-w-lg space-y-5 rounded-xl border border-line bg-white p-6"
        onSubmit={profileForm.handleSubmit((values) => {
          updateProfile.mutate(values, {
            onSuccess: () => profileForm.reset(values),
          });
        })}
      >
        <h2 className="font-display text-[20px] text-ink">Contact details</h2>
        <AuthField
          label="Email"
          id="profile-email"
          type="email"
          value={user?.email ?? ""}
          disabled
          readOnly
        />
        <p className="-mt-3 text-[12px] text-ink-muted">Email cannot be changed here.</p>
        <AuthField
          label="Full name"
          id="profile-name"
          error={profileForm.formState.errors.name?.message}
          {...profileForm.register("name")}
        />
        <AuthField
          label="Phone"
          id="profile-phone"
          type="tel"
          error={profileForm.formState.errors.phone?.message}
          {...profileForm.register("phone")}
        />
        {updateProfile.isError && (
          <p className="text-sm text-danger">
            {updateProfile.error instanceof ApiError
              ? updateProfile.error.message
              : "Could not update profile"}
          </p>
        )}
        {updateProfile.isSuccess && (
          <p className="text-sm text-teal">Profile updated.</p>
        )}
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <form
        className="mt-8 max-w-lg space-y-5 rounded-xl border border-line bg-white p-6"
        onSubmit={passwordForm.handleSubmit(({ currentPassword, newPassword }) => {
          changePassword.mutate(
            { currentPassword, newPassword },
            {
              onSuccess: () => passwordForm.reset(),
            },
          );
        })}
      >
        <h2 className="font-display text-[20px] text-ink">Change password</h2>
        <AuthField
          label="Current password"
          id="current-password"
          type="password"
          autoComplete="current-password"
          error={passwordForm.formState.errors.currentPassword?.message}
          {...passwordForm.register("currentPassword")}
        />
        <AuthField
          label="New password"
          id="new-password"
          type="password"
          autoComplete="new-password"
          error={passwordForm.formState.errors.newPassword?.message}
          {...passwordForm.register("newPassword")}
        />
        <AuthField
          label="Confirm new password"
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          error={passwordForm.formState.errors.confirmPassword?.message}
          {...passwordForm.register("confirmPassword")}
        />
        {changePassword.isError && (
          <p className="text-sm text-danger">
            {changePassword.error instanceof ApiError
              ? changePassword.error.message
              : "Could not change password"}
          </p>
        )}
        {changePassword.isSuccess && (
          <p className="text-sm text-teal">Password updated.</p>
        )}
        <Button type="submit" variant="outline" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </DashboardShell>
  );
}
