export type Style = string[] | string
export type ComponentElement = 'a'
export type Variant = 'default' | 'outline'
export type Size = 'default' | 'sm' | 'lg' | 'icon'
export type ComponentConfiguration = {
    base: Style
    variant: Record<Variant, Style>
    size: Record<Size, Style>
}

const configuration = Object.freeze({
    a: {
        base: [
            'inline-flex',
            'items-center',
            'justify-center',
            'gap-2',
            'whitespace-nowrap',
            'rounded-md',
            'text-sm',
            'font-medium',
            'ring-offset-background',
            'transition-colors',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-ring',
            'focus-visible:ring-offset-2',
            'disabled:pointer-events-none',
            'disabled:opacity-50',
            '[&_svg]:pointer-events-none',
            '[&_svg]:size-4',
            '[&_svg]:shrink-0',
        ], // will be always applied
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90', // if no variant is selected this will be the default
            outline:
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        },
        size: {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10',
        },
    },
} satisfies Record<ComponentElement, ComponentConfiguration>)

export default configuration
