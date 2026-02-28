"use client"

import { motion, Transition } from "framer-motion"
import { ReactNode } from "react"

interface AnimationProps {
    children: ReactNode
    delay?: number
    className?: string
}

const defaultTransition: Transition = {
    duration: 0.8,
    ease: "easeOut",
}

export const FadeInUp = ({ children, delay = 0, className = "" }: AnimationProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...defaultTransition, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const FadeInLeft = ({ children, delay = 0, className = "" }: AnimationProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...defaultTransition, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const FadeInRight = ({ children, delay = 0, className = "" }: AnimationProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...defaultTransition, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const StaggerContainer = ({
    children,
    delayChildren = 0,
    staggerChildren = 0.1,
    className = ""
}: AnimationProps & { delayChildren?: number; staggerChildren?: number }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren,
                        delayChildren,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const StaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: defaultTransition
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const HoverScale = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
