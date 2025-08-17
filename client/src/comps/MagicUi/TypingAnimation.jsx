
import React, { useEffect, useRef, useState } from "react";

// Utility function to combine class names (replaces cn from utils)
const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// Simple useInView hook implementation
const useInView = (ref, options = {}) => {
    const [isInView, setIsInView] = useState(false);
    const { amount = 0.3, once = true } = options;

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (once) {
                        observer.unobserve(element);
                    }
                } else if (!once) {
                    setIsInView(false);
                }
            },
            {
                threshold: amount,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [ref, amount, once]);

    return isInView;
};

// Typing Animation Component
export function TypingAnimation({
    children,
    className,
    duration = 30,
    delay = 0,
    as = "div",
    startOnView = false,
    ...props
}) {
    const Component = as;
    const [displayedText, setDisplayedText] = useState("");
    const [started, setStarted] = useState(false);
    const elementRef = useRef(null);
    const hiddenTextRef = useRef(null);
    const isInView = useInView(elementRef, {
        amount: 0.3,
        once: true,
    });

    useEffect(() => {
        if (!startOnView) {
            const startTimeout = setTimeout(() => {
                setStarted(true);
            }, delay);
            return () => clearTimeout(startTimeout);
        }
        if (!isInView) return;
        const startTimeout = setTimeout(() => {
            setStarted(true);
        }, delay);
        return () => clearTimeout(startTimeout);
    }, [delay, startOnView, isInView]);

    useEffect(() => {
        if (!started) return;
        const graphemes = Array.from(children);
        let i = 0;
        const typingEffect = setInterval(() => {
            if (i < graphemes.length) {
                setDisplayedText(graphemes.slice(0, i + 1).join(""));
                i++;
            } else {
                clearInterval(typingEffect);
            }
        }, duration);

        return () => {
            clearInterval(typingEffect);
        };
    }, [children, duration, started]);

    return (
        <Component
            ref={elementRef}
            className={cn(
                "text-4xl font-bold  tracking-[-0.02em] relative",
                className
            )}
            {...props}
        >
            {/* Hidden text to maintain layout */}
            <span
                ref={hiddenTextRef}
                className="invisible"
                aria-hidden="true"
            >
                {children}
            </span>
            {/* Visible typing text */}
            <span
                className="absolute top-0 left-0"
                style={{ whiteSpace: 'pre-wrap' }}
            >
                {displayedText}
            </span>
        </Component>
    );
}