import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/lib/supabase"
import { Wallet } from "lucide-react"

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
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]}
            localization={localization}
          />
        </div>
      </div>
    </div>
  )
}
