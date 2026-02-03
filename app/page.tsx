import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  return (
    <main>
      <h1>ConectaTec</h1>
    </main>
  );
}
