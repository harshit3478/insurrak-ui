import type { Metadata } from "next";
import { PersonalInfoForm } from "./_components/personal-info";
import { UploadPhotoForm } from "./_components/upload-photo";

export const metadata: Metadata = {
  title: "Settings Page",
};

/**
 * SettingsPage provides an interface for users to update their personal 
 * information and profile picture. It aggregates sub-components for form 
 * management.
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-3">
          <PersonalInfoForm />
        </div>
        <div className="col-span-5 xl:col-span-2">
          <UploadPhotoForm />
        </div>
      </div>
    </div>
  );
};

