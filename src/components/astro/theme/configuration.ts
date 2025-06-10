export type Style = string[] | string
export type ComponentElement = 'a'
export type Variant = 'default'
export type Size = 'default' | 'sm' | 'lg' | 'icon'
export type ComponentConfiguration = {
    base: Style
    variant: Record<Variant, Style>
    size: Record<Size, Style>
}

const configuration = Object.freeze({
    a: {
        base: '', // will be always applied
        variant: {
            default: '', // if no variant is selected this will be the default
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
