import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Loader2, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const signInSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

const signUpSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type SignInData = z.infer<typeof signInSchema>
type SignUpData = z.infer<typeof signUpSchema>

export function AuthPage() {
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in")
  const isSignIn = authView === "sign_in"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInData | SignUpData>({
    resolver: zodResolver(isSignIn ? signInSchema : signUpSchema),
    shouldFocusError: false,
  })

  useEffect(() => {
    reset()
    setError(null)
    setSignupSuccess(false)
    setFormKey((k) => k + 1)
  }, [authView, reset])

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [authView])

  useEffect(() => {
    if (error) {
      setShakeError(true)
      const t = setTimeout(() => setShakeError(false), 300)
      return () => clearTimeout(t)
    }
  }, [error])

  async function onSubmit(data: SignInData | SignUpData) {
    setLoading(true)
    setError(null)

    try {
      if (isSignIn) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (authError) {
          if (authError.message.includes("Invalid login")) {
            setError("Correo o contraseña incorrectos")
          } else {
            setError(authError.message)
          }
        }
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        })
        if (authError) {
          if (authError.message.includes("already registered")) {
            setError("Este correo ya está registrado")
          } else {
            setError(authError.message)
          }
        } else {
          setError(null)
          setSignupSuccess(true)
        }
      }
    } catch {
      setError("Ocurrió un error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div
            className="relative w-24 h-24 flex items-center justify-center mb-5 animate-fade-in-up"
          >
            <div className="absolute w-32 h-32 rounded-full bg-primary/15 blur-2xl" />
            <div className="relative w-20 h-20 rounded-3xl bg-card shadow-lg flex items-center justify-center overflow-hidden">
              <img src="/icono-definitivo.png" alt="Finanzas" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight text-foreground animate-fade-in-up"
            style={{ animationDelay: "80ms" }}
          >
            Finanzas
          </h1>
        </div>

        <div
          className="bg-card rounded-3xl shadow-lg border border-border/50 overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          {signupSuccess ? (
            <div className="flex flex-col items-center px-6 py-10">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pop-in">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h2
                className="text-xl font-semibold tracking-tight text-foreground animate-fade-in-up"
                style={{ animationDelay: "150ms" }}
              >
                ¡Revisa tu correo!
              </h2>
              <p
                className="text-sm text-muted-foreground text-center mt-2 animate-fade-in-up"
                style={{ animationDelay: "250ms" }}
              >
                Te enviamos un enlace para confirmar tu cuenta.
              </p>
              <button
                type="button"
                onClick={() => setAuthView("sign_in")}
                className="text-sm text-primary font-medium mt-6 animate-fade-in-up"
                style={{ animationDelay: "350ms" }}
              >
                Volver a iniciar sesión
              </button>
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-2 gap-1 p-1 m-4 mb-0 rounded-full bg-secondary animate-fade-in-up"
                style={{ animationDelay: "280ms" }}
              >
                {(["sign_in", "sign_up"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAuthView(v)}
                    className={cn(
                      "rounded-full py-2.5 text-[15px] font-semibold transition-all duration-200",
                      authView === v
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    {v === "sign_in" ? "Iniciar sesión" : "Crear cuenta"}
                  </button>
                ))}
              </div>

              <form
                key={formKey}
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 pt-5 space-y-4 animate-fade-in-up"
                style={{ animationDelay: "320ms" }}
              >
                <div>
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    autoComplete="email"
                    className="w-full rounded-full border border-border/70 bg-card px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-expense mt-1 px-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    autoComplete={isSignIn ? "current-password" : "new-password"}
                    className="w-full rounded-full border border-border/70 bg-card px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-expense mt-1 px-1">{errors.password.message}</p>
                  )}
                </div>

                {!isSignIn && (
                  <div className="animate-fade-in-up">
                    <input
                      type="password"
                      placeholder="Confirmar contraseña"
                      autoComplete="new-password"
                      className="w-full rounded-full border border-border/70 bg-card px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                      {...register("confirmPassword")}
                    />
                    {"confirmPassword" in errors && errors.confirmPassword && (
                      <p className="text-xs text-expense mt-1 px-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                )}

                {error && (
                  <p className={cn(
                    "text-sm text-expense text-center",
                    shakeError && "animate-shake",
                  )}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full py-4 text-[17px] font-semibold text-primary-foreground transition-all",
                    loading ? "bg-primary/60" : "bg-primary active:scale-[0.98]",
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isSignIn ? "Iniciando sesión…" : "Registrando…"}
                    </>
                  ) : (
                    isSignIn ? "Iniciar sesión" : "Crear cuenta"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
