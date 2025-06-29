import Pipe from '@/lib/fp/pipe'
import type {
    QwikMouseEvent,
    QwikKeyboardEvent,
    NoSerialize,
} from '@builder.io/qwik'
import {
    component$,
    useSignal,
    useStore,
    $,
    noSerialize,
} from '@builder.io/qwik'

interface CarouselImage
    extends Pick<HTMLImageElement, 'src'>,
        Partial<Pick<HTMLImageElement, 'srcset' | 'alt' | 'loading'>> {}

interface CarouselProps {
    imgs: CarouselImage[]
    autoPlay?: boolean
    autoPlayInterval?: number
    showDots?: boolean
    showArrows?: boolean
    class?: string
}

const Carousel = component$<CarouselProps>((props) => {
    const {
        imgs: items,
        autoPlay = false,
        autoPlayInterval = 3000,
        showDots = true,
        showArrows = true,
        class: className = '',
    } = props

    const currentIndex = useSignal(0)
    const isTransitioning = useSignal(false)
    const containerRef = useSignal<HTMLDivElement>()

    const store = useStore({
        touchStartX: 0,
        touchEndX: 0,
        autoPlayTimer: null as NoSerialize<NodeJS.Timeout> | null,
    })

    // Navigation functions
    const goToSlide = $((index: number) => {
        if (isTransitioning.value || index === currentIndex.value) return

        isTransitioning.value = true
        currentIndex.value = index

        setTimeout(() => {
            isTransitioning.value = false
        }, 300)
    })

    const nextSlide = $(() => {
        const nextIndex = (currentIndex.value + 1) % items.length
        goToSlide(nextIndex)
    })

    const prevSlide = $(() => {
        const prevIndex =
            currentIndex.value === 0 ? items.length - 1 : currentIndex.value - 1
        goToSlide(prevIndex)
    })

    // Auto-play functionality
    const startAutoPlay = $(() => {
        if (!autoPlay) return

        if (store.autoPlayTimer) {
            clearInterval(store.autoPlayTimer)
        }

        store.autoPlayTimer = Pipe.of(
            setInterval(() => {
                nextSlide()
            }, autoPlayInterval)
        ).map(noSerialize).value
    })

    const stopAutoPlay = $(() => {
        if (store.autoPlayTimer) {
            clearInterval(store.autoPlayTimer)
            store.autoPlayTimer = null
        }
    })

    // Touch/Swipe handlers
    const handleTouchStart = $((e: TouchEvent) => {
        store.touchStartX = e?.touches?.[0]?.clientX ?? 0
    })

    const handleTouchMove = $((e: TouchEvent) => {
        store.touchEndX = e?.touches[0]?.clientX ?? 0
    })

    const handleTouchEnd = $(() => {
        if (!store.touchStartX || !store.touchEndX) return

        const distance = store.touchStartX - store.touchEndX
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            nextSlide()
        } else if (isRightSwipe) {
            prevSlide()
        }
    })

    // Keyboard navigation
    const handleKeyDown = $((e: QwikKeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault()
                prevSlide()
                break
            case 'ArrowRight':
                e.preventDefault()
                nextSlide()
                break
            case 'Home':
                e.preventDefault()
                goToSlide(0)
                break
            case 'End':
                e.preventDefault()
                goToSlide(items.length - 1)
                break
        }
    })

    // Mouse handlers for auto-play
    const handleMouseEnter = $(() => {
        if (autoPlay) stopAutoPlay()
    })

    const handleMouseLeave = $(() => {
        if (autoPlay) startAutoPlay()
    })

    // Start auto-play on component mount
    if (autoPlay) {
        setTimeout(() => startAutoPlay(), 100)
    }

    return (
        <div
            ref={containerRef}
            class={`relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg shadow-lg ${className}`}
            onKeyDown$={handleKeyDown}
            onMouseEnter$={handleMouseEnter}
            onMouseLeave$={handleMouseLeave}
            tabIndex={0}
            role="region"
            aria-label="Image carousel"
        >
            {/* Main carousel container */}
            <div
                class="flex transition-transform duration-300 ease-in-out"
                style={{
                    transform: `translateX(-${currentIndex.value * 100}%)`,
                }}
                onTouchStart$={handleTouchStart}
                onTouchMove$={handleTouchMove}
                onTouchEnd$={handleTouchEnd}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        class="w-full flex-shrink-0 relative"
                        aria-hidden={index !== currentIndex.value}
                    >
                        <img
                            alt={`Slide ${index + 1}`}
                            class="w-full h-64 md:h-96 object-cover"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            {...item}
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                ))}
            </div>

            {/* Navigation arrows */}
            {showArrows && (
                <>
                    <button
                        onClick$={prevSlide}
                        disabled={isTransitioning.value}
                        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Previous slide"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <button
                        onClick$={nextSlide}
                        disabled={isTransitioning.value}
                        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Next slide"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {showDots && (
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick$={() => goToSlide(index)}
                            disabled={isTransitioning.value}
                            class={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                index === currentIndex.value
                                    ? 'bg-white scale-110'
                                    : 'bg-white/60 hover:bg-white/80'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Slide counter */}
            <div class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentIndex.value + 1} / {items.length}
            </div>
        </div>
    )
})

/**
 * Demo component showing the carousel in action
 *
 * @todo when I will introduce storybook I will put this there
 */
export const CarouselExample = component$(() => {
    // Sample images (you can replace with your own)
    const sampleImages = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=400&fit=crop',
    ]

    return (
        <div class="min-h-screen bg-gray-100 py-8">
            <div class="container mx-auto px-4">
                <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
                    Basic Qwik Carousel
                </h1>

                <div class="mb-8">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700">
                        Auto-play Carousel
                    </h2>
                    <Carousel
                        imgs={[]}
                        autoPlay={true}
                        autoPlayInterval={4000}
                        class="mb-8"
                    />
                </div>

                <div class="mb-8">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700">
                        Manual Navigation Only
                    </h2>
                    <Carousel
                        imgs={[]}
                        autoPlay={false}
                        showDots={true}
                        showArrows={true}
                    />
                </div>

                <div class="text-center text-gray-600 mt-8">
                    <p class="mb-2">
                        <strong>Features:</strong>
                    </p>
                    <ul class="inline-block text-left space-y-1">
                        <li>• Touch/swipe support on mobile</li>
                        <li>• Keyboard navigation (Arrow keys, Home, End)</li>
                        <li>• Auto-play with pause on hover</li>
                        <li>• Dot indicators</li>
                        <li>• Navigation arrows</li>
                        <li>• Responsive design</li>
                        <li>• Accessibility features</li>
                    </ul>
                </div>
            </div>
        </div>
    )
})

export default Carousel
