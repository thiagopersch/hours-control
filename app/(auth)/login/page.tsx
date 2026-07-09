'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z
    .email('E-mail inválido.')
    .nonempty('E-mail é obrigatório.')
    .toLowerCase(),
  password: z
    .string()
    .nonempty('Senha é obrigatória.')
    .min(8, 'Mínimo de 8 caracteres.')
    .max(32, 'Máximo de 32 caracteres.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/,
      'Senha deve conter letra maiúscula, minúscula, número e caractere especial.',
    ),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Credenciais inválidas');
        return;
      }

      const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">HoursControl</CardTitle>
        <CardDescription>Faça login para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Senha</FieldLabel>
            <FieldContent>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" /> : null}
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
