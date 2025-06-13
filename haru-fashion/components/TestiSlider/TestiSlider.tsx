import { FC} from "react";

import Testimonials from "./testimonials";
import TestimonialsCarousel from "./testimonials-carousel";
import TestimonialsGrid from "./testimonials-grid";


// animate__lightSpeedInRight
const TestiSlider: FC = () => {

  return (
    <main>
      {/* <TestimonialsCarousel /> */}
      <TestimonialsGrid />
      {/* <Testimonials /> */}
    </main>
  );
};

export default TestiSlider;
