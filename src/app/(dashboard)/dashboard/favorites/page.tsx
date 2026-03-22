import { redirect } from 'next/navigation';

export default function FavoritesPage() {
  redirect('/dashboard/profile?tab=favorites');
}
