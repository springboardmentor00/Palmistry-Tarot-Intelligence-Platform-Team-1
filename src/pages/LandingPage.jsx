import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: "🖐️",
      title: "AI Palm Analysis",
      description:
        "Upload your palm image and receive AI-powered analysis with detailed insights.",
    },
    {
      icon: "🎴",
      title: "Tarot Reading",
      description:
        "Select tarot cards and get personalized predictions and guidance.",
    },
    {
      icon: "🧠",
      title: "Personality Intelligence",
      description:
        "Understand your personality using AI-powered palmistry and tarot insights.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1020] text-white">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Side */}
          <div>

            <h1 className="text-6xl font-bold leading-tight text-violet-300">
              AI Palmistry
              <br />
              & Tarot
              <br />
              Analysis
              <br />
              Platform
            </h1>

            <p className="text-gray-300 mt-8 text-xl leading-9">
              Upload your palm image, explore tarot readings and receive
              intelligent personality insights using Artificial Intelligence.
            </p>

            {!isAuthenticated && (
              <div className="mt-12 flex gap-8">

                <Link
                  to="/login"
                  className="bg-violet-600 hover:bg-violet-700 px-12 py-5 rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition duration-300"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="border-2 border-violet-500 hover:bg-violet-600 px-12 py-5 rounded-xl text-xl font-bold hover:scale-105 transition duration-300"
                >
                  Register
                </Link>

              </div>
            )}

            {isAuthenticated && (
              <div className="mt-12">
                <Link
                  to="/dashboard"
                  className="bg-violet-600 hover:bg-violet-700 px-12 py-5 rounded-xl text-xl font-bold shadow-lg"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}

          </div>

          {/* Right Side */}
          <div className="flex justify-center">

            <img
              src="/images/palm.png"
              alt="Palm"
              className="w-[500px] hover:scale-105 transition duration-300"
            />

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="py-20 bg-[#15172b]">

        <div className="max-w-7xl mx-auto px-8">

          <h2 className="text-4xl font-bold text-center text-violet-300 mb-14">
            Platform Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {features.map((feature, index) => (

              <div
                key={index}
                className="bg-[#1d2036] rounded-xl p-8 hover:scale-105 transition duration-300 shadow-lg"
              >
                <div className="text-5xl mb-5">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-semibold mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-300 text-lg">
                  {feature.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

    </div>
  );
};

export default LandingPage;
