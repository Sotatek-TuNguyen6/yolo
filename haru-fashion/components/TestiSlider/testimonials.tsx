import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-600">Testimonials</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What our clients are saying
            </h2>
            <p className="max-w-2xl mx-auto mt-5 text-xl text-gray-500">
              Discover why people love working with us through their own words.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="relative p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1">
                  <p className="text-lg font-medium text-gray-900">
                    &quot;The attention to detail and the quality of the work
                    exceeded our expectations. The team was responsive and
                    delivered the project ahead of schedule.&quot;
                  </p>
                </blockquote>
              </div>
              <div className="flex items-center mt-6 space-x-3">
                <div className="flex-shrink-0">
                  <Image
                    className="w-10 h-10 rounded-full object-cover"
                    src="/placeholder.svg?height=40&width=40"
                    alt="Sarah Chen"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sarah Chen
                  </p>
                  <p className="text-sm text-gray-500">
                    Marketing Director, TechCorp
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="relative p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1">
                  <p className="text-lg font-medium text-gray-900">
                    &quot;Working with this team transformed our business. Their
                    innovative solutions helped us increase our revenue by 40%
                    in just three months.&quot;
                  </p>
                </blockquote>
              </div>
              <div className="flex items-center mt-6 space-x-3">
                <div className="flex-shrink-0">
                  <Image
                    className="w-10 h-10 rounded-full object-cover"
                    src="/placeholder.svg?height=40&width=40"
                    alt="Michael Johnson"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Michael Johnson
                  </p>
                  <p className="text-sm text-gray-500">CEO, Innovate Inc.</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="relative p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="flex-1">
                  <p className="text-lg font-medium text-gray-900">
                    &quot;The customer support is exceptional. They were always
                    available to answer our questions and guide us through the
                    implementation process.&quot;
                  </p>
                </blockquote>
              </div>
              <div className="flex items-center mt-6 space-x-3">
                <div className="flex-shrink-0">
                  <Image
                    className="w-10 h-10 rounded-full object-cover"
                    src="/placeholder.svg?height=40&width=40"
                    alt="Emily Rodriguez"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Emily Rodriguez
                  </p>
                  <p className="text-sm text-gray-500">
                    Product Manager, NextLevel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
