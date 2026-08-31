import { listBrands } from '@/actions/oil-finder'
import { CarPicker } from './CarPicker'

/** Loads the brand list once and mounts the picker for the whole app. */
export const GarageProvider = async () => {
  const brands = await listBrands()
  return <CarPicker brands={brands} />
}
