import { useState, useRef, useEffect } from "react";
import { CheckCircle, CreditCard, CalendarDays, Sparkles, Play } from "lucide-react";

function HowItWorksSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef(null);

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

  // Pause video and re-enable scroll when closing
  useEffect(() => {
    if (isVideoOpen) {
      document.body.style.overflow = "hidden";
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      document.body.style.overflow = "";
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      document.body.style.overflow = "";
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isVideoOpen]);

  return (
    <section id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
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
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
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
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                See SparkleWash in Action
              </h3>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-sm"
              >
                Close
              </button>
            </div>

            <div className="relative bg-black">
              <video
                ref={videoRef}
                controls
                className="w-full h-[220px] sm:h-[320px] lg:h-[420px] object-cover"
              >
                <source src="/assets/how-it-works.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HowItWorksSection;