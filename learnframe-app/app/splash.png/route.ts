import { redirect } from 'next/navigation';

export async function GET() {
  redirect('/splash.svg');
}
