import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-700 mb-4">
        MeroVote collects basic information from authentication providers (Google and Facebook) to create
        and manage your account. The information we store may include your name, email (if available), and
        profile photo. We use this information only to identify you in the application and to provide the
        voting experience.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Data Usage</h2>
      <p className="text-gray-700 mb-4">
        We do not sell or share your personal data with third parties except as required to operate the
        authentication flow (Google/Facebook) and to comply with legal requests. Access tokens are issued by
        the backend and stored client-side only when you sign in.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Data Deletion</h2>
      <p className="text-gray-700 mb-4">
        If you want your account and stored data removed, contact us at <strong>gundriai@gmail.com</strong> and
        we will delete your account data from our systems.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-gray-700 mb-4">
        For privacy concerns or questions, email <strong>gundriai@gmail.com</strong>.
      </p>

      <p className="text-sm text-gray-500 mt-8">Last updated: 2025-11-22</p>
    </div>
  );
}
