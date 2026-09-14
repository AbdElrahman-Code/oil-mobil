import React from 'react'

/** Wordmark shown on the admin login screen. */
export const AdminLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <AdminIcon />
    <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Service Center</span>
  </div>
)

export const AdminIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
    <rect width="34" height="34" rx="9" fill="#F26B1D" />
    <path
      d="M17 8c3.6 4.2 5.6 7.2 5.6 9.9A5.6 5.6 0 0 1 17 23.5a5.6 5.6 0 0 1-5.6-5.6C11.4 15.2 13.4 12.2 17 8Z"
      fill="#fff"
    />
  </svg>
)

export default AdminLogo
