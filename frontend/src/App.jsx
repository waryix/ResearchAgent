import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {!session ? <Auth /> : <Dashboard session={session} />}
    </div>
  );
}

export default App;
