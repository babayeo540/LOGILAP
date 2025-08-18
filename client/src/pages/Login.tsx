import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rabbit, Lock, User, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Schéma de validation pour la connexion
const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});
type LoginFormData = z.infer<typeof loginSchema>;

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z
    .string()
    .min(6, "Le mot de passe doit faire au moins 6 caractères"),
  role: z.enum(["employee", "manager"]),
});
type RegisterFormData = z.infer<typeof registerSchema>;

// Composant pour le formulaire d'inscription
function RegisterForm({ onBack }: { onBack: () => void }) {
  const [error, setError] = useState("");
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "employee",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Succès",
        description:
          "Compte créé avec succès. Vous pouvez maintenant vous connecter.",
      });
      onBack();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue lors de l'inscription.";
      setError(errorMessage);
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError("");
    registerMutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
          <CardDescription className="text-center">
            Entrez vos informations pour créer un nouveau compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre nom d'utilisateur"
                        {...field}
                        disabled={registerMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Créer un mot de passe"
                        {...field}
                        disabled={registerMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
                        disabled={registerMutation.isPending}
                      >
                        <option value="employee">Employé</option>
                        <option value="manager">Gestionnaire</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Création..." : "Créer le compte"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Retour à la connexion
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant principal pour la page de connexion
export default function Login() {
  const [, setLocation] = useLocation();
  const [showRegister, setShowRegister] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) =>
      apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (response) => {
      // Assuming a successful login response includes a redirection path or status
      setLocation("/home");
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté(e) !",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Échec de la connexion. Veuillez vérifier vos informations.";
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  if (showRegister) {
    return <RegisterForm onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Rabbit className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          LAPGEST-PRO
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Système de gestion cunicole professionnel
        </p>
      </div>

      <Card className="w-full max-w-sm dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center dark:text-gray-100">
            Connexion
          </CardTitle>
          <CardDescription className="text-center dark:text-gray-400">
            Connectez-vous pour accéder à votre tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre nom d'utilisateur"
                        {...field}
                        autoComplete="username"
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Votre mot de passe"
                        {...field}
                        autoComplete="current-password"
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowRegister(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Créer un compte
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}