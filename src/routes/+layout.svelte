<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from "mode-watcher";	
	import { SafeArea } from '@capacitor-community/safe-area'
	import { setLocale } from '$lib/i18n'

	let { children } = $props();	

	$effect(() => {
		// initializeUser()
		SafeArea.enable({
			config: {
				customColorsForSystemBars: true,
				statusBarColor: '#00000000', // transparent
				statusBarContent: 'light',
				navigationBarColor: '#00000000', // transparent
				navigationBarContent: 'light',
			},
		})
		// Try to get the locale from localStorage
		const storedLocale = localStorage.getItem('locale')
		if (storedLocale) {
			setLocale(storedLocale)
		}
	})


</script>

<ModeWatcher />
{@render children()}
