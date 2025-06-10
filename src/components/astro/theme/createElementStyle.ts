import configuration from './configuration'
import type { Size, Variant, ComponentElement, Style } from './configuration'

type CreateElementStyleOptions = {
    element: ComponentElement
    variant: Variant
    size: Size
}

function appendStyle(style: string[], newStyles: Style) {
    if (Array.isArray(newStyles)) {
        style.push(...newStyles)
    } else {
        style.push(newStyles)
    }
}

export default function createElementStyle(
    createElementStyleOptions: CreateElementStyleOptions,
    extraClassName: Style = ''
): Style {
    const elementConfiguration =
        configuration[createElementStyleOptions.element]

    const style: string[] = []

    appendStyle(style, elementConfiguration.base)
    appendStyle(
        style,
        elementConfiguration.size[createElementStyleOptions.size]
    )
    appendStyle(
        style,
        elementConfiguration.variant[createElementStyleOptions.variant]
    )
    appendStyle(style, extraClassName)

    return style
}
