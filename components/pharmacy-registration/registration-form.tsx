"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

interface PharmacyRegistrationFormProps {
  onBack: () => void
  onSuccess: () => void
}

interface FormData {
  pharmacyName: string
  fullAddress: string
  responsiblePharmacist: string
  licenseNumber: string
  phone: string
  email: string
  deliveryZone: string
  acceptTerms: boolean
}

export function PharmacyRegistrationForm({ onBack, onSuccess }: PharmacyRegistrationFormProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const [formData, setFormData] = useState<FormData>({
    pharmacyName: "",
    fullAddress: "",
    responsiblePharmacist: "",
    licenseNumber: "",
    phone: "",
    email: "",
    deliveryZone: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const deliveryZones = [
    { value: "port-louis", labelKey: "deliveryZonePortLouis" },
    { value: "curepipe", labelKey: "deliveryZoneCurepipe" },
    { value: "rose-hill", labelKey: "deliveryZoneRoseHill" },
    { value: "quatre-bornes", labelKey: "deliveryZoneQuatreBornes" },
    { value: "vacoas-phoenix", labelKey: "deliveryZoneVacoasPhoenix" },
    { value: "other", labelKey: "deliveryZoneOther" },
  ]

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    let isValid = true

    if (!formData.pharmacyName.trim()) {
      newErrors.pharmacyName = t.fieldRequiredError
      isValid = false
    }
    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = t.fieldRequiredError
      isValid = false
    }
    if (!formData.responsiblePharmacist.trim()) {
      newErrors.responsiblePharmacist = t.fieldRequiredError
      isValid = false
    }
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = t.fieldRequiredError
      isValid = false
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t.fieldRequiredError
      isValid = false
    }
    if (!formData.email.trim()) {
      newErrors.email = t.fieldRequiredError
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.invalidEmailError
      isValid = false
    }
    if (!formData.deliveryZone) {
      newErrors.deliveryZone = t.fieldRequiredError
      isValid = false
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t.acceptTermsError
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validate()) {
      console.log("Form Data Submitted:", formData)
      // Here you would typically send data to a server
      onSuccess()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, deliveryZone: value }))
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        {t.pharmacyRegistrationFormTitle}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl">
        <div>
          <Label htmlFor="pharmacyName">{t.pharmacyNameLabel} *</Label>
          <Input
            id="pharmacyName"
            name="pharmacyName"
            value={formData.pharmacyName}
            onChange={handleChange}
            placeholder={t.pharmacyNamePlaceholder}
            required
            className="mt-1"
          />
          {errors.pharmacyName && <p className="text-sm text-red-600 mt-1">{errors.pharmacyName}</p>}
        </div>

        <div>
          <Label htmlFor="fullAddress">{t.fullAddressLabel} *</Label>
          <Textarea
            id="fullAddress"
            name="fullAddress"
            value={formData.fullAddress}
            onChange={handleChange}
            placeholder={t.fullAddressPlaceholder}
            required
            className="mt-1"
            rows={3}
          />
          {errors.fullAddress && <p className="text-sm text-red-600 mt-1">{errors.fullAddress}</p>}
        </div>

        <div>
          <Label htmlFor="responsiblePharmacist">{t.responsiblePharmacistLabel} *</Label>
          <Input
            id="responsiblePharmacist"
            name="responsiblePharmacist"
            value={formData.responsiblePharmacist}
            onChange={handleChange}
            placeholder={t.responsiblePharmacistPlaceholder}
            required
            className="mt-1"
          />
          {errors.responsiblePharmacist && <p className="text-sm text-red-600 mt-1">{errors.responsiblePharmacist}</p>}
        </div>

        <div>
          <Label htmlFor="licenseNumber">{t.licenseNumberLabel} *</Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder={t.licenseNumberPlaceholder}
            required
            className="mt-1"
          />
          {errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>}
        </div>

        <div>
          <Label htmlFor="phone">{t.phoneLabel} *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t.phonePlaceholder}
            required
            className="mt-1"
          />
          {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="email">{t.emailLabel} *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t.emailPlaceholder}
            required
            className="mt-1"
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="deliveryZone">{t.deliveryZoneLabel} *</Label>
          <Select name="deliveryZone" value={formData.deliveryZone} onValueChange={handleSelectChange} required>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder={t.deliveryZoneSelectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {deliveryZones.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {t[zone.labelKey as keyof typeof t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.deliveryZone && <p className="text-sm text-red-600 mt-1">{errors.deliveryZone}</p>}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, acceptTerms: Boolean(checked) }))}
            required
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="acceptTerms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              dangerouslySetInnerHTML={{ __html: t.acceptTermsLabel }}
            />
          </div>
        </div>
        {errors.acceptTerms && <p className="text-sm text-red-600 -mt-3">{errors.acceptTerms}</p>}

        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
            {t.backButtonText}
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            {t.submitRegistrationButtonText}
          </Button>
        </div>
      </form>
    </div>
  )
}
