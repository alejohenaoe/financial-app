import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/lib/supabase"
import { Wallet, Lock, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const localization = {
  variables: {
    sign_up: {
      email_label: "Correo electrónico",
      password_label: "Contraseña",
      email_input_placeholder: "Tu correo electrónico",
      password_input_placeholder: "Tu contraseña",
      button_label: "Registrarse",
      loading_button_label: "Registrando...",
      social_provider_text: "Iniciar sesión con {{provider}}",
      link_text: "¿No tienes una cuenta? Regístrate",
    },
    sign_in: {
      email_label: "Correo electrónico",
      password_label: "Contraseña",
      email_input_placeholder: "Tu correo electrónico",
      password_input_placeholder: "Tu contraseña",
      button_label: "Iniciar sesión",
      loading_button_label: "Iniciando sesión...",
      social_provider_text: "Iniciar sesión con {{provider}}",
      link_text: "¿Ya tienes una cuenta? Inicia sesión",
    },
    forgotten_password: {
      email_label: "Correo electrónico",
      password_label: "Contraseña",
      email_input_placeholder: "Tu correo electrónico",
      button_label: "Enviar instrucciones",
      loading_button_label: "Enviando...",
      link_text: "¿Olvidaste tu contraseña?",
    },
    update_password: {
      password_label: "Nueva contraseña",
      password_input_placeholder: "Tu nueva contraseña",
      button_label: "Actualizar contraseña",
      loading_button_label: "Actualizando...",
    },
  },
}

export function AuthPage() {
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in")
  const isSignIn = authView === "sign_in"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-sm">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Finanzas</h1>
          <p className="text-sm text-muted-foreground mt-1">Controla tus finanzas</p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className={cn("h-1", isSignIn ? "bg-primary" : "bg-income")} />
          <div className="p-6 pt-5">
            <div className="flex items-center gap-3 mb-1">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                isSignIn ? "bg-primary/10" : "bg-income/10"
              )}>
                {isSignIn ? (
                  <Lock className="h-5 w-5 text-primary" />
                ) : (
                  <UserPlus className="h-5 w-5 text-income" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {isSignIn ? "Iniciar sesión" : "Crear cuenta"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isSignIn ? "Bienvenido de vuelta" : "Únete a Finanzas"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  style: {
                    input: {
                      borderRadius: 12,
                      border: "1px solid #E5E5EA",
                      padding: "12px 16px",
                      fontSize: 16,
                      backgroundColor: "white",
                      outline: "none",
                    },
                    button: {
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 16,
                      height: 48,
                      backgroundColor: isSignIn ? "#007AFF" : "#34C759",
                      color: "white",
                      border: "none",
                    },
                    label: {
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#8E8E93",
                      marginBottom: 6,
                    },
                    container: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    },
                    anchor: {
                      display: "none",
                    },
                  },
                }}
                theme="light"
                providers={[]}
                localization={localization}
                view={authView}
              />
            </div>
            <button
              type="button"
              onClick={() => setAuthView(isSignIn ? "sign_up" : "sign_in")}
              className="text-sm text-primary font-medium mt-5 mx-auto block"
            >
              {isSignIn
                ? "¿No tienes una cuenta? Registrarse"
                : "¿Ya tienes una cuenta? Iniciar sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
