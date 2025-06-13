"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Testimonial {
  id: number
  content: string
  author: string
  role: string
}

export default function TestimonialsCarousel() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      content:
        "This product has completely transformed our workflow. The intuitive interface and powerful features have saved us countless hours of work.",
      author: "Alex Morgan",
      role: "CTO, TechSolutions",
    },
    {
      id: 2,
      content:
        "I've tried many similar products, but this one stands out for its reliability and exceptional customer support. Highly recommended!",
      author: "Jessica Lee",
      role: "Marketing Director, CreativeMinds",
    },
    {
      id: 3,
      content:
        "The implementation was seamless, and our team was able to adapt to it quickly. It's now an essential part of our daily operations.",
      author: "David Wilson",
      role: "Operations Manager, GlobalTech",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }
  }

  const prevTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentIndex])

  useEffect(() => {
    const autoplayTimer = setInterval(() => {
      nextTestimonial()
    }, 5000)

    return () => clearInterval(autoplayTimer)
  }, [])

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white sm:py-16 lg:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Our Clients Say</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </div>

          <div className="relative w-full max-w-3xl mt-12">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="px-6 py-10 sm:px-12 sm:py-16">
                <div className={`transition-opacity duration-500 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
                  <div className="flex justify-center mb-8">
                    <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                  </div>
                  <p className="text-xl font-medium text-center text-gray-900 md:text-2xl">
                    {testimonials[currentIndex].content}
                  </p>
                  <div className="flex flex-col items-center mt-8">
                    <div className="w-16 h-16 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[3px]">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <Image
                          className="w-14 h-14 rounded-full object-cover"
                          src="/placeholder.svg?height=56&width=56"
                          alt={testimonials[currentIndex].author}
                          width={56}
                          height={56}
                        />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-medium text-gray-900">{testimonials[currentIndex].author}</h3>
                      <p className="mt-1 text-sm text-gray-500">{testimonials[currentIndex].role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-0 z-10 p-2 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 -translate-x-1/2 hover:bg-gray-50"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 z-10 p-2 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 translate-x-1/2 hover:bg-gray-50"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentIndex === index ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
