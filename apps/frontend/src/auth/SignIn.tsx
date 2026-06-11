import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function SignIn({ notAdmin = false }: { notAdmin?: boolean }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Inloggningen misslyckades",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 shadow-xl backdrop-blur"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 text-primary mb-4">
            <Lock className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-semibold text-white">Admininloggning</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Den här sidan är endast för administratörer.
          </p>
        </div>

        {notAdmin && (
          <p className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm px-3 py-2">
            Det här kontot har inte adminbehörighet.
          </p>
        )}

        <label className="block mb-4">
          <span className="block text-sm text-neutral-300 mb-1.5">E-post</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-black/40 border border-neutral-700 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </label>

        <label className="block mb-5">
          <span className="block text-sm text-neutral-300 mb-1.5">
            Lösenord
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-black/40 border border-neutral-700 px-3 py-2.5 text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary py-2.5 font-medium text-white hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Loggar in…" : "Logga in"}
        </button>
      </form>
    </div>
  );
}
