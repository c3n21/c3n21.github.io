import configuration from './configuration'
import type { Size, Variant, ComponentElement, Style } from './configuration'

type CreateElementStyleOptions = {
    element: ComponentElement
    variant: Variant
    size: Size
}

export default function createElementStyle(
    createElementStyleOptions: CreateElementStyleOptions,
    extraClassName: Style = ''
): Style {
    const elementConfiguration =
        configuration[createElementStyleOptions.element]

    const style = [
        elementConfiguration.base,
        elementConfiguration.size[createElementStyleOptions.size],
        elementConfiguration.variant[createElementStyleOptions.variant],
    ]

    if (Array.isArray(extraClassName)) {
        style.push(...extraClassName)
    } else {
        style.push(extraClassName)
    }

    return style
}
