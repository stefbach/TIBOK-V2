import { signIn, signUp } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Se Connecter</TabsTrigger>
            <TabsTrigger value="signup">S'inscrire</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Accédez à votre compte pour continuer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action={signIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-in">Email</Label>
                    <Input id="email-in" name="email" type="email" placeholder="m@exemple.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-in">Mot de passe</Label>
                    <Input id="password-in" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Se Connecter
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>Créez un nouveau compte en quelques secondes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action={signUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name-up">Nom complet</Label>
                    <Input id="full_name-up" name="full_name" type="text" placeholder="Jean Dupont" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-up">Email</Label>
                    <Input id="email-up" name="email" type="email" placeholder="m@exemple.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-up">Mot de passe</Label>
                    <Input id="password-up" name="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Je suis un...</Label>
                    <RadioGroup defaultValue="patient" name="role" className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="patient" id="role-patient" />
                        <Label htmlFor="role-patient">Patient</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="doctor" id="role-doctor" />
                        <Label htmlFor="role-doctor">Médecin</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full">
                    Créer mon compte
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-lg">{searchParams.message}</p>
        )}
      </div>
    </div>
  )
}
