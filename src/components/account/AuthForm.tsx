'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { loginCustomer, signupCustomer } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, FieldError, Input, Label } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

export const AuthForm = ({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) => {
  const t = useTranslations('account')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result =
      mode === 'login'
        ? await loginCustomer({ phone, password })
        : await signupCustomer({ name, phone, password })

    setPending(false)
    if (result.ok) {
      router.push('/account')
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <Card className="mt-8 p-6">
      <div className="mb-6 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-body-sm font-medium">
        {(['login', 'signup'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value)
              setError(null)
            }}
            className={cn(
              'rounded-full py-2 transition-colors',
              mode === value ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-400',
            )}
          >
            {value === 'login' ? t('loginTitle') : t('signup')}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' ? (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <Label htmlFor="auth-name">{tCommon('name')}</Label>
            <Input
              id="auth-name"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </motion.div>
        ) : null}

        <div>
          <Label htmlFor="auth-phone">{tCommon('phone')}</Label>
          <Input
            id="auth-phone"
            required
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="01012345678"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="auth-password">{t('password')}</Label>
          <Input
            id="auth-password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <FieldError>{error ? tCommon('error') : null}</FieldError>
        </div>

        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {mode === 'login' ? t('loginTitle') : t('signup')}
        </Button>
      </form>
    </Card>
  )
}
