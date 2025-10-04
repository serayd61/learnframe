import { redirect } from 'next/navigation';

export async function GET() {
  redirect('/icon.svg');
}
