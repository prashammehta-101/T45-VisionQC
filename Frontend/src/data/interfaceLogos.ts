export type InterfaceLogo = { id: 'react' | 'typescript' | 'vite' | 'tailwind' | 'motion' | 'lucide'; name: string }
export const interfaceLogos: InterfaceLogo[] = [
  { id: 'react', name: 'React' },
  { id: 'tailwind', name: 'Tailwind CSS' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'motion', name: 'Motion' },
  { id: 'vite', name: 'Vite' },
  { id: 'lucide', name: 'Lucide' },
]
export const secondLogoRow = [interfaceLogos[2], interfaceLogos[3], interfaceLogos[0], interfaceLogos[5], interfaceLogos[1], interfaceLogos[4]]
