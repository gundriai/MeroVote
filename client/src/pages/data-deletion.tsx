import React from 'react';

export default function DataDeletion() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-4">Data Deletion Instructions</h1>
      <p className="text-gray-700 mb-4">
        If you want your account and associated data removed from MeroVote, please follow the steps below.
      </p>

      <ol className="list-decimal list-inside text-gray-700 mb-4">
        <li>Send an email to <strong>gundriai@gmail.com</strong> with the subject "Data deletion request".</li>
        <li>Include the email address you used to sign up and any other identifying details.</li>
        <li>We will process your request within 30 days and confirm deletion by email.</li>
      </ol>

      <p className="text-gray-700">
        If you have questions, contact us at <strong>gundriai@gmail.com</strong>.
      </p>

      <p className="text-sm text-gray-500 mt-8">Last updated: 2025-11-22</p>
    </div>
  );
}
