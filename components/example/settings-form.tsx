'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export interface UserSettings {
	emailNotifications: boolean
	pushNotifications: boolean
	darkMode: boolean
	bio: string
	autoSave: boolean
}

interface SettingsFormProps {
	initialSettings: UserSettings
	onSave?: (settings: UserSettings) => Promise<void>
	onReset?: () => void
	isLoading?: boolean
}

export default function SettingsForm({ initialSettings, onSave, onReset, isLoading = false }: SettingsFormProps) {
	const [settings, setSettings] = useState<UserSettings>(initialSettings)
	const [isSaving, setIsSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
		setSettings(prev => {
			const newSettings = { ...prev, [key]: value }
			setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(initialSettings))
			return newSettings
		})
	}

	const handleSave = async () => {
		if (!onSave || !hasChanges) return

		setIsSaving(true)
		try {
			await onSave(settings)
			setHasChanges(false)
		} catch (error) {
			console.error('Failed to save settings:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleReset = () => {
		setSettings(initialSettings)
		setHasChanges(false)
		onReset?.()
	}

	return (
		<Card className="w-full max-w-2xl" data-testid="settings-form">
			<CardHeader>
				<CardTitle>User Settings</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Notification Settings */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Notifications</h3>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="email-notifications" className="text-sm font-medium">
								Email Notifications
							</label>
							<p className="text-sm text-muted-foreground">Receive notifications via email</p>
						</div>
						<Switch
							id="email-notifications"
							checked={settings.emailNotifications}
							onCheckedChange={checked => updateSetting('emailNotifications', checked)}
							data-testid="email-notifications-switch"
						/>
					</div>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="push-notifications" className="text-sm font-medium">
								Push Notifications
							</label>
							<p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
						</div>
						<Switch
							id="push-notifications"
							checked={settings.pushNotifications}
							onCheckedChange={checked => updateSetting('pushNotifications', checked)}
							data-testid="push-notifications-switch"
						/>
					</div>
				</div>

				{/* Appearance Settings */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Appearance</h3>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="dark-mode" className="text-sm font-medium">
								Dark Mode
							</label>
							<p className="text-sm text-muted-foreground">Switch to dark theme</p>
						</div>
						<Switch
							id="dark-mode"
							checked={settings.darkMode}
							onCheckedChange={checked => updateSetting('darkMode', checked)}
							data-testid="dark-mode-switch"
						/>
					</div>
				</div>

				{/* Profile Settings */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Profile</h3>

					<div className="space-y-2">
						<label htmlFor="bio" className="text-sm font-medium">
							Bio
						</label>
						<Textarea
							id="bio"
							placeholder="Tell us a little about yourself..."
							value={settings.bio}
							onChange={e => updateSetting('bio', e.target.value)}
							className="min-h-[100px]"
							data-testid="bio-textarea"
						/>
						<p className="text-xs text-muted-foreground">{settings.bio.length}/500 characters</p>
					</div>
				</div>

				{/* Auto-save Setting */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Preferences</h3>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="auto-save" className="text-sm font-medium">
								Auto-save
							</label>
							<p className="text-sm text-muted-foreground">Automatically save changes as you type</p>
						</div>
						<Switch
							id="auto-save"
							checked={settings.autoSave}
							onCheckedChange={checked => updateSetting('autoSave', checked)}
							data-testid="auto-save-switch"
						/>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-between pt-6 border-t">
					<Button
						variant="outline"
						onClick={handleReset}
						disabled={!hasChanges || isSaving || isLoading}
						data-testid="reset-button"
					>
						Reset
					</Button>

					<div className="flex gap-2">
						{hasChanges && <span className="text-sm text-muted-foreground self-center">Unsaved changes</span>}
						<Button onClick={handleSave} disabled={!hasChanges || isSaving || isLoading} data-testid="save-button">
							{isSaving || isLoading ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
