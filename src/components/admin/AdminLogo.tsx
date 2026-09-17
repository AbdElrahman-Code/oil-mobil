import React from 'react'

/** Brand lockup shown on the admin login screen. */
export const AdminLogo = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/brand/logo.png" alt="Drift" style={{ height: 64, width: 'auto' }} />
)

/** Square mark used in the admin nav. */
export const AdminIcon = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/brand/mark-tile.png" alt="" width={34} height={34} style={{ borderRadius: 9 }} aria-hidden="true" />
)

export default AdminLogo
