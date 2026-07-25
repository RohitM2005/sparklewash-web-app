import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, CalendarDays, Sparkles, Play } from "lucide-react";
import VideoModal from "../common/VideoModal";

function HowItWorksSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Choose Your Plan",
      description:
        "Select a subscription plan that suits your car care needs.",
      icon: <CalendarDays className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 2,
      title: "Secure Online Payment",
      description:
        "Complete your payment securely using Razorpay gateway.",
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 3,
      title: "Service Activation",
      description:
        "Your subscription gets activated instantly after payment.",
      icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
    },
    {
      id: 4,
      title: "Regular Car Wash",
      description:
        "Our professional washers keep your car clean daily.",
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
    },
  ];

  return (
    <section id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            How It Works
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Subscribe in minutes and enjoy hassle-free car cleaning every day.
          </p>

          {/* Watch Video Button */}
          <button
            onClick={() => setIsVideoOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm sm:text-base font-medium shadow-md hover:bg-blue-700 transition"
          >
            <Play className="w-4 h-4" />
            Watch How It Works
          </button>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-xl transition duration-300"
            >
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {step.title}
              </h3>

              <p className="text-gray-500 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shared Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </section>
  );
}

export default HowItWorksSection;